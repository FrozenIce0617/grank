// @flow
import React, { Component } from 'react';
import './radial-progress.scss';

type Props = {
  progress: number,
};

export default class RadialProgress extends Component<Props> {
  static defaultProps = {
    progress: 0,
  };

  render() {
    const { progress } = this.props;
    return (
      <div className="radial-progress" data-progress={Math.round(progress)}>
        <div className="circle-loader">
          <span />
        </div>
        <div className="mask full">
          <div className="fill" />
        </div>
        <div className="mask half">
          <div className="fill" />
          <div className="fill fix" />
        </div>
      </div>
    );
  }
}
