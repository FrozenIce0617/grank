// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import underdash from '../../../Utilities/underdash';

import './special-offer-message.scss';

type Props = {
  planId: string, // eslint-disable-line react/no-unused-prop-types
  billingCycleId: string, // eslint-disable-line react/no-unused-prop-types
  pricingPlanCalculatedData: Object,
};

class SpecialOfferMessage extends Component<Props> {
  render() {
    if (
      this.props.pricingPlanCalculatedData.loading ||
      this.props.pricingPlanCalculatedData.error
    ) {
      return null;
    }
    const {
      pricingPlanCalculatedData: {
        pricingPlanCalculated: { message },
      },
    } = this.props;
    if (!message) return null;
    return (
      <div className="special-offer-message-wrapper">
        <div className="holder">
          <p>{message}</p>
        </div>
      </div>
    );
  }
}

const pricingDetailsQuery = gql`
  query specialOfferMessage_getPricingDetailsQuery($id: ID!, $billingCycle: Int!) {
    pricingPlanCalculated(id: $id, billingCycle: $billingCycle) {
      message
    }
  }
`;

export default compose(
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
)(SpecialOfferMessage);
