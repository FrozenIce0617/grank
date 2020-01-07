// @flow
import * as React from 'react';
import { Container } from 'reactstrap';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';

import './generic-page.scss';

type Props = {
  children: React.Node,
};

class GenericPage extends React.Component<Props> {
  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <Container className="generic-page" fluid>
          {this.props.children}
        </Container>
      </DashboardTemplate>
    );
  }
}

export default GenericPage;
