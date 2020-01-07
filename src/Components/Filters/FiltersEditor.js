// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import type { FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import type { FilterGroup } from 'Types/Filter';
import { isRequiredFilter } from 'Types/FilterSet';
import { encodeFilters } from './serialization';

type Props = {
  history: Object,
  match: Object,
  filterGroup: FilterGroup,
  filterSet: FilterSet,
  children: React.Element,
};

export interface FiltersEditor {
  addFilter: (newFilter: FilterBase) => void;
  resetFilters: () => void;
  removeFilter: (attribute: string) => void;
  updateFilters: (filterToUpdate: FilterBase | FilterBase[]) => void;
  selectFilterGroup: (filterGroup: FilterGroup) => void;
}

// TODO - do we need to prevent re-render even if filters changed?
class FiltersEditorComponent extends React.Component<Props> {
  currentRequiredFilters() {
    const filterSet = this.props.filterSet;
    const filterGroup = this.props.filterGroup;
    // Clear non required filters only in current filter set
    const newFilters = filterGroup.filters.filter(filter =>
      isRequiredFilter(filter.attribute, filterSet),
    );
    return newFilters;
  }

  addFilter(newFilter: FilterBase) {
    const filterGroup = this.props.filterGroup;
    const alreadyExists = filterGroup.filters.find(
      currentFilter => currentFilter.attribute === newFilter.attribute,
    );
    let newFilters;
    if (alreadyExists) {
      newFilters = filterGroup.filters.map(
        subfilter => (newFilter.attribute === subfilter.attribute ? newFilter : subfilter),
      );
    } else {
      newFilters = [...filterGroup.filters, newFilter];
    }
    this.navigate(newFilters, filterGroup.id);
  }

  resetFilters() {
    const filterGroup = this.props.filterGroup;
    // Clear non required filters only in current filter set
    const newFilters = this.currentRequiredFilters();
    this.navigate(newFilters, filterGroup.id);
  }

  removeFilter(attribute: string) {
    const filterGroup = this.props.filterGroup;
    const newFilters = filterGroup.filters.filter(filter => filter.attribute !== attribute);
    this.navigate(newFilters, filterGroup.id);
  }

  // TODO: make this single type, array or variable number of arguments
  updateFilters(filterToUpdate: FilterBase | FilterBase[]) {
    const filterGroup = this.props.filterGroup;
    const newSubfilters = Array.isArray(filterToUpdate) ? filterToUpdate : [filterToUpdate];
    const newFilters = filterGroup.filters.map(subfilter => {
      const newSubfilter = newSubfilters.find(filter => filter.attribute === subfilter.attribute);
      return newSubfilter || subfilter;
    });
    this.navigate(newFilters, filterGroup.id);
  }

  selectFilterGroup(filterGroup: FilterGroup) {
    const requiredFilters = this.currentRequiredFilters();
    const newFilters = [...requiredFilters, ...filterGroup.filters];
    this.navigate(newFilters, filterGroup.id);
  }

  navigate(filters: Array<FilterBase>, filterGroupId: string) {
    const filterHash = encodeFilters(filters, filterGroupId);
    const {
      history,
      match: { path, params },
    } = this.props;
    const newParams = { ...params, ...{ filter: filterHash } };
    const newPath = path
      .replace(
        /(:([\w\d]+)\??)(?:$|\/)/g,
        (fullMatch, matchToReplace, propertyMatch) =>
          `${newParams[propertyMatch] || matchToReplace}/`,
      )
      .replace(':filter?/', '');

    history.push(newPath);
  }

  render() {
    return React.cloneElement(this.props.children, {
      filtersEditor: this,
      filterGroup: this.props.filterGroup,
      filterSet: this.props.filterSet,
    });
  }
}

const mapStateToProps = state => ({
  filterGroup: state.filter.filterGroup,
  filterSet: state.filter.filterSet,
});

export default withRouter(connect(mapStateToProps)(FiltersEditorComponent));
