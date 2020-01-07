// @flow
import React, { Component } from 'react';

class SpacerUnderline extends Component {
  props: {
    style: Object,
  };

  static defaultProps = {
    style: null,
  };

  render() {
    return <span style={this.props.style} className="skeleton-line skeleton-spacer-underline" />;
  }
}

export default SpacerUnderline;
