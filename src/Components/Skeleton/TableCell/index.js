//@flow
import React, { Component } from 'react';
import Skeleton from 'Components/Skeleton';
import { omit } from 'lodash';

type Props = {
  className?: string,
  isEmpty?: boolean,
  skeletonProps?: Object,
};

export default class SkeletonTableCell extends Component<Props> {
  static displayName = 'SkeletonTableCell';

  render() {
    const { skeletonProps, isEmpty } = this.props;
    return (
      <td {...omit(this.props, ['skeletonProps', 'isEmpty'])}>
        {!isEmpty && skeletonProps ? <Skeleton {...skeletonProps} /> : null}
      </td>
    );
  }
}
