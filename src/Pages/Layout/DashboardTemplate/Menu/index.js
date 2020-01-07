// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import GroupsAndDomains from './GroupsAndDomains';

import './dashboard-menu.scss';

type Props = {
  match: Object,
  history: Object,
  user: Object,
};

type State = {
  currentPage: string,
  isOpen: boolean,

  selectedItem: number,
  selectWithMouse: boolean,
};

class Menu extends Component<Props, State> {
  render() {
    return (
      <div className="dashboard-menu">
        <GroupsAndDomains />
      </div>
    );
  }
}

export default compose(
  withRouter,
  connect(
    ({ user }) => ({ user }),
    null,
  ),
)(Menu);
