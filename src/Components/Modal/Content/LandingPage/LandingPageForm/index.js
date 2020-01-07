// @flow
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { compose, graphql, withApollo } from 'react-apollo';
import type { FilterBase } from 'Types/Filter';
import gql from 'graphql-tag';
import { FormGroup } from 'reactstrap';
import Toast from 'Components/Toast';
import LoadingSpinner from 'Components/LoadingSpinner';

import { SelectAsync } from 'Components/Forms/Fields';
import Button from 'Components/Forms/Button';
import Skeleton from 'Components/Skeleton';

import underdash from 'Utilities/underdash';
import Validator from 'Utilities/validation';
import { t } from 'Utilities/i18n';

type LandingPage = {
  id: string,
  path: string,
};

type Props = {
  ids: Array<Number>, // IDs of the keywords
  shouldExclude: boolean,
  handleSubmit: Function,
  setLandingPage: Function,
  invalid: Boolean,
  submitting: Boolean,
  domain: string,
  filters: FilterBase[],
  match: Object,
  client: Object,
  reset: Function,
  optimisticUpdate: Function,
  onClose: Function,
};

type State = {
  landingPages: LandingPage[],
};

const searchUrlsQuery = gql`
  query landingPageForm_searchLandingPages($domains: [ID]!, $query: String!) {
    urls(domains: $domains, query: $query) {
      id
      path
    }
  }
`;

class LandingPageForm extends Component<Props, State> {
  state = {
    landingPages: [],
  };

  getKeywordsInput = () => {
    const { ids, shouldExclude, filters } = this.props;
    return shouldExclude
      ? {
          keywordsToExclude: ids,
          filters,
        }
      : {
          keywords: ids,
        };
  };

  handleClear = () => {
    const { reset, ids, shouldExclude, optimisticUpdate } = this.props;
    reset();
    this.props.onClose();
    const onRealUpdate = optimisticUpdate({
      ids,
      item: {
        preferredLandingPage: null,
        highestRankingPageStatus: 2,
      },
      isExcluded: shouldExclude,
    });
    return this.props
      .setLandingPage({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            resetPreferredLandingPage: true,
          },
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Unable to clear landing page'));
      });
  };

  updateLandingPage = preferredLandingPage => {
    const { ids, shouldExclude, optimisticUpdate } = this.props;
    const { landingPages } = this.state;

    const landingPage = landingPages.find(page => page.path === preferredLandingPage);

    const onRealUpdate = optimisticUpdate({
      ids,
      item: { preferredLandingPage: landingPage },
      isExcluded: shouldExclude,
    });
    return this.props
      .setLandingPage({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            preferredLandingPage,
          },
        },
      })
      .then(() => {
        this.props.onClose();
      })
      .catch(() => {
        onRealUpdate();
        this.props.onClose();
        Toast.error(t('Unable to set landing page'));
      });
  };

  optionsLoader = (query: string) => {
    const domainId = this.props.domain || this.props.match.params.domain;
    return this.props.client
      .query({
        fetchPolicy: 'network-only',
        query: searchUrlsQuery,
        variables: {
          domains: [domainId],
          query,
        },
      })
      .then(({ data }) => {
        this.setState({
          landingPages: data.urls,
        });

        const options = data.urls.map(({ path }) => ({
          label: path,
          value: path,
        }));

        if (!~data.urls.findIndex(item => item.path === query) && query) {
          options.unshift({
            label: t('Create new preferred URL page "%s"', query),
            value: query,
          });
        }

        return {
          options,
          complete: true,
        };
      });
  };

  handleSubmit = ({ preferred_landing_page: { value: preferred_landing_page } }) =>
    this.updateLandingPage(preferred_landing_page);

  renderArrow = () => <div className="dropdown-arrow" />;

  renderSkeleton = () => (
    <div>
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '15%' } },
          { type: 'input' },
          { type: 'button', options: { width: '30%' } },
        ]}
      />
    </div>
  );

  valueRenderer = option => option.value;

  render() {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return this.renderSkeleton();
    }
    const { handleSubmit, invalid, submitting } = this.props;
    const loadingSpinner = submitting ? <LoadingSpinner /> : null;
    return (
      <form className="set-landing-page-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <Field
          name="preferred_landing_page"
          arrowRenderer={this.renderArrow}
          labelClassname="required"
          component={SelectAsync}
          labelText={t('Select preferred URL')}
          loadOptions={this.optionsLoader}
          searchable={true}
          ignoreAccents={false}
          valueRenderer={this.valueRenderer}
          validate={Validator.required}
        />

        <FormGroup className="indented-form-group">
          <hr />
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button theme="grey" onClick={this.handleClear} disabled={submitting}>
              {t('Clear')}
            </Button>
            <Button submit theme="orange" disabled={invalid || submitting}>
              {t('Save')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const setLandingPageQuery = gql`
  mutation landingPageForm_updateKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

export default compose(
  graphql(setLandingPageQuery, { name: 'setLandingPage' }),
  withApollo,
)(
  reduxForm({
    form: 'LandingPageForm',
  })(LandingPageForm),
);
