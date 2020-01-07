// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { formValueSelector } from 'redux-form';
import { Link } from 'react-router-dom';

import { t, tn } from 'Utilities/i18n/index';
import { FormattedNumber } from 'react-intl';
import Skeleton from 'Components/Skeleton';
import underdash from 'Utilities/underdash';
import { showModal } from 'Actions/ModalAction';

import './order-plan-widget.scss';

type Props = {
  isSticky?: boolean,
  style?: Object,
  vatValid?: boolean, // eslint-disable-line react/no-unused-prop-types
  selectedCountry?: Object, // eslint-disable-line react/no-unused-prop-types
  planId: string, // eslint-disable-line react/no-unused-prop-types
  billingCycleId: string, // eslint-disable-line react/no-unused-prop-types
  coupon?: string, // eslint-disable-line react/no-unused-prop-types
  pricingPlanCalculatedData: Object,
  pricingPlanData: Object,
  billingCycleData: Object,
  showModal: Function,
  basepath: string,
  isRegister: boolean,
};

class OrderPlanWidget extends Component<Props> {
  static defaultProps = {
    isSticky: false,
    style: {},
    vatValid: false,
    selectedCountry: null,
    coupon: null,
  };

  renderSkeleton(className) {
    const { isRegister } = this.props;
    const commonLines = [
      { type: 'title', options: { width: '60%' } },
      { type: 'subtitle', options: { width: '70%' } },
      { type: 'spacer-underline' },
      { type: 'text' },
    ];
    const lines = isRegister
      ? [
          ...commonLines,
          ...[
            { type: 'text', options: { width: '75%' } },
            { type: 'text', options: { width: '60%' } },
            { type: 'text', options: { width: '75%' } },
            { type: 'text' },
            { type: 'text' },
            { type: 'text' },
            { type: 'text' },
            { type: 'text', options: { width: '75%' } },
            { type: 'text', options: { width: '55%' } },
          ],
        ]
      : [
          ...commonLines,
          ...[
            { type: 'text' },
            { type: 'text' },
            { type: 'text' },
            { type: 'text' },
            { type: 'text', options: { width: '55%' } },
          ],
        ];

    return (
      <div className={this.props.isSticky ? 'sticky-wrapper' : ''} style={{ ...this.props.style }}>
        <div className={className}>
          <Skeleton linesConfig={lines} />
        </div>
      </div>
    );
  }

  renderBillingCycle(billingCycle: Object) {
    return (
      <tr key="billingCycle">
        <td>{t('Billing cycle')}</td>
        <td>
          {billingCycle.months} {tn('month', 'months', billingCycle.months)}
        </td>
      </tr>
    );
  }

