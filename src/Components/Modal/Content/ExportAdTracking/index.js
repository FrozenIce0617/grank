// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import ExportAdTrackingForm from './ExportAdTrackingForm';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';

type Props = {
  initialValues: {
    startDate: string,
    endDate: string,
    channel: number,
  } | null,
};

class ExportAdTracking extends Component<Props> {
  render() {
    const { initialValues } = this.props;
    return (
      <ModalBorder
        className="move-domain"
        title={t('Export Ad Tracking')}
        onClose={this.props.hideModal}
      >
        <ExportAdTrackingForm initialValues={initialValues} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(ExportAdTracking);
