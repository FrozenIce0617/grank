// @flow
import React, { PureComponent, type Element } from 'react';
import { withRouter } from 'react-router';
import { Container, Row, Col } from 'reactstrap';

import NavLeft from '../NavLeft';
import Footer from '../Footer';
import TrialBar from '../TrialBar';
import SupportWidget from '../SupportWidget';
import ImpersonateOrganization from '../ImpersonateOrganization';
import QuickSearch from '../QuickSearch';
import MessagesDropdown from '../MessagesDropdown';
import AccountInfo from '../AccountInfo';

import './template-nav-left.scss';

class TemplateNavLeft extends PureComponent {
  props: {
    children: Element<*>,
  };

  render() {
    return (
      <div className="nav-wrapper">
        <NavLeft />
        <div className="content">
          <TrialBar />
          <main>
            <Container fluid className="content-wrapper">
              <Row className="options-row">
                <Col md={6} lg={6} className="admin-bar">
                  <ImpersonateOrganization />
                </Col>
                {/* <Col md={12} lg={11}>
                  <QuickSearch />
                </Col> */}
                <Col lg={1}>
                  <Row>
                    <Col md={6} className="hidden-md-down">
                      <MessagesDropdown theme="dark" />
                    </Col>
                    <Col md={6} className="hidden-md-down">
                      <AccountInfo />
                    </Col>
                  </Row>
                </Col>
              </Row>
              {this.props.children}
            </Container>
          </main>
          <Footer />
        </div>
        <SupportWidget />
      </div>
    );
  }
}

export default withRouter(TemplateNavLeft);
