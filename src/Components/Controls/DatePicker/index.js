// @flow
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import classnames from 'classnames';

import './date-picker.scss';

type Props = {
  value: Date,
  onChange: Function,
  showError?: boolean,
  disabled: boolean,
  className?: string,
  showTimeSelect?: boolean,
};

class DateInput extends Component<Props> {
  static defaultProps = {
    value: new Date(),
    onChange: () => {},
    showError: false,
    disabled: false,
    showTimeSelect: false,
  };

  handleChange = (currentMoment: any) => {
    this.props.onChange(moment(currentMoment).toDate());
  };

  render() {
    const { value, disabled, className, showTimeSelect, ...props } = this.props;
    const format = showTimeSelect ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    const timeFormat = 'HH:mm';
    return (
      <DatePicker
        {...props}
        disabled={disabled}
        dateFormat={format}
        timeFormat={timeFormat}
        showTimeSelect={showTimeSelect}
        selected={value ? moment(value.getTime()) : null}
        className={classnames('date-picker', className, { disabled })}
        onChange={this.handleChange}
        peekNextMonth={false}
        calendarClassName="custom-date-picker-input"
      />
    );
  }
}

export default DateInput;
