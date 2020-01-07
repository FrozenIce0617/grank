// @flow
import React, { Component } from 'react';
import { Container, Col, Row } from 'reactstrap';
import { withRouter } from 'react-router';

import UpdatePaymentMethodWidget from './UpdatePaymentMethodWidget';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { ACCOUNT_BILLING } from 'Pages/Layout/ActionsMenu';

type Props = {
  backLink?: string,
  history: Object,
};

class UpdatePaymentMethod extends Component<Props> {
  static defaultProps = {
    backLink: '/account/billing',
  };

  handleBack = () => {
    const { history, backLink } = this.props;
    history.push(backLink);
  };

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={ACCOUNT_BILLING} />
        <Container
          fluid
          className="checkout-container on-subscriptions-page content-container with-padding"
        >
          <Row>
            <Col md={6} xs={12}>
              <UpdatePaymentMethodWidget onBack={this.handleBack} onUpdate={this.handleBack} />
            </Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default withRouter(UpdatePaymentMethod);
