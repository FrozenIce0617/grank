// @flow
import React, { PureComponent } from 'react';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import getFilterData, { makeDefaultFilter } from 'Components/Filters/getFilterData';
import type { FilterBase } from 'Types/Filter';
import FilterCellForm from 'Components/InfiniteTable/Cells/FilterCell/FilterCellForm';
import FilterButton from 'Components/Filters/FilterButton';

type Props = {
  filterAttribute: string,
  scrollXContainer: Element | null,
  fixed: boolean,
  fixedOffset: number,
} & FiltersEditorProps;

class FilterCell extends PureComponent<Props> {
  // This was inspired by FilterButton

  onAdd = (filter: FilterBase) => {
    this.props.filtersEditor.addFilter(filter);
  };

  onUpdate = (filter: FilterBase) => {
    this.props.filtersEditor.updateFilters(filter);
  };

  onDelete = () => {
    this.props.filtersEditor.removeFilter(this.props.filterAttribute);
  };

  renderEditForm = (filter: FilterBase) => {
    const { scrollXContainer, fixed, fixedOffset } = this.props;
    return (
      <FilterCellForm
        active={true}
        form={`filter-form-${filter.attribute}`}
        onSubmit={this.onUpdate}
        filter={filter}
        initialValues={filter}
        scrollXContainer={scrollXContainer}
        fixed={fixed}
        fixedOffset={fixedOffset}
        onDelete={this.onDelete}
      />
    );
  };

  renderAddForm = (filter: FilterBase) => {
    const { scrollXContainer, fixed, fixedOffset } = this.props;
    return (
      <FilterCellForm
        active={false}
        form={`filter-form-${filter.attribute}`}
        filter={filter}
        initialValues={filter}
        scrollXContainer={scrollXContainer}
        fixed={fixed}
        fixedOffset={fixedOffset}
        onSubmit={this.onAdd}
      />
    );
  };

  render() {
    const { filterAttribute, filterGroup, scrollXContainer, fixed, fixedOffset } = this.props;
    const filterViewData = getFilterData(filterAttribute);
    if (!filterViewData.tableEditor) {
      return (
        <FilterButton
          scrollXContainer={scrollXContainer}
          filterAttribute={filterAttribute}
          fixed={fixed}
          fixedOffset={fixedOffset}
        />
      );
    }
    const filter = filterGroup.filters.find(
      currentFilter => currentFilter.attribute === filterAttribute,
    );
    return filter ? this.renderEditForm(filter) : this.renderAddForm(filterViewData.defaultValue);
  }
}

export default withFiltersEditor(FilterCell);
