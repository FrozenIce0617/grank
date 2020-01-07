//@flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';

import ModalBorder from 'Components/Modal/Layout/ModalBorder';

import { hideModal } from 'Actions/ModalAction';

import './serp-info.scss';

type Props = {
  hideModal: Function,
  label: string,
  text: string,
  image: string,
  onBack: Function,
};

class SERPInfo extends Component<Props> {
  render() {
    const { image, label, text, onBack } = this.props;
    return (
      <ModalBorder className="serp-info-modal" title={label} onClose={this.props.hideModal}>
        <div className="serp-info-modal-content">
          <img className="text-right" src={image} />
          <p>{text}</p>
        </div>
        {onBack && (
          <div className="confirmation-button-wrapper text-right">
            <Button theme="grey" onClick={onBack}>
              {t('Back')}
            </Button>
          </div>
        )}
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(SERPInfo);
