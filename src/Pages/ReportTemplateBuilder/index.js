// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import { withRouter } from 'react-router-dom';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ElementTypes from './ElementTypes';
import ReportTemplate from './ReportTemplate';
import TemplateParams from './TemplateParams';
import ActionsMenu, { REPORTS_TEMPLATES } from 'Pages/Layout/ActionsMenu';
import './report-template-builder.scss';

type Props = {
  handleSave: Function,
  history: Object,
  backLink?: string,
};

class ReportTemplateBuilder extends Component<Props> {
  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={REPORTS_TEMPLATES} />
        <div className="report-template-builder content-container with-padding">
          <div className="column-left">
            <ElementTypes />
          </div>
          <div className="column-right">
            <TemplateParams />
            <ReportTemplate handleSave={this.props.handleSave} backLink={this.props.backLink} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default withRouter(ReportTemplateBuilder);
