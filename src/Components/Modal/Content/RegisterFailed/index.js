// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';

import { t } from 'Utilities/i18n';

type Props = {
  hideModal: Function,
  errors: Array,
};

class RegisterFailed extends Component<Props> {
  render() {
    return (
      <div className="modal-content-container">
        <div className="modal-content-inner">
          <h2 className="modal-title">
            {t('We were unable to create your account, please try again.')}
          </h2>
          {this.props.errors && this.props.errors.map(e => <p key={e.field}>{e.messages}</p>)}
          <span className="custom-link" onClick={this.props.hideModal}>
            {t('Back to sign up')}
          </span>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(RegisterFailed);
