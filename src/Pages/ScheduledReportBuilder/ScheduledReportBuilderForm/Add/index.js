// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { gaSetPassedState } from 'Actions/GoogleAccountsAction';

import { stringifyFilters } from 'Types/Filter';
import Toast from 'Components/Toast';

import { t } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import { showModal } from 'Actions/ModalAction';
import Form from './../../ScheduledReportBuilderForm';

type Props = {
  history: Object,
  user: Object,
  addScheduledReport: Function,
  hasDriveAccount: boolean,
  showModal: Function,
  initialState: Object,
  gaSetPassedState: Function,
};

class AddScheduledReport extends Component<Props> {
  componentWillUnmount() {
    this.props.gaSetPassedState(null);
  }

  handleSubmit = (data: any) => {
    const {
      group,
      domain,
      name,
      description,
      emailBody,
      sender,
      emailSubject,
      emails,
      filters,
      language: { value: language },
      reportType: { value: reportType },
      schedule,
      scheduledDay,
      isGroupReport,
      template: { value: reportTemplate },
    } = data;

    const {
      hasDriveAccount,
      user: {
        organization: { id: organization },
      },
    } = this.props;
    const input = {
      isGroupReport: !!isGroupReport,
      name,
      description,
      isOneTimeReport: false,
      reportType,
      reportFilter: {
        filters: stringifyFilters(filters),
      },
      reportTemplate,
      schedule: schedule.value || schedule,
      scheduledDay: (schedule.value || schedule) === 1 ? null : scheduledDay,
      recipients: emails ? emails : [],
      sender,
      emailSubject,
      emailBody,
      language,
      ...(isGroupReport ? { group: group.value } : { domain: domain.value }),
    };

    // pop the google auth flow if we dont have an account
    if (reportType === 5 && !hasDriveAccount) {
      this.handleMissingDriveAccount(data);
      return;
    }

    return this.props
      .addScheduledReport({ variables: { input } })
      .then(({ data: { addScheduledReport: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Unable to create scheduled report'));
          Validator.throwSubmissionError(errors);
        }
        Toast.success(t('Report scheduled'));
        this.props.history.push('/reports/scheduled');
      });
  };

  handleMissingDriveAccount = data => {
    this.props.showModal({
      modalType: 'ConnectToDrive',
      modalTheme: 'light',
      modalProps: {
        message: t(
          'You do not have a Google Drive connection setup with AccuRanker. Please connect to your Google account to allow AccuRanker to create spreadsheet reports. AccuRanker will only have access to the files it creates, and cannot read other files.',
        ),
        lastState: data,
      },
    });
  };

  render() {
    const { initialState, hasDriveAccount } = this.props;
    return (
      <Form
        onSubmit={this.handleSubmit}
        initialValues={initialState || {}}
        submitOnInit={!!initialState}
        hasDriveAccount={hasDriveAccount}
      />
    );
  }
}

const addScheduledReportQuery = gql`
  mutation addScheduledReport_addScheduledReport($input: CreateScheduledReportInput!) {
    addScheduledReport(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const mapStateToProps = state => ({
  user: state.user,
  hasDriveAccount: state.user.googleConnections.length > 0,
  initialState: state.googleAccounts.passedState,
});

export default compose(
  connect(
    mapStateToProps,
    { showModal, gaSetPassedState },
  ),
  withRouter,
  graphql(addScheduledReportQuery, { name: 'addScheduledReport' }),
)(AddScheduledReport);
