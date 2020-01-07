// @flow
import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import AccountUsage from 'Components/AccountUsage';
import { t, tn } from 'Utilities/i18n';
import { showModal } from 'Actions/ModalAction';
import { connect } from 'react-redux';
import Skeleton from 'Components/Skeleton';
import FormatNumber from 'Components/FormatNumber';
import { graphqlOK } from 'Utilities/underdash';

type Props = {
  data: Object,
  isOrgAdmin: boolean,
  isActive: boolean,
  showModal: Function,
};

class Plan extends Component<Props> {
  showCancelConfirmation = () => {
    this.props.showModal({
      modalType: 'CancelPlan',
    });
  };

  renderSkeleton() {
    return <Skeleton linesConfig={[{ type: 'chart', options: { flex: '1', height: '250px' } }]} />;
  }

  renderPaymentInfo(plan, isActive) {
    return (
      <Fragment>
        {plan.billingCycleInMonths === 1 ? (
          <span className="info-row">
            <strong className="info-label-cell">{t('Monthly price')}</strong>
            <span className="info-value-cell">
              <FormatNumber currency={plan.currency}>{plan.priceMonthly}</FormatNumber>
            </span>
          </span>
        ) : (
          <span className="info-row">
            <strong className="info-label-cell">{t('Annual price')}</strong>
            <span className="info-value-cell">
              <FormatNumber currency={plan.currency}>{plan.priceYearly}</FormatNumber>
            </span>
          </span>
        )}
        <span className="info-row">
          <strong className="info-label-cell">{t('Billing cycle')}</strong>
          <span className="info-value-cell">
            {tn('Paid monthly', 'Paid every %s months', plan.billingCycleInMonths)}
          </span>
        </span>
        <span className="info-row">
          <strong className="info-label-cell">{isActive ? t('Next payment') : ''}</strong>
          <span className="info-value-cell">{isActive ? plan.endDate : t('Plan cancelled')}</span>
        </span>
      </Fragment>
    );
  }

  render() {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }

    const {
      isOrgAdmin,
      isActive,
      data: {
        user: {
          organization: { activePlan: plan, nextPlan },
        },
      },
    } = this.props;
    if (!isOrgAdmin) {
      return (
        <div className="billing-box">{t('You need to be organization admin to update plan')}</div>
      );
    }

    const showPaymentInfo = !plan.isFree && !plan.isTrial;
    return (
      <div className="billing-box">
        {nextPlan &&
          isActive && (
            <p className="alert alert-warning next-plan">
              {t(
                'The plan will expire on %s. You will be switched to the "%s" on %s.',
                plan.endDate,
                nextPlan.name,
                nextPlan.startDate,
              )}
            </p>
          )}
        <div className="billing-box-content">
          <div className="billing-box-content-left">
            <span className="info-row">
              <strong className="info-label-cell">{t('Plan')}</strong>
              {plan.isFree ? (
                <span className="info-value-cell">
                  {t('%s with %s keywords', plan.name, plan.maxKeywords)}
                </span>
              ) : (
                <span className="info-value-cell">
                  {t('%s with %s keywords', plan.category, plan.maxKeywords)}
                </span>
              )}
            </span>
            {showPaymentInfo && this.renderPaymentInfo(plan, isActive)}
          </div>
          {showPaymentInfo &&
            isActive && (
              <div className="billing-box-content-right">
                <button
                  className="btn btn-link cancel-button"
                  onClick={this.showCancelConfirmation}
                >
                  {t('Cancel my subscription')}
                </button>
              </div>
            )}
        </div>
        <AccountUsage className="mt-2" />
      </div>
    );
  }
}

const dataQuery = gql`
  query plan_organizationPlansInfo {
    user {
      id
      organization {
        id
        activePlan {
          id
          name
          isFree
          isTrial
          category
          priceMonthly
          priceYearly
          endDate
          billingCycleInMonths
          currency
          maxKeywords
        }
        nextPlan {
          id
          name
          startDate
        }
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(dataQuery),
)(Plan);
