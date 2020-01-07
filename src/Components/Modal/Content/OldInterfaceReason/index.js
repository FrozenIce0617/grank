// @flow
import React, { Component } from 'react';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import { hideModal } from 'Actions/ModalAction';
import OldInterfaceReasonForm from './OldInterfaceReasonForm';
import { connect } from 'react-redux';

type Props = {
  hideModal: Function,
};

class OldInterfaceReason extends Component<Props> {
  render() {
    return (
      <ModalBorder title={t('Switch to Old AccuRanker')} onClose={this.props.hideModal}>
        <OldInterfaceReasonForm hideModal={this.props.hideModal} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(OldInterfaceReason);
