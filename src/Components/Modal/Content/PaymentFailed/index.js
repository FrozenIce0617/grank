// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';

import { t } from 'Utilities/i18n';

class PaymentFailed extends Component {
  props: {
    errorType: string,
    hideModal: Function,
  };

  static defaultProps = {
    errorType: '',
  };

  render() {
    return (
      <div className="modal-content-container">
        <div className="modal-content-inner">
          <h2 className="modal-title">{t('We were unable to process your payment')}</h2>
          <p className="modal-main-text">
            {t('The error message states:')} {this.props.errorType}.
          </p>
          <span className="custom-link" onClick={this.props.hideModal}>
            {t('Back to payment page')}
          </span>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(PaymentFailed);
