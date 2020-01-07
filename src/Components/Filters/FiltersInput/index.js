// @flow
import React, { Component } from 'react';
import type { FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import FilterItem from 'Components/Filters/FilterItem/component';
import AddFilter from 'Components/Filters/AddFilter/component';

type Props = {
  filterSet: FilterSet,
  value: Array<FilterBase>,
  onChange: (newFilters: Array<FilterBase>) => void,
  showError?: boolean,
  disabled?: boolean,
};

class FiltersInput extends Component<Props> {
  handleAdd = (newFilter: FilterBase) => {
    const filters = this.props.value;
    const newFilters = [...filters, newFilter];
    this.props.onChange(newFilters);
  };

  handleDelete = (filterToRemove: FilterBase) => {
    const filters = this.props.value;
    const newFilters = filters.filter(filter => filter.attribute !== filterToRemove.attribute);
    this.props.onChange(newFilters);
  };

  handleUpdate = (newFilter: FilterBase) => {
    const filters = this.props.value;
    const newFilters = filters.map(
      filter => (filter.attribute === newFilter.attribute ? newFilter : filter),
    );
    this.props.onChange(newFilters);
  };

  render() {
    const { filterSet } = this.props;
    const filters = this.props.value;
    return (
      <div className="filters filters-input">
        <div className="filter-item-list">
          {filters.map(filter => (
            <FilterItem
              key={filter.attribute}
              filter={filter}
              onDelete={this.handleDelete}
              onUpdate={this.handleUpdate}
            />
          ))}
          <AddFilter filters={filters} filterSet={filterSet} onAdd={this.handleAdd} />
        </div>
      </div>
    );
  }
}

export default FiltersInput;
