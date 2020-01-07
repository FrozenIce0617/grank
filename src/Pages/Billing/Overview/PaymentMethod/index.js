// @flow
import React, { Component } from 'react';

import { t, tct } from 'Utilities/i18n';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Skeleton from 'Components/Skeleton';
import { graphqlOK } from 'Utilities/underdash';

type Props = {
  data: Object,
  isOrgAdmin: Boolean,
};

class PaymentMethod extends Component<Props> {
  renderSkeleton() {
    return <Skeleton linesConfig={[{ type: 'chart', options: { flex: '1', height: '250px' } }]} />;
  }

  render() {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }

    const {
      isOrgAdmin,
      data: {
        user: {
          organization: { paymentcontact: contact },
        },
      },
    } = this.props;
    let content;
    if (!isOrgAdmin) {
      content = t('You need to be organization admin to see payment method information.');
    } else if (
      !contact ||
      !contact.braintreeCustomer ||
      (!contact.braintreeCustomer.card && !contact.braintreeCustomer.paypal)
    ) {
      content = t('No payment method information for this account');
    } else {
      const { card, paypal } = contact.braintreeCustomer;
      content = [
        card && [
          <span key="card-image" className="info-row">
            <strong className="info-label-cell" />
            <span className="info-value-cell">
              <img src={card.imageUrl} />
            </span>
          </span>,
          <span key="number" className="info-row">
            <strong className="info-label-cell">{t('Card Number')}</strong>
            <span className="info-value-cell">{card.maskedNumber}</span>
          </span>,
          <span key="expiration" className="info-row last-card-row">
            <strong className="info-label-cell">{t('Expiration Date')}</strong>
            <span className="info-value-cell">{card.expirationDate}</span>
          </span>,
          <small key="help">
            {tct(
              'We do not store credit card information on our servers. [link:Our payment processor] is a validated Level 1 PCI DSS Compliant Service Provider.',
              {
                link: (
                  <a
                    href="https://www.braintreepayments.com/features/data-security"
                    target="_blank"
                  />
                ),
              },
            )}
          </small>,
        ],
        paypal && [
          <span key="paypal-image" className="info-row">
            <strong className="info-label-cell" />
            <span className="info-value-cell">
              <img src={paypal.imageUrl} />
            </span>
          </span>,
          <span key="paypal" className="info-row">
            <strong className="info-label-cell">{t('PayPal Account')}</strong>
            <span className="info-value-cell">{paypal.email}</span>
          </span>,
        ],
      ];
    }

    return <div className="billing-box">{content}</div>;
  }
}

const dataQuery = gql`
  query paymentMethod_braintreeCustomer {
    user {
      id
      organization {
        id
        paymentcontact {
          id
          braintreeCustomer {
            card {
              cardType
              maskedNumber
              expirationDate
              imageUrl
            }
            paypal {
              email
              imageUrl
            }
          }
        }
      }
    }
  }
`;

export default graphql(dataQuery, {
  options: props => ({
    fetchPolicy: 'network-only',
  }),
})(PaymentMethod);
