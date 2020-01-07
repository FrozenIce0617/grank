//@flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { hideModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';

type Props = {
  hideModal: Function,
};

class UpsellModal extends Component<Props> {
  addDomain = () => {
    window.location = '/';
  };

  render() {
    return (
      <ModalBorder title={t('You cannot edit a demo domain')} onClose={this.props.hideModal}>
        <div className="serp-info-modal-content">
          <p>
            {t(
              'You are trying to edit a demo account. If you wish to add or edit keywords please add a new domain on the dashboard.',
            )}
          </p>
          <hr />
          <div className="confirmation-button-wrapper text-right">
            <Button onClick={this.props.hideModal} theme="grey">
              {t('Back')}
            </Button>
            <Button onClick={this.addDomain} theme="orange">
              {t('Go to dashboard')}
            </Button>
          </div>
        </div>
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(UpsellModal);
