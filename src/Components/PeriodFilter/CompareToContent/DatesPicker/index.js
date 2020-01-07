// @flow
import React, { Component } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';

type DateRange = {
  from: Date,
  to: Date,
};

type Props = {
  value: DateRange,
  min: Date,
  max: Date,
  onChange: (value: DateRange) => void,
  message?: string,
};

export const clampDate = (value: Date, min: Date, max: Date) => {
  const valueMoment = moment(value);
  const adjustedValue = valueMoment.isAfter(max) ? max : valueMoment.isBefore(min) ? min : value;
  return adjustedValue;
};

class DatesPicker extends Component<Props> {
  clampFrom = (from: Date) => {
    const max = this.props.value.to;
    return clampDate(from, this.props.min, max);
  };

  clampTo = (to: Date) => {
    const min = this.props.value.from;
    return clampDate(to, min, this.props.max);
  };

  handleStartChange = (from: moment.Moment) => {
    this.props.onChange({
      from: this.clampFrom(from.startOf('day').toDate()),
      to: this.props.value.to,
    });
  };

  handleEndChange = (to: moment.Moment) => {
    this.props.onChange({
      from: this.props.value.from,
      to: this.clampTo(to.startOf('day').toDate()),
    });
  };

  render() {
    let { min, max } = this.props;
    let { from, to } = this.props.value;

    min = moment(min);
    max = moment(max);

    from = moment(from).isBefore(min) ? min : moment(from);
    from = moment(from).isAfter(max) ? max : moment(from);
    to = moment(to).isAfter(max) ? max : moment(to);
    to = moment(to).isBefore(min) ? min : moment(to);

    let toMin = moment(from).add(1, 'day');
    if (toMin.isAfter(max)) {
      toMin = max;
    }
    let fromMax = moment(to).subtract(1, 'day');
    if (fromMax.isBefore(min)) {
      fromMax = min;
    }
    return (
      <div className="date-range-picker">
        <DatePicker
          selected={from}
          minDate={min}
          maxDate={fromMax}
          onChange={this.handleStartChange}
          startDate={from}
          inline
          className="date-picker"
          calendarClassName="custom-date-picker-input"
        />
        <DatePicker
          selected={to}
          minDate={toMin}
          maxDate={max}
          onChange={this.handleEndChange}
          inline
          className="date-picker"
          calendarClassName="custom-date-picker-input"
        />
      </div>
    );
  }
}

export default DatesPicker;
