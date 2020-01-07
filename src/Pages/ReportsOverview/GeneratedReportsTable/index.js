// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Row, Col } from 'reactstrap';

import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import Toast from 'Components/Toast';

import ReportsTable from '../ReportsTable';
import { TableIDs } from 'Types/Table';

import '../reports-overview.scss';

import { t } from 'Utilities/i18n';
import underdash from 'Utilities/underdash';

type Props = {
  deleteGeneratedReport: Function,
  generatedReports: Object,
};

type State = {};

class GeneratedReportsTable extends Component<Props, State> {
  transformReport = (report: Object) => ({ ...report, ...report.scheduledReportNew });

  handleDeleteGeneratedReport = ({ id }) => {
    const input = {
      id,
      delete: true,
    };

    this.props
      .deleteGeneratedReport({ variables: { input } })
      .then(({ data: { updateGeneratedReport: { generatedReport } } }) => {
        if (generatedReport) {
          Toast.error(t('Unable to delete report'));
        } else {
          Toast.success(t('Report deleted'));
          this.props.generatedReports.refetch();
        }
      });
  };

  renderGeneratedReportsTable() {
    const reports =
      underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })
        ? null
        : this.props.generatedReports.generatedReports.map(this.transformReport);

    return (
      <ReportsTable
        isLoading={underdash.graphqlLoading({ ...this.props })}
        hasError={underdash.graphqlError({ ...this.props })}
        reports={reports}
        tableName={TableIDs.GENERATED_REPORTS}
        handleDeleteClick={this.handleDeleteGeneratedReport}
        deleteTitle={t('Delete report?')}
        deleteDescription={t('The generated report will no longer be accessible')}
      />
    );
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="reports_generated" hidePeriodFilter />
        <Container fluid className="reports-table-wrapper content-container">
          <Row>
            <Col xs={12}>{this.renderGeneratedReportsTable()}</Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

const generatedReportsQuery = gql`
  query generatedReportsTable_generatedReports {
    generatedReports {
      id
      createdAt
      url
      scheduledReportNew {
        isGroupReport
        domain {
          id
          domain
          displayName
        }
        group {
          id
          name
        }
        reportType
      }
    }
  }
`;

const deleteGeneratedQuery = gql`
  mutation generatedReportsTable_updateGeneratedReport($input: UpdateGeneratedReportInput!) {
    updateGeneratedReport(input: $input) {
      generatedReport {
        id
      }
    }
  }
`;

export default compose(
  graphql(generatedReportsQuery, { name: 'generatedReports' }),
  graphql(deleteGeneratedQuery, { name: 'deleteGeneratedReport' }),
)(GeneratedReportsTable);
