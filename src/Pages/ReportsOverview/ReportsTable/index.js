// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';
import moment from 'moment';
import { showModal } from 'Actions/ModalAction';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import Icon from './Icon';
import { noop } from 'lodash';
import PDFIcon from 'icons/pdf.svg?inline';
import ExcelIcon from 'icons/xls.svg?inline';
import CSVIcon from 'icons/csv.svg?inline';
import GoogleIcon from 'icons/google-drive.svg?inline';
import TableEmptyState from 'Components/TableEmptyState';
import OptionsDropdown from 'Components/Controls/Dropdowns/OptionsDropdown';
import StickyContainer from 'Components/Sticky/Container';
import Sticky from 'Components/Sticky';
import { StickyIDs } from 'Types/Sticky';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import Ellipsis from 'Components/Ellipsis';

import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';

import { t } from 'Utilities/i18n';

type Props = {
  reports: ?Array<Object>,

  showModal: Function,
  isLoading: boolean,
  hasError: boolean,
  tableName: string,

  isScheduledReports: boolean,

  handleDeleteClick: Function,
  deleteTitle: String,
  deleteDescription: String,
};

type State = {};

class ReportsTable extends Component<Props, State> {
  static defaultProps = {
    handleEditClick: noop,
    handleDeleteClick: noop,
  };

  getRows = () => this.props.reports || [];

  getDropdownOptions = report => [
    report.url && {
      className: 'dropdown-item-no-icon',
      label: t('Download'),
      onSelect: () => {
        window.open(report.url, '_blank').focus();
      },
    },
    report.schedule && {
      label: t('Edit'),
      link: `/reports/schedule/edit/${report.id}`,
      icon: <EditIcon />,
    },
    {
      label: t('Delete'),
      onSelect: () => this.handleDelete(() => this.props.handleDeleteClick(report)),
      icon: <DeleteIcon />,
    },
  ];

  handleDelete = (action: Function) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete'),
        lockDuration: 0,
        title: this.props.deleteTitle,
        description: this.props.deleteDescription,
        action,
      },
    });
  };

  renderReportType = (reportType: String) => {
    switch (reportType) {
      case 'A_1':
        return <Icon icon={PDFIcon} tooltip={t('PDF')} />;
      case 'A_2':
        return <Icon icon={ExcelIcon} tooltip={t('Excel')} />;
      case 'A_3':
        return <Icon icon={CSVIcon} tooltip={t('CSV')} />;
      case 'A_5':
        return <Icon icon={GoogleIcon} tooltip={t('Google Sheets')} />;
      default:
        return 'unknown';
    }
  };

  renderSchedule = (schedule: String, scheduledDay?: Number) => {
    switch (schedule) {
      case 'A_1':
        return t('Runs daily');
      case 'A_2':
        const days = [
          t('monday'),
          t('tuesday'),
          t('wednesday'),
          t('thursday'),
          t('friday'),
          t('saturday'),
          t('sunday'),
        ];
        return t(
          'Runs every %s',
          typeof scheduledDay === 'number' ? days[scheduledDay] : 'unknown',
        );
      case 'A_3':
        return t('Runs on the %s. day of every month', scheduledDay);
      default:
        return 'unknown';
    }
  };

  renderDateField = (report: Object) => {
    if (report.createdAt) {
      return moment(report.createdAt).format('LLL');
    }
    return this.renderSchedule(report.schedule, report.scheduledDay);
  };

  renderRowScheduled = (report: Object) => {
    const groupOrDomainName = report.isGroupReport
      ? t('All domains is %s', report.group.name)
      : `${report.domain.domain}${
          report.domain.displayName ? ` (${report.domain.displayName})` : ''
        }`;
    let reportTemplateName = <Ellipsis>{report.reportTemplate.name}</Ellipsis>;
    if (!report.reportTemplate.systemTemplate) {
      reportTemplateName = (
        <Link to={`/reports/templates/builder/edit/${report.reportTemplate.id}`}>
          {reportTemplateName}
        </Link>
      );
    }
    return (
      <tr key={report.id}>
        <td>{this.renderReportType(report.reportType)}</td>
        <td>{report.name}</td>
        <td className="xdomain-cell">
          <Ellipsis>{groupOrDomainName}</Ellipsis>
        </td>
        <td className="ellipsis">{reportTemplateName}</td>
        <td className="ellipsis">
          <Ellipsis>{this.renderDateField(report)}</Ellipsis>
        </td>
        <td className="">
          <OptionsDropdown items={this.getDropdownOptions(report)} />
        </td>
      </tr>
    );
  };
  renderRowGenerated = (report: Object) => {
    const groupOrDomainName = report.isGroupReport
      ? t('All domains is %s', report.group.name)
      : `${report.domain.domain}${
          report.domain.displayName ? ` (${report.domain.displayName})` : ''
        }`;

    return (
      <tr key={report.id}>
        <td>{this.renderReportType(report.reportType)}</td>
        <td className="domain-cell">
          <Ellipsis>{groupOrDomainName}</Ellipsis>
        </td>
        <td />
        <td className="ellipsis">
          <Ellipsis>{this.renderDateField(report)}</Ellipsis>
        </td>
        <td className="">
          <OptionsDropdown items={this.getDropdownOptions(report)} />
        </td>
      </tr>
    );
  };

  renderBody = () => {
    if (this.props.isLoading || this.props.hasError) {
      return this.renderSkeleton();
    }
    return (
      <StickyContainer name={this.props.tableName} tag="tbody">
        {this.getRows().map(
          this.props.isScheduledReports ? this.renderRowScheduled : this.renderRowGenerated,
        )}
      </StickyContainer>
    );
  };

  renderHead = () => (
    <Sticky
      containerName={this.props.tableName}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          {this.getHeadCells()}
        </tr>
      )}
    </Sticky>
  );

  getHeadCells = () =>
    this.props.isScheduledReports
      ? [
          <th key="type">{t('Type')}</th>,
          <th key="report">{t('Name')}</th>,
          <th key="reportFor">{t('Report For')}</th>,
          <th key="template">{t('Template Name')}</th>,
          <th key="schedule">{t('Schedule')}</th>,
          <th key="empty" />,
        ]
      : [
          <th key="type">{t('Type')}</th>,
          <th key="reportFor">{t('Report For')}</th>,
          <th key="empty1" />,
          <th key="date">{t('Date')}</th>,
          <th key="empty2" />,
        ];

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
    </SkeletonTableBody>
  );

  render() {
    return (
      <div className="reports-table">
        <Table className="data-table table">
          <colgroup span="4">
            <col className="report-type" />
            <col className="report-name" />
            <col className="report-domain" />
            <col className="report-template" />
            <col className="report-schedule" />
            <col className="report-actions" />
          </colgroup>
          {this.renderHead()}
          {this.renderBody()}
        </Table>
        {!this.props.isLoading &&
          !this.props.hasError && (
            <TableEmptyState
              list={this.props.reports}
              title={t('No Data')}
              subTitle={t('There is currently no data in this table.')}
            />
          )}
      </div>
    );
  }
}

export default connect(
  null,
  { showModal },
)(ReportsTable);
