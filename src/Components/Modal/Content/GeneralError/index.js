// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';

import AtoDjango from 'Utilities/django';
import { t } from 'Utilities/i18n';

type Props = {
  title?: string,
  errorType: string,
  hideModal: Function,
  link: string,
};

class GeneralError extends Component<Props> {
  static defaultProps = {
    title: 'an error occurred',
    errorType: '',
    link: '/',
  };

  render() {
    return (
      <div className="modal-content-container">
        <div className="modal-content-inner">
          <h2 className="modal-title">{this.props.title}</h2>
          <p className="modal-main-text">
            {t('The error message states:')} "{this.props.errorType}".
          </p>
          <span className="custom-link" onClick={this.props.hideModal}>
            {t('Close this modal')}
          </span>{' '}
          {t('or')}{' '}
          <AtoDjango href={this.props.link} className="custom-link">
            {t('Go back to the billing overview')}
          </AtoDjango>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(GeneralError);
