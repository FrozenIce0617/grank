// @flow
import React, { Component } from 'react';

class Button extends Component {
  props: {
    style: Object,
  };

  static defaultProps = {
    style: null,
  };

  render() {
    return <span style={this.props.style} className="skeleton-line skeleton-button" />;
  }
}

export default Button;
