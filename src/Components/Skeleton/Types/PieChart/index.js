// @flow
import React, { Component } from 'react';

class PieChart extends Component {
  props: {
    style: Object,
  };

  static defaultProps = {
    style: null,
  };

  render() {
    return <span style={this.props.style} className="skeleton-line skeleton-pie-chart" />;
  }
}

export default PieChart;
