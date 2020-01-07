// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import AddSubAccountForm from './AddSubAccountForm';
import { t } from 'Utilities/i18n';

import './add-sub-account.scss';

type Props = {
  hideModal: Function,
  refresh: Function,
};

class AddSubAccount extends Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <ModalBorder
        className="add-sub-account"
        title={t('Create New Sub-Account')}
        onClose={this.props.hideModal}
      >
        <AddSubAccountForm onClose={this.props.hideModal} refresh={this.props.refresh} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(AddSubAccount);
