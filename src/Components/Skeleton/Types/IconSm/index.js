// @flow
import React, { Component } from 'react';

class IconSm extends Component {
  props: {
    style: Object,
  };

  static defaultProps = {
    style: null,
  };

  render() {
    return (
      <span style={this.props.style} className="skeleton-line skeleton-icon skeleton-icon-sm" />
    );
  }
}

export default IconSm;
