// @flow
import * as React from 'react';
import Overlay from 'Components/Overlay';
import cn from 'classnames';

type Props = {
  className?: string,
  children: React.Node,
  onTop?: React.Node,
  onBottom?: React.Node,
  isEnabled: boolean,
};

class OverlayCell extends React.Component<Props> {
  render() {
    const { className } = this.props;
    return <Overlay {...this.props} tag="td" className={cn('blurry-overlay-cell', className)} />;
  }
}

export default OverlayCell;
