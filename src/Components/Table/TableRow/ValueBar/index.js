// @flow
import React, { Component } from 'react';
import Checkmark from 'icons/check.svg?inline';
import './value-bar.scss';

type Props = {
  value: number,
  color: 'info' | 'success' | 'danger' | 'warning',
  checkmarkOnComplete?: boolean,
};

class ValueBar extends Component<Props> {
  static defaultProps = {
    color: 'info',
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value || nextProps.color !== this.props.color;
  }

  renderBar(width: number) {
    const { color } = this.props;
    return (
      <span className="value-bar">
        <span style={{ width: `${width}%` }} className={`value-indicator ${color}`} />
      </span>
    );
  }

  renderCheckmark() {
    const { color } = this.props;
    return <Checkmark className={`value-indicator-checkmark ${color}`} />;
  }

  renderBarOrCheckmark() {
    const { value } = this.props;
    const percentWidth = value * 100;
    const { checkmarkOnComplete } = this.props;
    if (checkmarkOnComplete && percentWidth === 100) return this.renderCheckmark();
    return this.renderBar(percentWidth);
  }

  render() {
    return this.renderBarOrCheckmark();
  }
}

export default ValueBar;
