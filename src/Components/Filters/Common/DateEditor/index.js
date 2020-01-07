// @flow
import React, { Component } from 'react';
import { Fields, type FieldProps } from 'redux-form';
import moment from 'moment';

import DatePicker from 'Components/Controls/DatePicker';
import DatesPicker from 'Components/PeriodFilter/CompareToContent/DatesPicker';
import FormField from 'Components/Forms/FormField';
import DropdownList from 'Components/Controls/DropdownList';

import { FilterComparison } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import { formatDate } from 'Utilities/format';

import './date-filter-editor.scss';

const getComparisonOptions = () => [
  { id: FilterComparison.GT, label: t('After') },
  { id: FilterComparison.LT, label: t('Before') },
  { id: FilterComparison.EQ, label: t('On') },
  { id: FilterComparison.BETWEEN, label: t('Between') },
];

type Props = {
  value: FieldProps,
  comparison: FieldProps,
};

class DateEditor extends Component<Props> {
  handleComparisonChange = (newComparison: string) => {
    const { value, comparison } = this.props;
    if (newComparison === comparison.input.value) {
      return;
    }
    comparison.input.onChange(newComparison);
    if (newComparison === FilterComparison.BETWEEN) {
      value.input.onChange([new Date(), new Date()]);
    } else if (comparison.input.value === FilterComparison.BETWEEN) {
      value.input.onChange(new Date());
    }
  };

  handleRangeChange = ({ to, from }) => {
    this.props.value.input.onChange([from, to]);
  };

  handleValueChange = val => {
    this.props.value.input.onChange(formatDate(val));
  };

  render() {
    const comparisonOptions = getComparisonOptions();
    const { value, comparison } = this.props;
    const dateComponent =
      comparison.input.value === FilterComparison.BETWEEN ? (
        <DatesPicker
          value={{ from: value.input.value[0], to: value.input.value[1] }}
          min={new Date(0)}
          max={new Date(10000000000000) /*TODO*/}
          onChange={this.handleRangeChange}
        />
      ) : (
        <DatePicker value={moment(value.input.value).toDate()} onChange={this.handleValueChange} />
      );
    return (
      <div className="date-filter-editor">
        <FormField meta={comparison.meta}>
          <DropdownList
            items={comparisonOptions}
            value={comparison.input.value}
            onChange={this.handleComparisonChange}
          />
        </FormField>
        <FormField meta={value.meta}>{dateComponent}</FormField>
      </div>
    );
  }
}

export default () => (
  <div>
    <Fields component={DateEditor} names={['comparison', 'value']} />
  </div>
);
