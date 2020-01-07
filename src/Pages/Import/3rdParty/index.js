// @flow
import React, { Component } from 'react';
import { Container, Col, Row } from 'reactstrap';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu from 'Pages/Layout/ActionsMenu';

import ImportProviders from 'Components/Modal/Content/AddKeywords/Import';

type Props = {};

class ImportFromGSC extends Component<Props> {
  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="keywords_import_3rd_party" />
        <Container className="generic-page" fluid>
          <div>
            <Row>
              <Col>
                <ImportProviders />
              </Col>
            </Row>
          </div>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default ImportFromGSC;
