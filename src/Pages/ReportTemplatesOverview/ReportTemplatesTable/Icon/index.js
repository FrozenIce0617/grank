// @flow
import React, { Component, type ComponentType } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import './table-icon-indicator.scss';

type Props = {
  icon: ComponentType<*>,
  tooltip: string,
  ignored?: boolean,
};

class Icon extends Component<Props> {
  iconId: string;

  constructor(props: Props) {
    super(props);
    this.iconId = uniqueId('icon');
  }

  render() {
    const IconTag = this.props.icon;
    return (
      <span className={`table-icon-indicator ${this.props.ignored ? 'ignored' : ''}`}>
        <IconTag id={this.iconId} />
        <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={this.iconId}>
          {this.props.tooltip}
        </UncontrolledTooltip>
      </span>
    );
  }
}

export default Icon;
