// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import config from 'config';
import { withRouter } from 'react-router';

import underdash from 'Utilities/underdash';

type Props = {
  user: Object,
  location: Object,
  multiAccountUserData: Object,
};

const BLACKLISTED_ROUTES = ['/reports/pdf/'];

class SupportWidget extends Component<Props> {
  isBlacklisted() {
    const {
      location: { pathname },
    } = this.props;
    return BLACKLISTED_ROUTES.some(route => pathname.includes(route));
  }

  render() {
    if (
      underdash.graphqlError({ ...this.props }) ||
      underdash.graphqlLoading({ ...this.props }) ||
      this.isBlacklisted()
    ) {
      return null;
    }

    const { multiAccountUserData, user } = this.props;

    if (user.isImpersonating) {
      return null;
    }

    const subAccount =
      multiAccountUserData &&
      multiAccountUserData.user &&
      multiAccountUserData.user.multiaccountOriginUser
        ? true
        : false;

    const { id, email, fullName } =
      subAccount && multiAccountUserData.user.multiaccountOriginUser
        ? multiAccountUserData.user.multiaccountOriginUser
        : user;

    const organization =
      subAccount && multiAccountUserData.user.multiaccountOrganization
        ? multiAccountUserData.user.multiaccountOrganization
        : user.organization;

    const subAccountUserId = subAccount ? user.id : null;
    const subAccountOrganization = subAccount ? user.organization.name : null;
    const subAccountOrganizationId = subAccount ? user.organization.id : null;

    try {
      /* eslint-disable */
      if (typeof $crisp !== 'undefined') {
        console.log(user);
        console.log(email);
        console.log(`${email}`);
        $crisp.push(['set', 'user:email', [`${email}`]]);
        $crisp.push(['set', 'user:nickname', [`${fullName}`]]);
        $crisp.push([
          'set',
          'session:data',
          [
            [
              ['user-id', `${id}`],
              ['sub-account', `${subAccount}`],
              ['sub-account-user-id', `${subAccountUserId}`],
              ['sub-account-organization', `${subAccountOrganization}`],
              ['sub-account-organization-id', `${subAccountOrganizationId}`],
            ],
          ],
        ]);
      }
      /* eslint-enable */

      if (organization !== null) {
        const { activePlan } = organization;
        /* eslint-disable */
        if (typeof $crisp !== 'undefined') {
          $crisp.push(['set', 'user:company', [`#${organization.id} ${organization.name}`]]);
          $crisp.push([
            'set',
            'session:data',
            [
              [
                [
                  'sales-link',
                  `https://app.accuranker.com/app/sales/organization/${organization.id}`,
                ],
              ],
            ],
          ]);
        }
        /* eslint-enable */
      }
    } catch (e) {
      console.error(e);
    }

    return null;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  };
};

const multiAccountUserQuery = gql`
  query intercomWidget_multiaccountUser {
    user {
      id
      multiaccountOriginUser {
        id
        isImpersonating
        email
        fullName
        intercomHash
        dateJoined
        language
      }
      multiaccountOrganization {
        id
        name
        dateAdded
        active
        type
        isPartner
        phoneNumber
        numberOfDomains
        numberOfDomainsWithGa
        numberOfDomainsWithGwt
        numberOfKeywords
        activePlan {
          category
          priceMonthly
          maxKeywords
          isTrial
          endDate
          billingCycleInMonths
        }
      }
    }
  }
`;

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    null,
  ),
  graphql(multiAccountUserQuery, {
    name: 'multiAccountUserData',
    options: () => ({ fetchPolicy: 'network-only' }),
  }),
)(SupportWidget);
