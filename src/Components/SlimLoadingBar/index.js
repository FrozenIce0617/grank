// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateWidthSlimLoading, resetSlimLoading } from 'Actions/SlimLoadingAction';

import './slim-loading-bar.scss';

const initialState = {
  progressInterval: null,
  width: 20,
};

let destroyTimeout = null;

class SlimLoadingBar extends Component {
  props: {
    incrementTimeout: number,
    maxLoadingWidth: number,
    slimLoaderActive: boolean,
    slimLoaderStack: number,
    widthIncrement: number,
    resetSlimLoading: Function,
  };

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidUpdate(prevProps) {
    const { incrementTimeout, maxLoadingWidth } = this.props;
    if (!prevProps.slimLoaderActive && this.props.slimLoaderActive) {
      this.incrementLoadingPercentage();
    }
    if (this.state.width === 100) {
      clearTimeout(this.state.progressInterval);
      const test = setTimeout(() => {
        this.props.resetSlimLoading();
        this.resetState();
      }, incrementTimeout + 100);
      destroyTimeout = test;
    }
    if (this.state.width === maxLoadingWidth) {
      clearTimeout(this.state.progressInterval);
    }
    if (
      prevProps.slimLoaderStack !== this.props.slimLoaderStack &&
      this.props.slimLoaderStack === 0
    ) {
      this.finishLoadingButKeepWAiting();
    }
  }

  getStackSize() {
    const { slimLoaderStack } = this.props;
    return slimLoaderStack;
  }

  finishLoadingButKeepWAiting() {
    const maxWaitingTime = 0;
    let timeWaited = 0;
    const waitingInterval = setInterval(() => {
      timeWaited = timeWaited + 10;
      if (this.getStackSize() > 0) {
        clearInterval(waitingInterval);
        return;
      }
      if (timeWaited >= maxWaitingTime) {
        this.setState({ width: 100 });
        clearInterval(waitingInterval);
      }
    }, 10);
  }

  resetState() {
    this.setState(initialState);
  }

  incrementLoadingPercentage() {
    clearTimeout(destroyTimeout);
    const { maxLoadingWidth, widthIncrement, incrementTimeout } = this.props;
    const animationTimer = setInterval(() => {
      const newWidth = Math.min(this.state.width + widthIncrement, maxLoadingWidth);
      this.setState({ width: newWidth });
    }, incrementTimeout);

    this.setState({ progressInterval: animationTimer });
  }

  render() {
    const { slimLoaderActive } = this.props;
    if (!slimLoaderActive) return null;
    return (
      <div className="slim-loading-bar-outer">
        <div style={{ width: `${this.state.width}%` }} className="slim-loading-bar-inner" />
      </div>
    );
  }
}

const mapStateToProps = ({
  slimLoader: { active, stack, maxLoadingWidth, widthIncrement, incrementTimeout },
}) => ({
  slimLoaderActive: active,
  slimLoaderStack: stack,
  maxLoadingWidth,
  widthIncrement,
  incrementTimeout,
});

export default connect(
  mapStateToProps,
  { updateWidthSlimLoading, resetSlimLoading },
)(SlimLoadingBar);
