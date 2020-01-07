// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Row, Col } from 'reactstrap';

import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import IconButton from 'Components/IconButton';
import NewIcon from 'icons/plus-rounded.svg?inline';
import Toast from 'Components/Toast';
import { REPORTS_SCHEDULED } from 'Pages/Layout/ActionsMenu';

import ReportsTable from '../ReportsTable';
import { TableIDs } from 'Types/Table';

import '../reports-overview.scss';

import { t } from 'Utilities/i18n';
import underdash from 'Utilities/underdash';

type Props = {
  deleteScheduledReport: Function,
  scheduledReports: Object,
};

type State = {};

class ScheduledReportsTable extends Component<Props, State> {
  transformReport = (report: Object) => ({ ...report, ...report.scheduledReportNew });

  handleDeleteScheduledReport = report => {
    const input = {
      id: report.id,
    };

    this.props
      .deleteScheduledReport({ variables: { input } })
      .then(({ data: { deleteScheduledReport: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Unable to delete scheduled report'));
        } else {
          Toast.success(t('Scheduled report deleted'));
          this.props.scheduledReports.refetch();
        }
      });
  };

  renderScheduledReportsTable() {
    const reports =
      underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })
        ? null
        : this.props.scheduledReports.scheduledReports;
    return (
      <ReportsTable
        isScheduledReports
        isLoading={underdash.graphqlLoading({ ...this.props })}
        hasError={underdash.graphqlError({ ...this.props })}
        tableName={TableIDs.SCHEDULED_REPORTS}
        title={t('Scheduled Reports')}
        reports={reports}
        handleDeleteClick={this.handleDeleteScheduledReport}
        deleteTitle={t('Delete Scheduled Report?')}
        deleteDescription={t('The scheduled report will no longer be generated')}
      />
    );
  }

  renderActionButtons = () => {
    const actions = [
      <IconButton
        key="new"
        brand="orange"
        link="/reports/schedule"
        icon={<NewIcon />}
        onMouseDown={() => {}}
      >
        {t('New scheduled report')}
      </IconButton>,
    ];
    return actions;
  };

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={REPORTS_SCHEDULED} hidePeriodFilter>
          {this.renderActionButtons()}
        </ActionsMenu>
        <Container fluid className="reports-table-wrapper content-container">
          <Row>
            <Col xs={12}>{this.renderScheduledReportsTable()}</Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

const scheduledReportsQuery = gql`
  query scheduledReportsTable_scheduledReports {
    scheduledReports(isOneTimeReport: false) {
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
      schedule
      scheduledDay
      reportType
      name
      description
      isGroupReport
      isOneTimeReport
      language
      emailSubject
      emailBody
      sender
      recipients
      reportTemplate {
        id
        systemTemplate
        name
      }
      reportFilter {
        id
        filters
      }
    }
  }
`;

const deleteScheduledReportQuery = gql`
  mutation scheduledReportsTable_deleteScheduledReport($input: DeleteScheduledReportInput!) {
    deleteScheduledReport(input: $input) {
      scheduledReport {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

const options: Object = { fetchPolicy: 'network-only' };

export default compose(
  graphql(scheduledReportsQuery, { name: 'scheduledReports', options }),
  graphql(deleteScheduledReportQuery, { name: 'deleteScheduledReport' }),
)(ScheduledReportsTable);
