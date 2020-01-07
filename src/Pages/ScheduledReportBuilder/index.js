// @flow
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

import ActionsMenu, { REPORTS_SCHEDULED } from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';

import { t } from 'Utilities/i18n';

import AddForm from './ScheduledReportBuilderForm/Add';
import EditForm from './ScheduledReportBuilderForm/Edit';
import Preview from './Preview';

import './scheduled-report-builder.scss';

type Props = {
  match: Object,
  backLink?: string,
};

type State = {};

class ScheduledReportBuilder extends Component<Props, State> {
  render() {
    const {
      backLink,
      match: {
        params: { id },
      },
    } = this.props;
    const Form = id ? EditForm : AddForm;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={REPORTS_SCHEDULED} hidePeriodFilter />
        <div className="scheduled-report-builder-wrapper">
          <Row>
            <Col xs="5">
              <Form backLink={backLink} id={id} />
            </Col>
            <Col>
              <div className="preview-header">
                <div>{t('Preview')}</div>
                <small>
                  {t('The preview is PDF only and includes no more than 100 keywords.')}
                </small>
                <hr />
              </div>
              <Preview />
            </Col>
          </Row>
        </div>
      </DashboardTemplate>
    );
  }
}

export default ScheduledReportBuilder;
