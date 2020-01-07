// @flow
import React, { Component, Fragment } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { showModal } from 'Actions/ModalAction';

import Invoices from 'Pages/Invoices/Table';
import Plan from './Plan';
import PaymentContact from './PaymentContact';
import PaymentMethod from './PaymentMethod';

import { t } from 'Utilities/i18n';

import './billing-overview.scss';
import LabelWithHelp from 'Components/LabelWithHelp';

type Props = {
  user: Object,
  history: Object,
};

class BillingOverview extends Component<Props> {
  handleEditBillingInfo = () => {
    const { history } = this.props;
    history.push('/billing/paymentinfo');
  };
  handleEditPaymentMethod = () => {
    const { history } = this.props;
    history.push('/billing/paymentmethod');
  };
  handleAddVoucher = () => {
    this.props.showModal({
      modalType: 'AddVoucher',
      modalTheme: 'light',
    });
  };

  renderActionButtons = () => {
    const {
      isOrgAdmin,
      organization: { active, activePlan },
    } = this.props.user;

    const label = active ? t('Change plan') : t('Reactivate');
    return (
      <Fragment>
        <Actions.AddAction
          link="/billing/package/select"
          label={label}
          disabled={!isOrgAdmin}
          showTooltip={!isOrgAdmin}
          tooltip={
            active
              ? t('Only admin users can change the plan')
              : t('Only admin users can reactivate the plan')
          }
        />
        <Actions.EditAction
          label={t('Update billing info')}
          onClick={this.handleEditBillingInfo}
          disabled={!isOrgAdmin}
          showTooltip={!isOrgAdmin}
          tooltip={t('Only admin users can update billing information')}
        />
        <Actions.EditAction
          label={t('Update payment method')}
          onClick={this.handleEditPaymentMethod}
          disabled={!isOrgAdmin}
          showTooltip={!isOrgAdmin}
          tooltip={t('Only admin users can update payment method')}
        />
        {activePlan &&
          activePlan.isPrepaidVoucher && (
            <Actions.AddAction
              label={t('Add prepaid voucher')}
              onClick={this.handleAddVoucher}
              disabled={!isOrgAdmin}
              showTooltip={!isOrgAdmin}
              tooltip={t('Only admin users can add prepaid vouchers')}
            />
          )}
      </Fragment>
    );
  };

  render() {
    const {
      isOrgAdmin,
      organization: { id, active },
    } = this.props.user;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="account_billing">{this.renderActionButtons()}</ActionsMenu>
        <Container fluid className="billing-overview content-container multi">
          <Row className="content-row" noGutters>
            <Col md={4} xs={12} className="pb-4">
              <LabelWithHelp>{t('Plan Info')}</LabelWithHelp>
              <Plan isActive={active} isOrgAdmin={isOrgAdmin} />
            </Col>
            <Col md={4} xs={12}>
              <LabelWithHelp>{t('Billing Info')}</LabelWithHelp>
              <PaymentContact isOrgAdmin={isOrgAdmin} />
            </Col>
            <Col md={4} xs={12}>
              <LabelWithHelp>{t('Payment Method')}</LabelWithHelp>
              <PaymentMethod isOrgAdmin={isOrgAdmin} />
            </Col>
          </Row>
          <Row noGutters>
            <LabelWithHelp>{t('Invoices')}</LabelWithHelp>
            <div className="invoices-panel" style={{ width: '100%' }}>
              <Invoices id={id} />
            </div>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    { showModal },
  ),
)(BillingOverview);
