// @flow
import React, { Component } from 'react';
import { ArrowUp, ArrowDown } from 'Pages/Keywords/Table/Icon/Icons';
import './value-delta.scss';
import FormatNumber from 'Components/FormatNumber';
import cn from 'classnames';
import formatNumberHelper from 'Components/FormatNumber/formatNumberHelper';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import { tct } from 'Utilities/i18n';

type Props = {
  delta: number,
  currentValue: number,
  className?: string,
  showNumber?: boolean,
  currency?: string,
  reverseColor?: boolean,
  percentage: boolean,
  precision: number,
};

class ValueDelta extends Component<Props> {
  static defaultProps = {
    className: '',
    showNumber: true,
    currency: '',
    precision: 1,
    reverseColor: false,
    isRank: false,
  };

  id = uniqueId('value-delta');

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.delta !== this.props.delta;
  }

  renderOriginalValueTooltip() {
    const { currentValue, delta, reverseColor, isRank } = this.props;
    if (currentValue == null) {
      return null;
    }

    let compareValue;
    // The tooltip value is calculated by using 4 props of currentValue, delta, isRank, reverseColor
    // `currentValue` and `delta` is used to calc the compare value.
    // `isRank` is to determine if it is rank change calculation method. Because rank compare value calculation has difference.
    // `reverseColor` is to determine the arrow colors
    // rank and sov caculation metric is opposite.

    if (isRank) {
      compareValue = reverseColor ? currentValue - delta : currentValue + delta;
    } else {
      compareValue = reverseColor ? currentValue + delta : currentValue - delta;
    }

    return (
      <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={this.id}>
        {tct('Compare value: [val]', {
          val: this.renderFormattedValue(this.getFormattedValue(compareValue)),
        })}
      </UncontrolledTooltip>
    );
  }

  renderFormattedValue(formattedValue) {
    const { percentage, precision, currency } = this.props;
    return (
      <FormatNumber
        currency={currency}
        percentage={percentage}
        precision={precision}
        isEmptyAllowed
        showTitle={false}
      >
        {isNaN(formattedValue) || formattedValue == null ? '' : Math.abs(formattedValue)}
      </FormatNumber>
    );
  }

  getFormattedValue = value => {
    const { precision } = this.props;
    return value != null
      ? formatNumberHelper({
          value,
          precision,
        })
      : value;
  };

  render() {
    const { reverseColor, delta } = this.props;
    const formattedValue = this.getFormattedValue(delta);
    return (
      <span
        className={cn('value-delta', this.props.className, {
          'decrease red':
            (formattedValue < 0 && !reverseColor) || (reverseColor && formattedValue > 0),
          'increase green':
            (formattedValue > 0 && !reverseColor) || (reverseColor && formattedValue < 0),
        })}
      >
        {formattedValue < 0 && <ArrowDown className="icon small" />}
        {formattedValue > 0 && <ArrowUp className="icon small" />}
        {this.props.showNumber && (
          <React.Fragment>
            <span id={this.id} className="value">
              {this.renderFormattedValue(formattedValue)}
            </span>
            {this.renderOriginalValueTooltip()}
          </React.Fragment>
        )}
      </span>
    );
  }
}

export default ValueDelta;
