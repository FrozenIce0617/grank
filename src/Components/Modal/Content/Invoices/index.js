// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import InvoicesTable from 'Pages/Invoices/Table';

type Props = {
  organizationId: String,

  // Auto
  hideModal: Function,
};

class Invoices extends Component<Props> {
  render() {
    const { organizationId } = this.props;
    return (
      <ModalBorder className="invoices-modal" title={t('Invoices')} onClose={this.props.hideModal}>
        <InvoicesTable id={organizationId} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(Invoices);
