// @flow
import React, { Component } from 'react';
import LoadingIcon from 'icons/loading.svg?inline';

import './loading-spinner.scss';

class LoadingSpinner extends Component<{}> {
  render() {
    return <LoadingIcon className="loading-spinner" />;
  }
}

export default LoadingSpinner;
