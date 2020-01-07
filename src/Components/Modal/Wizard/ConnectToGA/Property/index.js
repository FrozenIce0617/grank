// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';
import Button from 'Components/Forms/Button';
import { graphqlOK } from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';

import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';

import { t } from 'Utilities/i18n/index';

type Props = {
  connectionId: string,
  accountId: string,
  gaProperties: Object,
  onSubmit: Function,
  onBack: Function,
};

class GAPropertyPage extends Component<Props> {
  getRows() {
    if (!graphqlOK(this.props)) {
      return [];
    }
    const { gaProperties } = this.props;
    return gaProperties.googleConnection ? gaProperties.googleConnection.gaProperties : [];
  }

  renderBody(rows) {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }
    return (
      <tbody>
        {rows.map(property => (
          <tr key={property.id}>
            <td>
              {
                <a tabIndex={0} onClick={() => this.props.onSubmit({ propertyId: property.id })}>
                  {property.name}
                </a>
              }
            </td>
            <td>{property.websiteUrl}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text', options: { width: '35%', marginBottom: '10px' } }]} />
      <Skeleton linesConfig={[{ type: 'text', options: { width: '60%', marginBottom: '10px' } }]} />
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
              <th>{t('Property name')}</th>
              <th>{t('Website URL')}</th>
            </tr>
          </thead>
          {this.renderBody(rows)}
        </Table>
        {graphqlOK(this.props) && (
          <TableEmptyState
            list={rows}
            title={t('No properties returned from Google Analytics.')}
            subTitle={t('Please make sure you have created Google Analytics property.')}
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

const gaPropertiesQuery = gql`
  query gaPropertyPage_gaProperties($goaConnectionID: ID!, $gaAccountID: String!) {
    googleConnection(id: $goaConnectionID) {
      gaProperties(gaAccountId: $gaAccountID) {
        id
        name
        websiteUrl
      }
    }
  }
`;

export default compose(
  graphql(gaPropertiesQuery, {
    name: 'gaProperties',
    options: (props: Props) => {
      const { connectionId, accountId } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          goaConnectionID: connectionId,
          gaAccountID: accountId,
        },
      };
    },
  }),
)(GAPropertyPage);
