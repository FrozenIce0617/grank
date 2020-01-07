// @flow
import React, { Component } from 'react';
import { Row, Col, Container } from 'reactstrap';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import TransferMultiAccountDomainForm from './TransferMultiAccountDomainForm';
import ActionsMenu, { TRANSFER_ACCOUNTS_DOMAINS } from 'Pages/Layout/ActionsMenu';

class TransferMultiAccountDomain extends Component<{}> {
  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={TRANSFER_ACCOUNTS_DOMAINS} />
        <Container fluid className="content-container with-padding">
          <Row>
            <Col lg={5}>
              <TransferMultiAccountDomainForm />
            </Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default TransferMultiAccountDomain;
