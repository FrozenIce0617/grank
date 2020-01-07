// @flow
import React, { Component } from 'react';
import cfg from 'config';
import { isEmpty } from 'lodash';
import { withApollo, compose } from 'react-apollo';
import deepForceUpdate from 'react-deep-force-update';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n';
import { IntlProvider, addLocaleData } from 'react-intl';
import { withRouter } from 'react-router';
import en from 'react-intl/locale-data/en';
import da from 'react-intl/locale-data/da';
import ReactGA from 'react-ga';
import { removeInitialLoader } from 'Utilities/underdash';
import Raven from 'raven-js';
import LogRocket from 'logrocket';
// import { hot } from 'react-hot-loader';
import { CONNECTED, FORCE_RELOAD, subscribeToTopic, subscribeWS } from 'Utilities/websocket';
import { initLanguage } from 'Utilities/i18n';

import Loader from 'Components/Loader';
import Modal from 'Components/Modal';
import SideNotifications from 'Components/SideNotifications';
import { hideModal, showModal } from 'Actions/ModalAction';

import { ToastContainer, toast } from 'react-toastify';
import HighchartsLang from 'Components/HighchartsLang';
import SupportWidget from '../SupportWidget';

addLocaleData([...en, ...da]);

type Props = {
  user: Object,
  children: any,
  client: Object,
  history: Object,
  match: Object,
  hideModal: Function,
  showModal: Function,
  isLoadingInitialState: boolean,
};

class BaseContainer extends Component<Props> {
  constructor() {
    super();
    initLanguage();
  }

  componentDidMount() {
    // listen to the route changes and close modal only
    // when we go back and forward and modalHide is not defined
    this.props.history.listen(({ state: { modalHide = true } = {} }) => {
      if (modalHide) {
        this.props.hideModal();
      }
    });

    this.props.history.block(location => {
      const { user } = this.props;

      let isBlocked = false;
      // do not allow to move to select plans page if not admin
      if (location.pathname === '/billing/package/select' && user && !user.isOrgAdmin) {
        this.props.showModal({
          modalType: 'NotOrgAdmin',
          modalTheme: 'light',
          modalProps: {},
        });
        isBlocked = true;
      }

      // History block will work only when we return string as message
      if (isBlocked) {
        return 'blocked';
      }
    });

    ReactGA.initialize(cfg.analyticsTrackingId, {
      debug: cfg.analyticsDebug,
      gaOptions: {
        anonymizeIp: true,
        siteSpeedSampleRate: 100,
      },
    });
    if (window.performance) {
      const timeSincePageLoad = Math.round(performance.now());
      ReactGA.timing({
        category: 'React',
        variable: 'load',
        value: timeSincePageLoad,
        label: 'Initial page load',
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const {
      client,
      user: { isAuthenticated, news, unseenReleases },
      history,
      isLoadingInitialState,
    } = nextProps;

    if (isLoadingInitialState !== this.props.isLoadingInitialState && !isLoadingInitialState) {
      removeInitialLoader();

      if (isAuthenticated) {
        subscribeWS(client);
        subscribeToTopic({ action: CONNECTED, cb: this.connectedCallback });
        subscribeToTopic({ action: FORCE_RELOAD, cb: this.reloadCallback });
      }

      const modals = [
        // Check is we use IE
        ~navigator.userAgent.indexOf('MSIE') ||
          (~navigator.appVersion.indexOf('Trident/') && {
            modal: {
              modalType: 'Confirmation',
              modalProps: {
                title: t('Warning: Internet Explorer usage'),
                description: t(
                  'You could see multiple issues while using this app in IE, please use other browser to avoid negative user experience.',
                ),
                lockDuration: 0,
                confirmLabel: t('OK'),
                showCancelLabel: false,
              },
            },
            getNextModalProps: openNextModal => ({
              action: openNextModal,
              cancelAction: openNextModal,
            }),
          }),

        // Show the news if we have some
        !isEmpty(news) &&
          !news.read && {
            modal: {
              modalType: 'News',
              modalProps: {
                news,
              },
            },
            getNextModalProps: openNextModal => ({
              onConfirm: openNextModal,
            }),
          },

        // Show the change log if we have some changes
        !isEmpty(unseenReleases) &&
          history.location.pathname !== '/releases' && {
            modal: {
              modalType: 'ChangeLog',
              modalProps: {
                releases: unseenReleases,
              },
            },
            getNextModalProps: openNextModal => ({
              onConfirm: openNextModal,
            }),
          },
      ].filter(Boolean);

      this.openModalChain(modals[0], modals.slice(1));
    }
  }

  shouldComponentUpdate(nextProps) {
    // Force a re-render of all children if language is changed
    if (
      this.props.user.language !==
      nextProps.user.language /* || this.props.locale.debug !== nextProps.locale.debug */
    ) {
      deepForceUpdate(this);
    }

    // Update the active user in GA and HubSpot analytics
    if (this.props.user.email !== nextProps.user.email) {
      const { email, isOrgAdmin, id, fullName, organization } = nextProps.user;
      ReactGA.set({
        userId: id,
      });

      // Set the user context for Raven (Sentry)
      Raven.setUserContext({
        email,
        id,
      });

      // Set the user in HubSpot
      const _hsq = (window._hsq = window._hsq || []);
      _hsq.push([
        'identify',
        {
          email,
        },
      ]);
      _hsq.push([
        'trackEvent',
        {
          id: 'Ping',
          value: 0,
        },
      ]);
    }

    return true;
  }

  openModalChain = (modalObject: Object, modalObjects: Object[]) => {
    if (isEmpty(modalObjects) && !modalObject) {
      this.props.hideModal();
      return;
    }

    this.props.showModal({
      ...modalObject.modal,
      modalProps: {
        ...modalObject.modal.modalProps,
        ...modalObject.getNextModalProps(() => {
          this.openModalChain(modalObjects[0], modalObjects.slice(1));
        }),
      },
    });
  };

  connectedCallback = (payload: any) => {
    const runningVersion = BUILDNUMBER; // eslint-disable-line
    const {
      data: { version },
    } = payload;
    if (runningVersion < version && location.hostname.indexOf('localhost') !== 0) {
      // The server says there is a newer version than the one we are running. Force people to reload.
      this.props.showModal({
        modalType: 'NewVersion',
        modalTheme: 'dark',
        modalProps: {
          oldVersion: runningVersion,
          newVersion: version,
        },
      });
    }

    // temp
    this.shouldRecordSessionHandler();
  };

  reloadCallback = () => {
    window.location = '/';
  };

  shouldRecordSessionHandler = () => {
    const { user } = this.props;

    if (user.shouldRecordSession) {
      LogRocket.init('rdis4x/accuranker', {
        release: COMMITHASH, // eslint-disable-line
      });

      LogRocket.identify(user.id, {
        email: user.email,
      });

      console.log('Started logging');
    }
  };

  render() {
    if (this.props.isLoadingInitialState) {
      return null;
    }

    return (
      <IntlProvider locale={this.props.user.language}>
        <div>
          <ToastContainer
            position={toast.POSITION.TOP_CENTER}
            closeButton={false}
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
          <HighchartsLang />
          <Modal />
          <Loader isGlobal />
          {this.props.children}
          <SupportWidget />
          <SideNotifications />
        </div>
      </IntlProvider>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  isLoadingInitialState: state.asyncInitialState.loading,
});

const baseWithCompose = compose(
  withRouter,
  withApollo,
  connect(
    mapStateToProps,
    { hideModal, showModal },
  ),
)(BaseContainer);

// export default hot(module)(baseWithCompose);
export default baseWithCompose;
