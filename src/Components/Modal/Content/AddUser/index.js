// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import AddUserForm from './AddUserForm';
import { t } from 'Utilities/i18n';

import './add-user.scss';

type Props = {
  hideModal: Function,
  refresh: Function,
};

class AddUser extends Component<Props> {
  static defaultProps = {
    refresh: () => {},
  };

  render() {
    return (
      <ModalBorder className="add-user" title={t('Add User')} onClose={this.props.hideModal}>
        <AddUserForm onClose={this.props.hideModal} refresh={this.props.refresh} />
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
)(AddUser);
