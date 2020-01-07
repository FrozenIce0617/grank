// @flow
import React, { Component, type Element } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { graphqlOK, redirectToExternalUrl } from 'Utilities/underdash';

type Props = {
  component: Element<*>,
  path: Object,
  data: Object,
  isTrialExpiredOk: boolean,
  isPlanExpiredOk: boolean,
  isFailedPaymentOk: boolean,
  forceUnauthenticated: boolean, // should this page only be visible to logged out users
  user: Object,
};

const TRIAL_EXPIRED_PAGE = '/error/trial-expired';
const PLAN_EXPIRED_PAGE = '/error/plan-expired';
const FAILED_PAYMENT_PAGE = '/error/failed-payment';
const ACCOUNT_BLOCKED_PAGE = '/error/blocked';

class PrivateRoute extends Component<Props> {
  render() {
    if (!graphqlOK(this.props)) {
      return null;
    }
    const {
      path,
      isTrialExpiredOk,
      isPlanExpiredOk,
      isFailedPaymentOk,
      forceUnauthenticated,
      component,
      user: { isAuthenticated, organization },
      ...rest
    } = this.props;

    if (forceUnauthenticated && isAuthenticated) {
      redirectToExternalUrl(`/app`);
      return null;
    }

    if (!isAuthenticated && !forceUnauthenticated) {
      redirectToExternalUrl(`/user/login/?next=${window.location.pathname}`);
      return null;
    }

    const { trialExpired, planExpired, failedPayment, accountBlocked } =
      (organization && organization.errors) || {};

    if (accountBlocked) {
      return <Redirect to={ACCOUNT_BLOCKED_PAGE} />;
    }

    if (!isTrialExpiredOk && trialExpired && path !== TRIAL_EXPIRED_PAGE) {
      return <Redirect to={TRIAL_EXPIRED_PAGE} />;
    }
    if (!isPlanExpiredOk && planExpired && path !== PLAN_EXPIRED_PAGE) {
      return <Redirect to={PLAN_EXPIRED_PAGE} />;
    }
    if (!isFailedPaymentOk && failedPayment && path !== FAILED_PAYMENT_PAGE) {
      return <Redirect to={FAILED_PAYMENT_PAGE} />;
    }

    if (
      (!trialExpired && path === TRIAL_EXPIRED_PAGE) ||
      (!planExpired && path === PLAN_EXPIRED_PAGE) ||
      (!failedPayment && path === FAILED_PAYMENT_PAGE)
    ) {
      return <Redirect to="/" />;
    }

    return <Route {...rest} component={component} />;
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default connect(
  mapStateToProps,
  null,
)(PrivateRoute);
