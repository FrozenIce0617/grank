// @flow
import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { removeInitialLoader } from 'Utilities/underdash';

export default class NoStoreRoute extends Component<{}> {
  constructor() {
    super();

    removeInitialLoader();
  }

  render() {
    return <Route {...this.props} />;
  }
}