  renderPrice(pricingPlanCalculated: Object, pricingPlan: Object, billingCycle: Object) {
    return (
      <tr key="price">
        <td>
          {billingCycle.long} {t('price')}
        </td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.price}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderReceivableRow(pricingPlanCalculated: Object, pricingPlan: Object) {
    if (pricingPlanCalculated.receivable <= 0) return null;
    return (
      <tr>
        <td>{t('Receivable from current plan')}</td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.receivable}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderSignonDiscountRow(pricingPlanCalculated: Object, pricingPlan: Object) {
    if (pricingPlanCalculated.signonDiscount <= 0) return null;
    return (
      <tr key="signonDiscount">
        <td>{t('Sign-on discount')}</td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.signonDiscount}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderSignonDiscountAdditionalRow(pricingPlanCalculated: Object) {
    if (
      pricingPlanCalculated.signonDiscount <= 0 ||
      pricingPlanCalculated.signonDiscountMonths <= 1
    ) {
      return null;
    }
    return (
      <tr key="signonDiscountAdditional">
        <td colSpan="2" className="additional-info">
          {t(
            'Discount will be applied monthly for %s months',
            pricingPlanCalculated.signonDiscountMonths,
          )}
        </td>
      </tr>
    );
  }

  renderCouponDiscountRow(pricingPlanCalculated: Object, pricingPlan: Object) {
    if (pricingPlanCalculated.couponDiscount <= 0) return null;
    return (
      <tr key="couponDiscount">
        <td>{t('Coupon discount')}</td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.couponDiscount}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderSubAccountDiscountRow(pricingPlanCalculated: Object, pricingPlan: Object) {
    if (pricingPlanCalculated.subAccountDiscount <= 0) return null;
    return (
      <tr key="subAccountDiscount">
        <td>{t('Sub-account discount')}</td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.subAccountDiscount}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderWalletRow(pricingPlanCalculated: Object, pricingPlan: Object) {
    if (pricingPlanCalculated.purseCredit === 0) return null;
    return (
      <tr>
        <td>{pricingPlanCalculated.purseCredit > 0 ? t('Wallet credit') : t('Wallet debit')}</td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.purseCredit}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderTotalBeforeVAT(pricingPlanCalculated: Object, pricingPlan: Object) {
    return (
      <tr key="totalBeforeVAT">
        <td>{t('Total before VAT')}</td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.totalBeforeVat}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderVAT(pricingPlanCalculated: Object, pricingPlan: Object) {
    return (
      <tr key="VAT">
        <td>
          {t('VAT')} ({pricingPlanCalculated.vatRate}
          {'%'})
        </td>
        <td>
          <FormattedNumber
            style="currency"
            value={pricingPlanCalculated.vat}
            currency={pricingPlan.currency}
            currencyDisplay="code"
          />
        </td>
      </tr>
    );
  }

  renderTotal(pricingPlanCalculated: Object, pricingPlan: Object) {
    return (
      <tr key="total">
        <td>{t('Total')}</td>
        <td className="total">
          <b>
            <FormattedNumber
              style="currency"
              value={pricingPlanCalculated.total}
              currency={pricingPlan.currency}
              currencyDisplay="code"
            />
          </b>
        </td>
      </tr>
    );
  }

  renderChangePlan() {
    const { basepath, coupon } = this.props;
    return (
      <tr key="changePlan">
        <td colSpan="2" className="text-left">
          <span
            onClick={() => {
              this.props.showModal({
                modalType: 'SelectPlan',
                modalProps: { basepath, coupon },
              });
            }}
            className="custom-link"
          >
            {t('Change Plan')}
          </span>
        </td>
      </tr>
    );
  }

  renderChangeBillingCycle() {
    const { billingCycleId, planId, basepath, coupon } = this.props;
    const [linkLabel, nextBillingCycleId] =
      billingCycleId === '1'
        ? [t('Change to yearly payment'), '2']
        : [t('Change to monthly payment'), '1'];
    return (
      <tr key="changeBillingCycle">
        <td colSpan="2" className="text-left">
          <Link
            className="custom-link"
            to={`/${basepath}/${nextBillingCycleId}/${planId}/${coupon ? coupon : ''}`}
          >
            {linkLabel}
          </Link>
        </td>
      </tr>
    );
  }

  renderTrialInfo() {
    const {
      pricingPlanCalculatedData: {
        pricingPlanCalculated: { nextPlanAfterTrial },
      },
      pricingPlanData: { pricingPlan },
      pricingPlanData: {
        pricingPlan: {
          nextPlanAfterTrial: { name: nextPlanName },
        },
      },
      billingCycleData: { billingCycle },
    } = this.props;
    return [
      <tr key="afterTrialHeader">
        <td colSpan={2} style={{ textAlign: 'left' }}>
          <span>
            {t('After the trial, you will continue on')}
            <br />
            {nextPlanName}
            {', '}
            <FormattedNumber
              value={nextPlanAfterTrial.price}
              style="currency"
              currencyDisplay="code"
              currency={pricingPlan.currency}
            />
            {'/'}
            <span className="cycle-abbreviation">{billingCycle.short}</span>
          </span>
        </td>
      </tr>, //TODO Real text
      this.renderBillingCycle(billingCycle),
      this.renderPrice(nextPlanAfterTrial, pricingPlan, billingCycle),
      this.renderSignonDiscountRow(nextPlanAfterTrial, pricingPlan),
      this.renderCouponDiscountRow(nextPlanAfterTrial, pricingPlan),
      this.renderSubAccountDiscountRow(nextPlanAfterTrial, pricingPlan),
      this.renderTotalBeforeVAT(nextPlanAfterTrial, pricingPlan),
      this.renderVAT(nextPlanAfterTrial, pricingPlan),
      this.renderTotal(nextPlanAfterTrial, pricingPlan),
      this.renderSignonDiscountAdditionalRow(nextPlanAfterTrial),
    ];
  }

  renderStandard() {
    const widgetClassName = `order-plan-wrapper ${this.props.isSticky ? 'border-left' : ''}`;
    const {
      pricingPlanCalculatedData: { pricingPlanCalculated },
      pricingPlanData: { pricingPlan },
      billingCycleData: { billingCycle },
    } = this.props;

    return (
      <div className={this.props.isSticky ? 'sticky-wrapper' : ''} style={{ ...this.props.style }}>
        <div className={widgetClassName}>
          <h3>{t('Selected plan')}</h3>
          <span className="order-info">
            {pricingPlan.name}
            {', '}
            <FormattedNumber
              value={pricingPlanCalculated.price}
              style="currency"
              currencyDisplay="code"
              currency={pricingPlan.currency}
            />
            {'/'}
            <span className="cycle-abbreviation">{billingCycle.short}</span>
          </span>
          <table className="order-plan-table">
            <tbody>
              {this.renderBillingCycle(billingCycle)}
              {this.renderPrice(pricingPlanCalculated, pricingPlan, billingCycle)}
              {this.renderReceivableRow(pricingPlanCalculated, pricingPlan)}
              {this.renderSignonDiscountRow(pricingPlanCalculated, pricingPlan)}
              {this.renderCouponDiscountRow(pricingPlanCalculated, pricingPlan)}
              {this.renderSubAccountDiscountRow(pricingPlanCalculated, pricingPlan)}
              {this.renderWalletRow(pricingPlanCalculated, pricingPlan)}
              {this.renderTotalBeforeVAT(pricingPlanCalculated, pricingPlan)}
              {this.renderVAT(pricingPlanCalculated, pricingPlan)}
              {this.renderTotal(pricingPlanCalculated, pricingPlan)}
              {this.renderSignonDiscountAdditionalRow(pricingPlanCalculated)}
              {/* {this.renderChangeBillingCycle()} */}
              {this.renderChangePlan()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderTrial() {
    const widgetClassName = `order-plan-wrapper ${this.props.isSticky ? 'border-left' : ''}`;
    const {
      pricingPlanCalculatedData: { pricingPlanCalculated },
      pricingPlanData: { pricingPlan },
      billingCycleData: { billingCycle },
    } = this.props;

    return (
      <div className={this.props.isSticky ? 'sticky-wrapper' : ''} style={{ ...this.props.style }}>
        <div className={widgetClassName}>
          <h3>{t('Selected plan')}</h3>
          <span className="order-info">{pricingPlan.name}</span>
          <table className="order-plan-table">
            <tbody>
              {this.renderTotal(pricingPlanCalculated, pricingPlan)}
              {this.renderTrialInfo()}
              {this.renderChangeBillingCycle()}
              {this.renderChangePlan()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const widgetClassName = `order-plan-wrapper ${this.props.isSticky ? 'border-left' : ''}`;

    if (underdash.graphqlError({ ...this.props })) {
      return this.renderSkeleton(widgetClassName);
    }
    if (underdash.graphqlLoading({ ...this.props })) {
      return this.renderSkeleton(widgetClassName);
    }
    const {
      pricingPlanCalculatedData: {
        pricingPlanCalculated: { isTrial },
      },
    } = this.props;
    const {
      pricingPlanData: {
        pricingPlan: { nextPlanAfterTrial },
      },
    } = this.props; // TODO should we show trials if there is no next plan????
    if (isTrial && nextPlanAfterTrial) {
      return this.renderTrial();
    }
    return this.renderStandard();
  }
}

const selector = formValueSelector('CompanyInfoForm');
const mapStateToProps = state => ({
  vatValid: state.orderPlan.vatValid,
  selectedCountry: selector(state, 'country'),
});

const pricingDetailsQuery = gql`
  query orderPlanWidget_getPricingDetails(
    $id: ID!
    $billingCycle: Int!
    $validVat: Boolean
    $countryId: String
    $coupon: String
  ) {
    pricingPlanCalculated(
      id: $id
      billingCycle: $billingCycle
      validVat: $validVat
      countryId: $countryId
      coupon: $coupon
    ) {
      id
      price
      receivable
      upgrade
      downgrade
      signonDiscount
      signonDiscountMonths
      subAccountDiscount
      couponDiscount
      purseCredit
      totalBeforeVat
      vat
      vatRate
      total
      startDate
      endDate
      isTrial
      nextPlanAfterTrial {
        id
        price
        receivable
        upgrade
        downgrade
        signonDiscount
        signonDiscountMonths
        couponDiscount
        purseCredit
        totalBeforeVat
        vat
        vatRate
        total
        startDate
        endDate
        isTrial
      }
    }
  }
`;

const pricingPlanQuery = gql`
  query orderPlanWidget_pricingPlan($id: ID!) {
    pricingPlan(id: $id) {
      id
      name
      currency
      nextPlanAfterTrial {
        name
      }
    }
  }
`;

const billingCycleQuery = gql`
  query orderPlanWidget_billingCycle($id: ID!) {
    billingCycle(id: $id) {
      id
      months
      short
      long
    }
  }
`;

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(pricingDetailsQuery, {
    name: 'pricingPlanCalculatedData',
    options: props => {
      const { planId, billingCycleId, selectedCountry, vatValid, coupon } = props;
      let variables = {
        id: planId,
        billingCycle: billingCycleId,
        validVat: vatValid,
        countryId: selectedCountry ? selectedCountry.countryCode : null,
      };
      if (coupon) variables = { ...variables, coupon };
      return {
        fetchPolicy: 'network-only',
        variables,
      };
    },
  }),
  graphql(pricingPlanQuery, {
    name: 'pricingPlanData',
    options: ({ planId }) => ({
      variables: {
        id: planId,
      },
    }),
  }),
  graphql(billingCycleQuery, {
    name: 'billingCycleData',
    options: ({ billingCycleId }) => ({
      variables: {
        id: billingCycleId,
      },
    }),
  }),
)(OrderPlanWidget);
