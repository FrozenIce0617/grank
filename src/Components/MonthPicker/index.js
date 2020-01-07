// @flow
import React, { Component } from 'react';
import moment from 'moment';
import { t } from 'Utilities/i18n';
import cn from 'classnames';

import './month-picker.scss';

type Props = {
  selected: Date,
  onChange: Function,
  className?: string,
  min?: Date,
  max?: Date,
  startDate?: Date,
};

type State = {
  navigationYear: number,
};

const getMonths = () => [
  t('Jan'),
  t('Feb'),
  t('Mar'),
  t('Apr'),
  t('May'),
  t('Jun'),
  t('Jul'),
  t('Aug'),
  t('Sep'),
  t('Oct'),
  t('Nov'),
  t('Dec'),
];

class MonthPicker extends Component<Props, State> {
  static defaultProps = {
    value: new Date(),
    onChange: () => {},
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      navigationYear: moment(props.startDate || props.selected).year(),
    };
  }

  handleChange = (month: number) => {
    const { navigationYear } = this.state;
    this.props.onChange(moment(new Date(navigationYear, month, 1)));
  };

  handlePrev = () => {
    this.setState({
      navigationYear: this.state.navigationYear - 1,
    });
  };

  handleNext = () => {
    this.setState({
      navigationYear: this.state.navigationYear + 1,
    });
  };

  render() {
    const { min, max, selected, className } = this.props;
    const { navigationYear } = this.state;

    const momentValue = moment(selected);
    const momentValueMonth = momentValue.month();
    const momentValueYear = momentValue.year();

    const momentMinDate = moment(min != null ? min : 0);
    const momentMinDateYear = momentMinDate.year();
    const momentMinDateMonth = momentMinDate.month();

    const momentMaxDate = max != null ? moment(max) : moment();
    const momentMaxDateYear = momentMaxDate.year();
    const momentMaxDateMonth = momentMaxDate.month();

    return (
      <div className={cn('month-picker', className)}>
        <div className="years-selector">
          {navigationYear > momentMinDateYear && (
            <button className="navigation left" onClick={this.handlePrev} />
          )}
          {navigationYear}
          {navigationYear < momentMaxDateYear && (
            <button className="navigation right" onClick={this.handleNext} />
          )}
        </div>
        <div className="month-picker-calendar">
          {getMonths().map((month, idx) => {
            const currentMonth = idx;
            const isDisabled =
              (momentMinDateYear === navigationYear && momentMinDateMonth > currentMonth) ||
              (momentMaxDateYear === navigationYear && momentMaxDateMonth < currentMonth);
            return (
              <div
                className={cn('month-picker-item', {
                  selected: momentValueMonth === currentMonth && momentValueYear === navigationYear,
                  disabled: isDisabled,
                })}
                onClick={() => !isDisabled && this.handleChange(currentMonth)}
                key={month}
              >
                {month}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default MonthPicker;
