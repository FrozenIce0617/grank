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

class SalesOrganizationDomains extends Component<Props> {
  handleClose = () => {
    this.props.hideModal();
  };

  render() {
    return (
      <ModalBorder title={t('Organization domains')} onClose={this.handleClose}>
        {this.props.organizationQuery.loading || this.props.organizationQuery.error ? (
          <Loader style={{ height: '500px' }} />
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('Group')}</th>
                <th scope="col">{t('Domain')}</th>
                <th scope="col">{t('Keywords')}</th>
              </tr>
            </thead>
            <tbody>
              {this.props.organizationQuery.adminOrganization.clients.map(client => [
                <tr key={`client-${client.id}`}>
                  <td>{client.name}</td>
                  <td />
                  <td />
                </tr>,
                client.domains.map(domain => (
                  <tr key={`domain-${domain.id}`}>
                    <td />
                    <td>
                      {domain.displayName} <i>{domain.domain}</i>
                    </td>
                    <td>{domain.totalKeywords}</td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        )}
      </ModalBorder>
    );
  }
}

const organizationQuery = gql`
  query salesDomains_adminOrganization($id: ID!) {
    adminOrganization(id: $id) {
      id
      clients {
        id
        name
        domains {
          id
          domain
          displayName
          totalKeywords
        }
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
)(SalesOrganizationDomains);
