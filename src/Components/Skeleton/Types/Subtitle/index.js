// @flow
import React, { Component } from 'react';

class Subtitle extends Component {
  props: {
    style: Object,
  };

  static defaultProps = {
    style: null,
  };

  render() {
    return <span style={this.props.style} className="skeleton-line skeleton-subtitle" />;
  }
}

export default Subtitle;
