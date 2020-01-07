// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { stringifyFilters, parseFilters } from 'Types/Filter';
import Toast from 'Components/Toast';
import { showModal } from 'Actions/ModalAction';
import { gaSetPassedState } from 'Actions/GoogleAccountsAction';
import { t } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';
import Form from './../';

type Props = {
  id: string,
  history: Object,
  user: Object,
  addReportFilter: Function,
  updateScheduledReport: Function,
  data: Object,
  hasDriveAccount: boolean,
  showModal: Function,
  initialState: Object,
  gaSetPassedState: Function,
};

class EditScheduledReport extends Component<Props> {
  componentWillUnmount() {
    this.props.gaSetPassedState(null);
  }

  handleSubmit = (data: any) => {
    const {
      domain,
      group,
      name,
      description,
      emailBody,
      sender,
      emailSubject,
      emails,
      language,
      reportType,
      schedule,
      filters,
      scheduledDay,
      isGroupReport,
      template: reportTemplate,
    } = data;

    const {
      hasDriveAccount,
      user: {
        organization: { id: organization },
      },
      id,
    } = this.props;
    const input = {
      name,
      description,
      isGroupReport: !!isGroupReport,
      isOneTimeReport: false,
      reportType: reportType.value || reportType,
      reportTemplate: reportTemplate.value || reportTemplate,
      reportFilter: {
        filters: stringifyFilters(filters),
      },
      schedule: schedule.value || schedule,
      scheduledDay: (schedule.value || schedule) === 1 ? null : scheduledDay,
      recipients: emails ? emails : [],
      sender,
      emailSubject,
      emailBody,
      language: language.value || language,
      ...(isGroupReport ? { group: group.value || group } : { domain: domain.value || domain }),
      id,
    };

    // pop the google auth flow if we dont have an account
    if (input.reportType === 5 && !hasDriveAccount) {
      this.handleMissingDriveAccount(data);
      return;
    }

    return this.props
      .updateScheduledReport({ variables: { input } })
      .then(({ data: { updateScheduledReport: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Unable to update scheduled report'));
          Validator.throwSubmissionError(errors);
        }
        Toast.success(t('Report updated'));
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
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return null;
    }
    const {
      data: {
        scheduledReport,
        scheduledReport: {
          domain,
          group,
          recipients,
          reportType,
          schedule,
          reportFilter: { id, filters },
        },
      },
      initialState,
      hasDriveAccount,
    } = this.props;
    const initialValues = initialState || {
      ...scheduledReport,
      reportType: parseInt(reportType.slice(2, 3), 10),
      schedule: parseInt(schedule.slice(2, 3), 10),
      filters: parseFilters(filters),
      emails: recipients,
      isGroupReport: scheduledReport.isGroupReport,
      ...(scheduledReport.isGroupReport
        ? {
            group: {
              label: group.name,
              value: group.id,
            },
          }
        : {
            domain: {
              label:
                (domain.displayName && `${domain.displayName} (${domain.domain})`) || domain.domain,
              value: domain.id,
            },
          }),
    };
    return (
      <Form
        onSubmit={this.handleSubmit}
        initialValues={initialValues}
        submitOnInit={!!initialState}
        hasDriveAccount={hasDriveAccount}
      />
    );
  }
}

const DataQuery = gql`
  query editScheduledReport_scheduledReport($id: ID!) {
    scheduledReport(id: $id) {
      id
      domain {
        id
        domain
        displayName
      }
      group {
        id
        name
      }
      name
      description
      reportType
      recipients
      sender
      reportFilter {
        id
        filters
      }
      reportTemplate {
        id
        name
      }
      language
      emailSubject
      emailBody
      isGroupReport
      schedule
      scheduledDay
    }
  }
`;

const updateScheduledReportQuery = gql`
  mutation editScheduledReport_updateScheduledReport($input: UpdateScheduledReportInput!) {
    updateScheduledReport(input: $input) {
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
  graphql(DataQuery, { options: () => ({ fetchPolicy: 'network-only' }) }),
  graphql(updateScheduledReportQuery, { name: 'updateScheduledReport' }),
)(EditScheduledReport);
