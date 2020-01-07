// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CompareToDropdown from './CompareToDropdown';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import type { PeriodFilter as PeriodFilterType } from 'Types/Filter';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';

import './period-filter-selector.scss';

type Props = {
  periodFilter: PeriodFilterType,
  min?: Date,
  max?: Date,
  message: string,
  onlyPeriodFilter: boolean,
} & FiltersEditorProps;

class PeriodFilter extends Component<Props> {
  handleSubmit = (filters: any) => {
    this.props.filtersEditor.updateFilters(filters);
  };

  render() {
    const { min, max, message, onlyPeriodFilter } = this.props;
    if (!this.props.periodFilter) {
      return null;
    }

    return (
      <div className="period-filter-selector compare-to-selector">
        <CompareToDropdown
          min={min || new Date(0)}
          max={max || new Date()}
          onSubmit={this.handleSubmit}
          periodFilter={this.props.periodFilter}
          onlyPeriodFilter={onlyPeriodFilter}
          message={message}
        />
      </div>
    );
  }
}

const periodFilterSelector = SpecificFilterSelector('period');

const mapStateToProps = state => ({
  periodFilter: periodFilterSelector(state),
});

export default withFiltersEditor(connect(mapStateToProps)(PeriodFilter));
