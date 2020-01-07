// @flow
import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

type Props = {
  data: () => any,
};

class LegendTooltips extends Component<Props> {
  suffix = 0;

  render() {
    const { data } = this.props;
    // use unique keys on every render to remount tooltips
    this.suffix++;
    return data().map(item => (
      <UncontrolledTooltip
        key={`${item.id}-${this.suffix}`}
        delay={{ show: 0, hide: 0 }}
        placement="top"
        target={item.id}
      >
        {item.name}
      </UncontrolledTooltip>
    ));
  }
}

export default LegendTooltips;
