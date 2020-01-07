// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import GenericPage from 'Pages/Layout/GenericPage';
import Skeleton from 'Components/Skeleton';

import InvoicesTable from './Table';

import { t } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';

type Props = {
  invoices: Object,
  match: Object,
};

class Invoices extends Component<Props> {
  renderHeader() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return (
        <Skeleton
          linesConfig={[{ type: 'title', options: { width: '30%', marginBottom: '10px' } }]}
        />
      );
    }
    const {
      invoices: {
        organization: { name },
      },
    } = this.props;
    return <h1>{`${t('Invoices for')} ${name}`}</h1>;
  }

  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    return (
      <GenericPage>
        {this.renderHeader()}
        <InvoicesTable id={id} />
      </GenericPage>
    );
  }
}

const invoicesQuery = gql`
  query invoices_invoices($id: ID!) {
    organization(id: $id) {
      id
      name
    }
  }
`;

export default compose(
  graphql(invoicesQuery, {
    name: 'invoices',
    options: ({
      match: {
        params: { id },
      },
    }) => ({ variables: { id } }),
  }),
)(Invoices);
