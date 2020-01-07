// @flow
import React, { Component } from 'react';
import moment from 'moment';
import MonthPicker from 'Components/MonthPicker';

type DateRange = {
  from: Date,
  to: Date,
};

type Props = {
  value: DateRange,
  min: Date,
  max: Date,
  onChange: (value: DateRange) => void,
};

class MonthsPicker extends Component<Props> {
  handleStartChange = (from: moment.Moment) => {
    const { to } = this.props.value;
    this.props.onChange({ from: from.startOf('month'), to });
  };

  handleEndChange = (to: moment.Moment) => {
    const { from } = this.props.value;
    this.props.onChange({ from, to: to.add({ month: 1 }).startOf('month') });
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

    let toMin = moment(from);
    if (toMin.isAfter(max)) {
      toMin = max;
    }
    let fromMax = moment(to);
    if (fromMax.isBefore(min)) {
      fromMax = min;
    }

    return (
      <div className="date-range-picker">
        <MonthPicker
          className="mr-3"
          selected={from}
          min={min}
          max={fromMax}
          onChange={this.handleStartChange}
          startDate={from}
        />
        <MonthPicker selected={to} min={toMin} max={max} onChange={this.handleEndChange} />
      </div>
    );
  }
}

export default MonthsPicker;
