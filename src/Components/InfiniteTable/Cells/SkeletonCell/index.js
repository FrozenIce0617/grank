// @flow
import React, { Component } from 'react';
import './skeleton-cell.scss';

type Props = {
  width: number,
  responsive?: boolean,
};

class SkeletonCell extends Component<Props> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { responsive, width } = this.props;
    return (
      <span
        className="skeleton-cell"
        style={{
          width,
          ...(responsive ? { flex: 1 } : {}),
        }}
      />
    );
  }
}

export default SkeletonCell;
