// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import EditUserForm from './EditUserForm';
import { t } from 'Utilities/i18n';

import './edit-user.scss';

type Props = {
  hideModal: Function,
  refresh: Function,
  id: String,
};

class EditUser extends Component<Props> {
  static defaultProps = {
    refresh: () => {},
  };

  render() {
    return (
      <ModalBorder className="edit-user" title={t('Edit User')} onClose={this.props.hideModal}>
        <EditUserForm
          onClose={this.props.hideModal}
          refresh={this.props.refresh}
          id={this.props.id}
        />
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
)(EditUser);
