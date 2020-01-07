// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import CopyToClipboardForm from './CopyToClipboardForm';

type Props = {
  hideModal: Function,
  value: string | Promise<string>,
  confirmButtonLabel?: string,
};

class CopyToClipboard extends Component<Props> {
  render() {
    const { value, confirmButtonLabel } = this.props;
    return (
      <ModalBorder
        className="copy-modal"
        title={t('Copy to clipboard')}
        onClose={this.props.hideModal}
      >
        <CopyToClipboardForm
          hideModal={this.props.hideModal}
          value={value}
          confirmButtonLabel={confirmButtonLabel}
        />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(CopyToClipboard);
