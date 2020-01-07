// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import { connect } from 'react-redux';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { showModal, hideModal } from 'Actions/ModalAction';

import { Integrations } from 'Types/Integration';
import SelectProvider from './SelectProvider';

type Props = {
  refresh?: Function,
  showModal: Function,
  hideModal: Function,
};

const options = [
  {
    provider: Integrations.GOOGLE_ACCOUNT,
    modal: 'ConnectToGA',
  },
  {
    provider: Integrations.ADOBE,
    modal: 'ConnectToAdobe',
  },
  // {
  //   provider: Integrations.HUBSPOT,
  //   modal: 'ConnectToOAuth',
  // },
];

class AddAccount extends Component<Props> {
  handleSelect = provider => {
    const option = options.find(item => item.provider === provider);
    this.props.showModal({
      modalType: option && option.modal,
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.refresh,
        integration: provider,
        isAdding: true,
      },
    });
  };

  render() {
    return (
      <ModalBorder title={t('Select connection provider')} onClose={this.props.hideModal}>
        <SelectProvider
          providers={options.map(option => option.provider)}
          onSelect={this.handleSelect}
        />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { showModal, hideModal },
)(AddAccount);
