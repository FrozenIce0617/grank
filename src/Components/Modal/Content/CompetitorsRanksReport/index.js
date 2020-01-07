// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import CompetitorsRanksReportForm from './CompetitorsRanksReportForm';
import './competitors-ranks-report.scss';

type Props = {
  hideModal: Function,
  domainId: string,
  lastState: Object,
  submitOnInit: boolean,
};

class CompetitorsRanksReport extends Component<Props> {
  handleClose = () => {
    this.props.hideModal();
  };

  render() {
    const { lastState, submitOnInit, domainId } = this.props;
    return (
      <ModalBorder
        className="competitors-ranks-report"
        title={t('Create Report')}
        onClose={this.handleClose}
      >
        <CompetitorsRanksReportForm
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
)(CompetitorsRanksReport);
