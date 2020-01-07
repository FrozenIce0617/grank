// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import AddVoucherForm from './AddVoucherForm';

type Props = {
  hideModal: Function,
};

class AddVoucher extends Component<Props> {
  render() {
    return (
      <ModalBorder
        className="add-voucher"
        title={t('Add Prepaid Voucher')}
        onClose={this.props.hideModal}
      >
        <AddVoucherForm onClose={this.props.hideModal} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(AddVoucher);
