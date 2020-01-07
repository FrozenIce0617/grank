// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import Button from 'Components/Forms/Button';
import TableEmptyState from 'Components/TableEmptyState';

import { t } from 'Utilities/i18n/index';
import { graphqlOK } from 'Utilities/underdash';

type Props = {
  gaAccounts: Object,
  connectionId: string,
  onSubmit: Function,
  onBack: Function,
};

class GAAccountPage extends Component<Props> {
  getRows() {
    if (!graphqlOK(this.props)) {
      return [];
    }
    const { gaAccounts } = this.props;
    return gaAccounts.googleConnection ? gaAccounts.googleConnection.gaAccounts : [];
  }

  renderBody(rows) {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }
    return (
      <tbody>
        {rows.map(account => (
          <tr key={account.id}>
            <td>
              <a tabIndex={0} onClick={() => this.props.onSubmit({ accountId: account.id })}>
                {account.name}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text', options: { width: '20%', marginBottom: '10px' } }]} />
    </SkeletonTableBody>
  );

  render() {
    const { onBack } = this.props;
    const rows = this.getRows();
    return (
      <div>
        <Table className="google-accounts-table data-table">
          <thead>
            <tr>
              <th>{t('Account Name')}</th>
            </tr>
          </thead>
          {this.renderBody(rows)}
        </Table>
        {graphqlOK(this.props) && (
          <TableEmptyState
            list={rows}
            title={t('No accounts returned from Google Analytics.')}
            subTitle={t('Please make sure you have created Google Analytics account.')}
          />
        )}
        <div className="confirmation-button-wrapper text-right mt-3">
          <Button theme="grey" onClick={onBack}>
            {t('Back')}
          </Button>
        </div>
      </div>
    );
  }
}

const gaAccountsQuery = gql`
  query gaAccountPage_gaAccounts($goaConnectionID: ID!) {
    googleConnection(id: $goaConnectionID) {
      gaAccounts {
        id
        name
      }
    }
  }
`;

export default compose(
  graphql(gaAccountsQuery, {
    name: 'gaAccounts',
    options: (props: Props) => {
      const connectionId = props.connectionId;
      return {
        fetchPolicy: 'network-only',
        variables: {
          goaConnectionID: connectionId,
        },
      };
    },
  }),
)(GAAccountPage);
