// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { formValueSelector } from 'redux-form';

import { t } from '../../../Utilities/i18n/index';

import './checkout-info-widget.scss';

import Icon from './images/icon-info.png';

type Props = {
  upgrade: boolean,
  downgrade: boolean,
};
class CheckoutInfoWidget extends Component<Props> {
  static defaultProps = {
    upgrade: false,
    downgrade: false,
  };

  renderUpgradeWarning() {
    return (
      <div className="checkout-confirm-info">
        <img className="ico-info" src={Icon} alt="" />
        <div className="holder">
          <p>
            {t('You are upgrading your current plan. Plan upgrades are effective immediately.')}
          </p>
        </div>
      </div>
    );
  }

  renderDowngradeWarning() {
    return (
      <div className="checkout-confirm-info">
        <img className="ico-info" src={Icon} alt="" />
        <div className="holder">
          <p>
            {t(
              'You are downgrading your current plan. Plans downgrades are effective from your next payment.',
            )}
          </p>
          <h3>{t('Important')}</h3>
          <p>
            {t(
              'If you utilize more domains, keywords, competitors or users than is available on your new plan on the day of the downgrade, we will not be able to downgrade you and you will be billed for your old plan.',
            )}
          </p>
        </div>
      </div>
    );
  }
  render() {
    const { upgrade, downgrade } = this.props;
    if (upgrade) {
      return this.renderUpgradeWarning();
    }
    if (downgrade) {
      return this.renderDowngradeWarning();
    }
    return null;
  }
}

const pricingDetailsQuery = gql`
  query checkoutInfoWidget_getPricingDetailsQuery($id: ID!, $billingCycle: Int!) {
    pricingPlanCalculated(id: $id, billingCycle: $billingCycle) {
      upgrade
      downgrade
    }
  }
`;

const selector = formValueSelector('CompanyInfoForm');
const mapStateToProps = state => ({
  vatValid: state.orderPlan.vatValid,
  selectedCountry: selector(state, 'country'),
});

export default compose(
  graphql(pricingDetailsQuery, {
    options: ({ planId, billingCycleId, selectedCountry, vatValid }) => ({
      fetchPolicy: 'network-only',
      variables: {
        id: planId,
        billingCycle: billingCycleId,
        validVat: vatValid,
        countryId: selectedCountry ? selectedCountry.countryCode : null,
      },
    }),
    props: ({ data: { loading, pricingPlanCalculated, error } }) => {
      if (loading || error) return {};
      const { upgrade, downgrade } = pricingPlanCalculated;
      return {
        upgrade,
        downgrade,
      };
    },
  }),
  connect(
    mapStateToProps,
    {},
  ),
)(CheckoutInfoWidget);
