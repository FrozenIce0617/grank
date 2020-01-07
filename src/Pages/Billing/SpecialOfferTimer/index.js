// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Countdown, { zeroPad } from 'react-countdown-now';

import { showModal } from '../../../Actions/ModalAction';

import { t, tn } from '../../../Utilities/i18n/index';

import './special-offer-timer.scss';

type Props = {
  planId: string, // eslint-disable-line react/no-unused-prop-types
  billingCycleId: string, // eslint-disable-line react/no-unused-prop-types
  pricingPlanCalculatedData: Object,
  showModal: Function,
};

class SpecialOfferTimer extends Component<Props> {
  renderer: Function;

  componentDidUpdate() {
    if (
      !this.props.pricingPlanCalculatedData.loading &&
      !this.props.pricingPlanCalculatedData.error
    ) {
      const {
        pricingPlanCalculatedData: {
          pricingPlanCalculated: { dealEndDate },
        },
      } = this.props;
      if (dealEndDate && new Date(dealEndDate).getTime() <= Date.now()) {
        this.showPackageSelector();
      }
    }
  }

  showPackageSelector() {
    this.props.showModal({
      modalType: 'SelectPlan',
      modalProps: {
        errorMessage: t('The special offer on this plan has expired, please select another plan!'),
      },
    });
  }

  renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) return null;
    return (
      <div className="special-offer-timer-wrapper">
        <div className="holder">
          <h3>{t('This offer expires in')}</h3>
          <div className="special-offer-timer">
            <span className="time-segment">
              {days}
              <span className="time-segment-description">{tn('Day', 'Days', days)}</span>
            </span>
            <span className="time-segment">
              {zeroPad(hours)}
              <span className="time-segment-description">{tn('Hour', 'Hours', hours)}</span>
            </span>
            <span className="time-segment">
              {zeroPad(minutes)}
              <span className="time-segment-description">{tn('Minute', 'Minutes', minutes)}</span>
            </span>
            <span className="time-segment">
              {zeroPad(seconds)}
              <span className="time-segment-description">{tn('Second', 'Seconds', seconds)}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (
      this.props.pricingPlanCalculatedData.loading ||
      this.props.pricingPlanCalculatedData.error
    ) {
      return null;
    }
    const {
      pricingPlanCalculatedData: {
        pricingPlanCalculated: { dealEndDate, showCountdown },
      },
    } = this.props;
    if (!showCountdown || !dealEndDate) return null;
    return (
      <Countdown
        date={dealEndDate}
        renderer={this.renderer}
        onComplete={() => this.showPackageSelector()}
      />
    );
  }
}

const pricingDetailsQuery = gql`
  query specialOfferTimer_getPricingDetailsQuery($id: ID!, $billingCycle: Int!) {
    pricingPlanCalculated(id: $id, billingCycle: $billingCycle) {
      dealEndDate
      showCountdown
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(pricingDetailsQuery, {
    name: 'pricingPlanCalculatedData',
    options: ({ planId, billingCycleId }) => ({
      fetchPolicy: 'network-only',
      variables: {
        id: planId,
        billingCycle: billingCycleId,
      },
    }),
  }),
)(SpecialOfferTimer);
