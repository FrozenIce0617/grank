import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import User from 'Queries/user';
import Raven from 'raven-js';
import createRavenMiddleware from 'raven-for-redux';
import { reducer as formReducer } from 'redux-form';
import {
  outerReducer,
  innerReducer,
  middleware as asyncMiddleware,
} from 'redux-async-initial-state';
import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import config from 'config';
import { redirectToExternalUrl } from 'Utilities/underdash';
import Storage from './Utilities/storage';
import OrderPlanReducer from './Reducers/OrderPlanReducer';
import UserReducer from './Reducers/UserReducer';
import LoadingReducer from './Reducers/LoadingReducer';
import ModalReducer from './Reducers/ModalReducer';
import FilterReducer from './Reducers/FilterReducer';
import ReportTemplateReducer from './Reducers/ReportTemplateReducer';
import ScrollReducer from './Reducers/ScrollReducer';
import TableReducer from 'Reducers/TableReducer';
import OverviewPageReducer from 'Reducers/OverviewPageReducer';
import KeywordsTableReducer from 'Reducers/KeywordsTableReducer';
// import PointOfInterestReducer from 'Reducers/PointOfInterestReducer';
import GoogleAccountsReducer from 'Reducers/GoogleAccountsReducer';
import SalesMetricsReducer from 'Reducers/SalesMetricsReducer';
import { showDemoContentModal } from 'Actions/DemoContentAction';
import { parseValue, FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import { initFilters, updateFilterGroups } from 'Actions/FilterAction';
Raven.config(config.services.sentry, {
  release: COMMITHASH, // eslint-disable-line
}).install();

import thunk from 'redux-thunk';
import { ApolloClient } from 'apollo-client';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { setContext } from 'apollo-link-context';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';

import { CLEAR_EVERYTHING } from 'Actions/ResetAction';

// Middleware
import reduxFormMiddleware from 'Middlewares/reduxFormMiddleware';
import localeMiddleware from 'Middlewares/localeMiddleware';

// const HttpLinkClass = process.env.NODE_ENV === 'fakeapi' ? HttpLink : BatchHttpLink;
// const HttpLinkClass = HttpLink;
// TODO The batching link does not add cookies
// https://github.com/apollographql/apollo-link/issues/44
const networkInterfaceOptions = {
  fetch,
  uri: `${config.graphqlEndpoint}`,
  credentials: config.credentials || 'same-origin',
  queryDeduplication: true,
};

if (process.env.NODE_ENV !== 'fakeapi') networkInterfaceOptions.batchInterval = 10;

const appReducer = combineReducers({
  form: formReducer,
  orderPlan: OrderPlanReducer,
  user: UserReducer,
  asyncInitialState: innerReducer,
  loadingOverlay: LoadingReducer,
  modal: ModalReducer,
  filter: FilterReducer,
  reportTemplate: ReportTemplateReducer,
  table: TableReducer,
  scrollToElement: ScrollReducer,
  googleAccounts: GoogleAccountsReducer,
  overviewPage: OverviewPageReducer,
  salesMetrics: SalesMetricsReducer,
  keywordsTable: KeywordsTableReducer,
  // pointOfInterest: PointOfInterestReducer,
});

const rootReducer = (state, action) => {
  if (action.type === CLEAR_EVERYTHING) {
    state = undefined;
  }
  return appReducer(state, action);
};

const reducers = outerReducer(rootReducer);

const domainsQuery = gql`
  query store_domainList {
    domainsList {
      id
    }
  }
`;

let middlewareLink;
if (process.env.NODE_ENV === 'fakeapi') {
  middlewareLink = setContext(() => {
    const token = Storage.getFromAll('authToken');
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return {
      headers: {},
    };
  });
} else {
  middlewareLink = setContext(() => {
    const token = Storage.getFromAll('authToken');
    const headers = {
      'X-Frontend-Version': BUILDNUMBER + '.' + COMMITHASH, // eslint-disable-line
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return { headers };
  });
  middlewareLink = middlewareLink.concat(
    onError(({ graphQLErrors, networkError }) => {
      if (!isEmpty(graphQLErrors) || networkError) {
        if (networkError) {
          // 500
          // redirectToExternalUrl('/app/error/500');
          console.error(`[Network error]: ${networkError}`);
        } else {
          const errorMessages = graphQLErrors.reduce((messages, error) => {
            messages.push(error.message);
            return messages;
          }, []);

          if (graphQLErrors.filter(e => e.message.includes('500')).length > 0) {
            graphQLErrors.forEach(({ message, locations, path }) => {
              const errorMessage = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
              console.error(errorMessage);
              Raven.captureException(errorMessage);
            });

            // 500
            redirectToExternalUrl(
              `/app/error/500/${Raven.lastEventId()}?errors=${encodeURI(errorMessages)}`,
            );
          } else if (graphQLErrors.filter(e => e.message.includes('404')).length > 0) {
            // 404
            redirectToExternalUrl(`/app/error/404?errors=${encodeURI(errorMessages)}`);
          } else if (graphQLErrors.filter(e => e.message.includes('401')).length > 0) {
            // 401
            redirectToExternalUrl(`/user/login/?next=${window.location.pathname}`);
          } else if (graphQLErrors.filter(e => e.message.includes('405')).length > 0) {
            // 405
            // show modal that user dont have access to this account
            showDemoContentModal();
          } else {
            graphQLErrors.forEach(({ message, locations, path }) => {
              const errorMessage = `[Unhandled GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
              console.error(errorMessage);
              Raven.captureException(errorMessage);
            });
          }
        }
      }
    }),
  );
}

const combinedLink = ApolloLink.split(
  ({ query }) => {
    // Only send subscriptions through the websocket
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  new WebSocketLink(
    new SubscriptionClient(`${config.graphqlWebSocketEndpoint}`, {
      reconnect: true,
      lazy: true,
    }),
  ),
  middlewareLink.concat(createHttpLink(networkInterfaceOptions)),
);

export const apolloClient = new ApolloClient({
  link: combinedLink,
  cache: new InMemoryCache({ addTypename: true }),
  queryDeduplication: true,
});

// TODO we should not use redux store for storing graphql data
// as it's not updating when graphql cache is updating
export const loadStore = getCurrentState =>
  apolloClient.query({ query: User.queries.getUser }).then(userResponse => {
    if (userResponse.data.user.isAuthenticated) {
      return apolloClient.query({ query: domainsQuery }).then(domainResponse => {
        const domainIds = domainResponse.data.domainsList.map(domain => domain.id);
        const domainsFilter = {
          attribute: FilterAttribute.DOMAINS,
          type: FilterValueType.LIST,
          comparison: FilterComparison.CONTAINS,
          value: domainIds,
        };

        const savedFilters = userResponse.data.user.savedFilters.map(userSavedFilter => ({
          ...userSavedFilter,
          filters: JSON.parse(userSavedFilter.filters).map(filter => ({
            ...filter,
            value: parseValue(filter),
          })),
        }));

        const filterStore = {
          ...FilterReducer(
            FilterReducer(getCurrentState().filter, initFilters(domainsFilter)),
            updateFilterGroups(savedFilters),
          ),
        };
        return {
          ...getCurrentState(),
          user: { ...userResponse.data.user, debug: false },
          filter: {
            ...filterStore,
            pristine: true,
            defaultCompareTo: userResponse.data.user.defaultCompareTo,
          },
        };
      });
    }

    return {
      ...getCurrentState(),
      user: { ...userResponse.data.user, debug: false },
    };
  });

const store = createStore(
  reducers,
  composeWithDevTools(
    applyMiddleware(
      thunk,
      asyncMiddleware(loadStore),
      localeMiddleware,
      reduxFormMiddleware,
      LogRocket.reduxMiddleware(),
      createRavenMiddleware(Raven),
    ),
  ),
);

export { store };
