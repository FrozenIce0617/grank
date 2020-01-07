// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import Loader from 'Components/Loader';
import moment from 'moment';

type Props = {
  hideModal: Function,
  organizationId: string,
  lastState: Object,
  submitOnInit: boolean,
};

class SalesOrganizationAbuseLog extends Component<Props> {
  handleClose = () => {
    this.props.hideModal();
  };

  render() {
    const { adminOrganization: organization } = this.props.organizationQuery;
    return (
      <ModalBorder title={t('Abuse Log')} onClose={this.handleClose}>
        {this.props.organizationQuery.loading || this.props.organizationQuery.error ? (
          <Loader style={{ height: '500px' }} />
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('Date')}</th>
                <th scope="col">{t('Description')}</th>
                <th scope="col">{t('Log')}</th>
              </tr>
            </thead>
            <tbody>
              {organization.trialAbuseLog.map(log => (
                <tr key={log.id}>
                  <td>{moment(log.createdAt).format('L')}</td>
                  <td>{log.description}</td>
                  <td>{log.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ModalBorder>
    );
  }
}

const organizationQuery = gql`
  query salesOrganization_adminOrganization($id: ID!) {
    adminOrganization(id: $id) {
      id
      trialAbuseLog {
        id
        createdAt
        description
        value
      }
    }
  }
`;

export default compose(
  graphql(organizationQuery, {
    name: 'organizationQuery',
    options: props => ({ variables: { id: props.organizationId } }),
  }),
  connect(
    null,
    { hideModal },
  ),
)(SalesOrganizationAbuseLog);
