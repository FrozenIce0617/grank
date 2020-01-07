// @flow
import React, { Component } from 'react';
import AddFilterComponent from './component';
import ReactGA from 'react-ga';
import type { FilterBase } from 'Types/Filter';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';

class AddFilter extends Component<FiltersEditorProps> {
  onAdd = (filter: FilterBase) => {
    this.props.filtersEditor.addFilter(filter);
    ReactGA.event({
      category: 'AddFilter',
      action: filter.attribute,
      label: filter.comparison,
      value: filter.value,
      transport: 'beacon',
    });
  };

  render() {
    const { filterGroup, filterSet } = this.props;
    return (
      <AddFilterComponent onAdd={this.onAdd} filters={filterGroup.filters} filterSet={filterSet} />
    );
  }
}

export default withFiltersEditor(AddFilter);
