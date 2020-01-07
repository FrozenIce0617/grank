// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import AddDomainForm from './AddDomainForm';
import { t } from 'Utilities/i18n';

import './add-domain.scss';

type Props = {
  hideModal: Function,
  refresh: Function,
};

class AddDomain extends Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <ModalBorder className="add-domain" title={t('Add Domain')} onClose={this.props.hideModal}>
        <AddDomainForm refresh={this.props.refresh} onClose={this.props.hideModal} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(AddDomain);
