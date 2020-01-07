// @flow
import React, { Component } from 'react';
import cn from 'classnames';
import EyeIcon from 'icons/eye.svg?inline';
import LinkIcon from 'icons/link.svg?inline';
import EyeSlashedIcon from 'icons/eye-slashed.svg?inline';
import UnlinkIcon from 'icons/unlink.svg?inline';
import TrophyIcon from 'icons/rewards-trophy.svg?inline';
import ValueDelta from 'Components/Table/TableRow/ValueDelta';
import './rank-change-cell.scss';

type Props = {
  delta: number,
  currentValue: number,
  type: string,
};

class RankChangeCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.delta !== this.props.delta || nextProps.type !== this.props.type;
  }

  generateRenderData() {
    const { type, delta: value } = this.props;
    switch (type) {
      case 'A_10': // Goal hit
        return { icon: <TrophyIcon className="icon" />, className: 'increase', value, type };
      case 'A_20': // Major jump
        return { icon: null, className: 'green', value, type };
      case 'A_30': // Started ranking
        return { icon: <EyeIcon className="icon" />, className: 'increase', value: null, type };
      case 'A_40': // Stopped ranking
        return {
          icon: <EyeSlashedIcon className="icon" />,
          className: 'decrease',
          value: null,
          type,
        };
      case 'A_50': // Major drop
        return { icon: null, className: 'red', value, type };
      case 'A_60': // Goal missed
        return {
          icon: <TrophyIcon className="icon" />,
          className: 'decrease',
          value,
          type,
        };
      case 'A_70': // Preferred URL started ranking
        return { icon: <LinkIcon className="icon" />, className: 'increase', value: null, type };
      case 'A_80': // Preferred URL stopped ranking
        return { icon: <UnlinkIcon className="icon" />, className: 'decrease', value: null, type };
      default:
        return { icon: null, className: '', value: null, type };
    }
  }

  render() {
    const { icon, className, value: delta, currentValue } = this.generateRenderData();
    return (
      <span className={cn('rank-change-cell', className)}>
        {icon}
        {delta && (
          <ValueDelta delta={delta} currentValue={currentValue} className="Kpi-evolution small" />
        )}
      </span>
    );
  }
}

export default RankChangeCell;
