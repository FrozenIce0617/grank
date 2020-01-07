// @flow
import React, { Component } from 'react';

class Chart extends Component {
  props: {
    style: Object,
  };

  static defaultProps = {
    style: null,
  };

  render() {
    return <span style={this.props.style} className="skeleton-line skeleton-chart" />;
  }
}

export default Chart;
