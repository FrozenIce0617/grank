// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import gql from 'graphql-tag';
import Skeleton from 'Components/Skeleton';
import { graphqlOK } from 'Utilities/underdash';
import { graphql } from 'react-apollo';

type Props = {
  data: Object,
  isOrgAdmin: Boolean,
};

class PaymentContact extends Component<Props> {
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
      content = <p>{t('You need to be organization admin to see billing information.')}</p>;
    } else if (!contact) {
      content = <p>{t('No billing information for this account')}</p>;
    } else {
      content = (
        <p>
          <span>
            <strong>{contact.companyName}</strong>{' '}
          </span>
          <br />
          <span>{contact.street}</span>
          <br />
          <span>
            {contact.zipcode} {contact.city}
          </span>
          <br />
          <span>{contact.country.name}</span>
        </p>
      );
    }

    return <div className="billing-box">{content}</div>;
  }
}

const dataQuery = gql`
  query paymentContact_paymentContact {
    user {
      id
      organization {
        id
        paymentcontact {
          id
          companyName
          street
          zipcode
          city
          state
          country {
            id
            name
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
})(PaymentContact);
