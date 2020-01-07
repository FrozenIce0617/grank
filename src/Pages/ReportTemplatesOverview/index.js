// @flow
import React, { Component } from 'react';

import { Container, Row, Col } from 'reactstrap';
import ReportTemplatesTable from './ReportTemplatesTable';
import ActionsMenu, { REPORTS_TEMPLATES } from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import IconButton from 'Components/IconButton';
import AddIcon from 'icons/plus-rounded.svg?inline';

import { t } from 'Utilities/i18n';

import './report-templates-overview.scss';

type Props = {};

type State = {};

class ReportTemplatesOverview extends Component<Props, State> {
  renderActionButtons = () => {
    const actions = [
      <IconButton
        key="new"
        icon={<AddIcon />}
        brand="orange"
        link="/reports/templates/builder"
        onMouseDown={() => {}}
      >
        {t('New template')}
      </IconButton>,
    ];
    return actions;
  };
  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={REPORTS_TEMPLATES} hidePeriodFilter>
          {this.renderActionButtons()}
        </ActionsMenu>
        <Container fluid className="content-container report-templates-overview-container">
          <Row noGutters>
            <Col>
              <ReportTemplatesTable />
            </Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default ReportTemplatesOverview;
