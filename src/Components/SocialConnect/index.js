// @flow
import React, { Component } from 'react';
import { Col, Row, Container } from 'reactstrap';
import GoogleButton from './Google';
import FacebookButton from './Facebook';

type Props = {};

class SocialConnect extends Component<Props> {
  render() {
    return (
      <Container>
        <Row>
          <Col md={6}>
            <FacebookButton />
          </Col>
          <Col md={6}>
            <GoogleButton />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default SocialConnect;
