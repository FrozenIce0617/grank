// @flow
import React, { Component } from 'react';
import type { FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import FilterItem from 'Components/Filters/FilterItem';
import AddFilter from 'Components/Filters/AddFilter';

type Props = {
  filterSet: FilterSet,
  filters: Array<FilterBase>,
};

class FilterItemList extends Component<Props> {
  render() {
    const { filters, filterSet } = this.props;
    return (
      <div className="filter-item-list">
        {filters.map(filter => (
          <FilterItem
            key={filter.attribute}
            filter={filter}
            filters={filters}
            filterSet={filterSet}
          />
        ))}
        <AddFilter />
      </div>
    );
  }
}

export default FilterItemList;
