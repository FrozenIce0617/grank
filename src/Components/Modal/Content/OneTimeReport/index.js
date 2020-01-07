// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import OneTimeReportForm from 'Pages/ScheduledReportBuilder/OneTimeReportForm';
import './one-time-report.scss';

type Props = {
  hideModal: Function,
  domainId: string,
  lastState: Object,
  submitOnInit: boolean,
};

class OneTimeReport extends Component<Props> {
  handleClose = () => {
    this.props.hideModal();
  };

  render() {
    const { lastState, submitOnInit, domainId } = this.props;
    return (
      <ModalBorder
        className="add-scheduled-report"
        title={t('Create Report')}
        onClose={this.handleClose}
      >
        <OneTimeReportForm
          onSubmit={this.handleClose}
          domainId={domainId}
          initialState={lastState}
          submitOnInit={submitOnInit}
        />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(OneTimeReport);
