// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import UploadCSVForm from './UploadCSVForm';
import { t } from 'Utilities/i18n';

type Props = {
  hideModal: Function,
};

class UploadCSV extends Component<Props> {
  render() {
    return (
      <ModalBorder className="upload-csv" title={t('Upload CSV')} onClose={this.props.hideModal}>
        <UploadCSVForm onClose={this.props.hideModal} />
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
)(UploadCSV);
