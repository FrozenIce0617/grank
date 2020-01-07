// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import { hideModal } from 'Actions/ModalAction';
import gql from 'graphql-tag';
import FormatNumber from '../../../FormatNumber';

type Props = {
  hideModal: Function,
};

class AffiliateInfo extends Component<Props> {
  render() {
    let content = <p>{t('Loading...')}</p>;

    if (
      this.props.affiliate &&
      this.props.affiliate.affiliate &&
      this.props.affiliate.affiliate.details
    ) {
      content = (
        <table className="data-table table">
          <tbody>
            <tr>
              <td>{t('AccuRanker affiliate ID (aaid)')}</td>
              <td>{this.props.affiliate.affiliate.details.affiliateId}</td>
            </tr>
            <tr>
              <td>{t('Paypal email')}</td>
              <td>{this.props.affiliate.affiliate.details.paypalEmail || 'n/a'}</td>
            </tr>
            <tr>
              <td>{t('Minimum payout')}</td>
              <td>
                <FormatNumber currency="USD">
                  {this.props.affiliate.affiliate.details.minimumPayout}
                </FormatNumber>
              </td>
            </tr>
            <tr>
              <td>{t('Commission percentage')}</td>
              <td>{this.props.affiliate.affiliate.details.commission}%</td>
            </tr>
            <tr>
              <td>{t('Total commission')}</td>
              <td>
                <FormatNumber currency="USD">
                  {this.props.affiliate.affiliate.details.totalCommission}
                </FormatNumber>
              </td>
            </tr>
            <tr>
              <td>{t('Total unpaid commission (and older then 30 days)')}</td>
              <td>
                <FormatNumber currency="USD">
                  {this.props.affiliate.affiliate.details.totalUnpaidCommission}
                </FormatNumber>
              </td>
            </tr>
            <tr>
              <td>{t('Total paid commission')}</td>
              <td>
                <FormatNumber currency="USD">
                  {this.props.affiliate.affiliate.details.totalPaidCommission}
                </FormatNumber>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <ModalBorder title={t('Affiliate Information')} onClose={this.props.hideModal}>
        {content}
      </ModalBorder>
    );
  }
}

const affiliateQuery = gql`
  query affiliateInfo {
    affiliate {
      details {
        commission
        totalCommission
        totalUnpaidCommission
        totalPaidCommission
        affiliateId
        paypalEmail
        minimumPayout
      }
    }
  }
`;

export default compose(
  graphql(affiliateQuery, { name: 'affiliate' }),
  connect(
    null,
    { hideModal },
  ),
)(AffiliateInfo);
