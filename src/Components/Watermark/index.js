// @flow
import React, { Component } from 'react';
import { AutoSizer } from 'react-virtualized';
import Mark from './Mark';
type Props = {
  big: boolean,
  offset: boolean,
  cutNumber?: number,
};

class Watermark extends Component<Props> {
  static defaultProps = {
    small: false,
    boolean: false,
    offset: false,
  };

  render() {
    const { offset, big, cutNumber } = this.props;

    return (
      <AutoSizer>
        {({ width }) => (
          <Mark big={big} cutNumber={cutNumber} offset={offset} containerWidth={width} />
        )}
      </AutoSizer>
    );
  }
}

export default Watermark;
