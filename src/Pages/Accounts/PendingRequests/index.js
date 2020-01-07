// @flow
import React, { Component } from 'react';
import { Container, Col, Row } from 'reactstrap';
import { connect } from 'react-redux';

import ActionsMenu, { ACCOUNTS_REQUESTS } from 'Pages/Layout/ActionsMenu';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';

import PendingRequestsTable from './Table';
import { t } from 'Utilities/i18n/index';

import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
};

type State = {
  renderState: number,
};

class PendingRequests extends Component<Props, State> {
  state = {
    renderState: +new Date(),
  };

  handleAdd = () => {
    this.props.showModal({
      modalType: 'RequestAccess',
      modalTheme: 'light',
      modalProps: {
        refresh: this.updateRenderState,
      },
    });
  };

  updateRenderState = () => this.setState({ renderState: +new Date() });

  renderActionButtons = () => [
    <Actions.AddAction
      key="add"
      label={t('Request access to another account')}
      onClick={this.handleAdd}
    />,
  ];

  render() {
    const { renderState } = this.state;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={ACCOUNTS_REQUESTS}>{this.renderActionButtons()}</ActionsMenu>
        <Container fluid className="content-container">
          <Row noGutters>
            <Col>
              <PendingRequestsTable
                updateRenderState={this.updateRenderState}
                renderState={renderState}
              />
            </Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(PendingRequests);
