// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import EditDomainForm from './EditDomainForm';
import { t } from 'Utilities/i18n';

import './edit-domain.scss';

type Props = {
  hideModal: Function,
  domainId: number,
  refresh: Function,
};

class EditDomain extends Component<Props> {
  static defaultProps = {
    refresh: () => {},
  };

  render() {
    return (
      <ModalBorder className="edit-domain" title={t('Edit domain')} onClose={this.props.hideModal}>
        <EditDomainForm
          onClose={this.props.hideModal}
          domainId={this.props.domainId}
          refresh={this.props.refresh}
        />
      </ModalBorder>
    );
  }
}

const getDomainInfoQuery = gql`
  query editDomain_getDomainInfo($id: ID!) {
    domain(id: $id) {
      id
      domain
      includeSubdomains
      exactMatch
      displayName
      defaultCountrylocale {
        id
      }
      defaultLocation
      googleBusinessName
      paused
    }
  }
`;

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(getDomainInfoQuery, {
    name: 'domainInfo',
    options: props => ({
      variables: {
        id: props.domainId,
      },
    }),
  }),
)(EditDomain);
