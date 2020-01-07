// @flow
import React, { Component, type ComponentType } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId, noop } from 'lodash';
import './table-icon-indicator.scss';

type Props = {
  icon: ComponentType<*>,
  tooltip: string,
  ignored?: boolean,
  inline?: boolean,
  onClick: Function,
};

class Icon extends Component<Props> {
  iconId: string;

  static defaultProps = {
    onClick: noop,
    inline: false,
    ignored: false,
  };

  constructor(props: Props) {
    super(props);
    this.iconId = uniqueId('icon');
  }

  render() {
    const IconTag = this.props.icon;
    return (
      <span
        className={`table-icon-indicator ${this.props.ignored ? 'ignored' : ''} ${
          this.props.inline ? 'inline' : ''
        }`}
        onClick={this.props.onClick}
      >
        <IconTag id={this.iconId} />
        <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={this.iconId}>
          {this.props.tooltip}
        </UncontrolledTooltip>
      </span>
    );
  }
}

export default Icon;
