// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import { graphqlOK } from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';

type Props = {
  gaProfiles: Object,
  connectionId: string,
  propertyId: string,
  accountId: string,
  onSubmit: Function,
  onBack: Function,
};

class GAProfilePage extends Component<Props> {
  getRows() {
    if (!graphqlOK(this.props)) {
      return [];
    }
    const { gaProfiles } = this.props;
    return gaProfiles.googleConnection ? gaProfiles.googleConnection.gaProfiles : [];
  }

  renderBody(rows) {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }
    return (
      <tbody>
        {rows.map(profile => (
          <tr key={profile.id}>
            <td>
              <a tabIndex={0} onClick={() => this.props.onSubmit({ profileId: profile.id })}>
                {profile.name}
              </a>
            </td>
            <td>{profile.websiteUrl}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text', options: { width: '20%', marginBottom: '10px' } }]} />
      <Skeleton linesConfig={[{ type: 'text', options: { width: '40%', marginBottom: '10px' } }]} />
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
              <th>{t('Profile name')}</th>
              <th>{t('Website URL')}</th>
            </tr>
          </thead>
          {this.renderBody(rows)}
        </Table>
        {graphqlOK(this.props) && (
          <TableEmptyState
            list={rows}
            title={t('No profiles returned from Google Analytics.')}
            subTitle={t('Please make sure you have created Google Analytics profile.')}
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

const gaProfilesQuery = gql`
  query gaProfilePage_gaProfiles(
    $goaConnectionID: ID!
    $gaAccountID: String!
    $gaPropertyID: String!
  ) {
    googleConnection(id: $goaConnectionID) {
      gaProfiles(gaAccountId: $gaAccountID, gaPropertyId: $gaPropertyID) {
        id
        name
        websiteUrl
      }
    }
  }
`;

export default compose(
  graphql(gaProfilesQuery, {
    name: 'gaProfiles',
    options: (props: Props) => {
      const { connectionId, accountId, propertyId } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          goaConnectionID: connectionId,
          gaAccountID: accountId,
          gaPropertyID: propertyId,
        },
      };
    },
  }),
)(GAProfilePage);
