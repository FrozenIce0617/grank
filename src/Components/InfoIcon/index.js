// @flow
import React, { Component } from 'react';
import { uniqueId, keyBy } from 'lodash';
import { UncontrolledTooltip } from 'reactstrap';

import './info-icon.scss';

class InfoIcon extends Component {
  props: {
    unavailable: boolean,
    reasons: any,
    field: string,
    children: any,
  };

  static defaultProps = {
    unavailable: false,
    reasons: null,
    field: '',
  };

  renderIcon(message: string, className?: string) {
    const targetId = uniqueId('Tooltip');
    const infoIconClassName = `info-tooltip ${className || ''}`;
    return (
      <span>
        <span className={infoIconClassName} id={targetId}>
          {'i'}
        </span>
        <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={targetId}>
          {message}
        </UncontrolledTooltip>
      </span>
    );
  }

  render() {
    const { unavailable, reasons, field } = this.props;
    const reasonsArray = keyBy(reasons, 'field');
    if (unavailable && reasons && reasonsArray.hasOwnProperty(field)) {
      return this.renderIcon(reasonsArray[field].message, 'error');
    }
    return this.renderIcon(this.props.children);
  }
}

export default InfoIcon;
