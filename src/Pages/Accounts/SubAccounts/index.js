// @flow
import React, { Component } from 'react';
import { Container, Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import cn from 'classnames';

import ActionsMenu, { SUB_ACCOUNTS } from 'Pages/Layout/ActionsMenu';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import InformationForm from 'Pages/Accounts/SubAccounts/InformationForm';

import SubAccountsTable from './Table';
import { t } from 'Utilities/i18n/index';

import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
  user: Object,
};

type State = {
  renderState: number,
};

class SubAccounts extends Component<Props, State> {
  state = {
    renderState: +new Date(),
  };

  handleAddSubAccount = () => {
    this.props.showModal({
      modalType: 'AddSubAccount',
      modalTheme: 'light',
      modalProps: {
        refresh: this.updateRenderState,
      },
    });
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
      key="addSubAccount"
      label={t('Add sub-account')}
      onClick={this.handleAddSubAccount}
      disabled={!this.props.user.isOrgAdmin}
      showTooltip={!this.props.user.isOrgAdmin}
      tooltip={t('Only admin users can create new sub-accounts')}
    />,
    <Actions.AddAction
      key="add"
      label={t('Request access to another account')}
      onClick={this.handleAdd}
    />,
  ];

  render() {
    const { renderState } = this.state;
    const { user } = this.props;

    const subAccountsEnabled = user.organization.isPartner;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SUB_ACCOUNTS}>
          {subAccountsEnabled ? this.renderActionButtons() : null}
        </ActionsMenu>
        <Container
          fluid
          className={cn('content-container', { 'with-padding': !subAccountsEnabled })}
        >
          <Row noGutters>
            {subAccountsEnabled ? (
              <Col>
                <SubAccountsTable
                  updateRenderState={this.updateRenderState}
                  renderState={renderState}
                />
              </Col>
            ) : (
              <Col lg={4}>
                <strong className="form-title">{t('Information')}</strong>
                <InformationForm user={user} />
              </Col>
            )}
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default connect(
  ({ user }) => ({ user }),
  { showModal },
)(SubAccounts);
