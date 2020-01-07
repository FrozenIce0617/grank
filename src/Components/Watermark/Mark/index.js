// @flow
import React, { Component } from 'react';
import WatermarkImage from 'icons/logo-watermark.svg?inline';
import { uniqueId } from 'lodash';

const watermarkHeight = 40; // Used for rotated calc
const spaceBetweenWatermarks = 120;

type Props = {
  big: boolean,
  containerWidth: number,
  offset: boolean,
  cutNumber: number, // Amount of watermarks to cut off to keep space on the edges
};

class Mark extends Component<Props> {
  static defaultProps = {
    cutNumber: 2,
  };

  createRotatedWatermarkStyle = (iteration: number, left: number) => ({
    width: '120px',
    height: `${watermarkHeight}px`,
    position: 'absolute',
    left: iteration * left,
    top: '35%',
    opacity: '0.45',
    pointerEvents: 'none',
    transform: 'rotate(-50deg)',
  });

  renderMultipleWaterMarks = () => {
    const { cutNumber, offset, containerWidth } = this.props;
    if (!containerWidth) {
      return null;
    }

    const fullWatermarkSize = watermarkHeight + spaceBetweenWatermarks;
    const totalWatermarks = Math.ceil(
      (containerWidth - cutNumber * fullWatermarkSize) / fullWatermarkSize,
    );
    return totalWatermarks > 0
      ? [...Array(totalWatermarks)].map((arr, iteration) => {
          const left = watermarkHeight + spaceBetweenWatermarks;
          const style = this.createRotatedWatermarkStyle(offset ? iteration + 1 : iteration, left);
          return <WatermarkImage key={uniqueId('watermark')} style={style} />;
        })
      : null;
  };

  renderSmallWatermark = () => {
    const imageStyle = {
      width: '100px',
      height: 'auto',
      position: 'absolute',
      right: '8px',
      bottom: '32px',
      opacity: '0.4',
    };

    return <WatermarkImage style={imageStyle} />;
  };

  renderBigWatermark = () => <span>{this.renderMultipleWaterMarks()}</span>;

  render() {
    return this.props.big ? this.renderBigWatermark() : this.renderSmallWatermark();
  }
}

export default Mark;
