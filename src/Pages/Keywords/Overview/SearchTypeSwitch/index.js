// @flow
import React, { Component } from 'react';
import Switch from 'Components/Switch';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import {
  FilterAttribute,
  TOTAL,
  MOBILE,
  DESKTOP,
  FilterValueType,
  FilterComparison,
} from 'Types/Filter';
import type { SearchType } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';

type SearchTypeItem = {
  +id: SearchType,
  +name: string,
  +active?: boolean,
};

class SearchTypeSwitch extends Component<FiltersEditorProps> {
  constructor(props: FiltersEditorProps) {
    super(props);
    this.searchTypes = [
      { id: TOTAL, name: t('All'), active: false },
      { id: MOBILE, name: t('Mobile'), active: false },
      { id: DESKTOP, name: t('Desktop'), active: false },
    ];
  }

  searchTypes: SearchTypeItem[];

  handleChange = (item: SearchTypeItem) => {
    const searchType: SearchType = item.id;
    if (item.id === TOTAL) {
      this.props.filtersEditor.removeFilter(FilterAttribute.SEARCH_TYPE);
    } else {
      const newFilter = {
        attribute: FilterAttribute.SEARCH_TYPE,
        type: FilterValueType.NUMBER,
        comparison: FilterComparison.EQ,
        value: searchType,
      };
      const filter = this.props.filterGroup.filters.find(
        x => x.type === FilterAttribute.SEARCH_TYPE,
      );
      if (filter) {
        this.props.filtersEditor.updateFilters(newFilter);
      } else {
        this.props.filtersEditor.addFilter(newFilter);
      }
    }
  };

  render() {
    const filter = this.props.filterGroup.filters.find(
      x => x.attribute === FilterAttribute.SEARCH_TYPE,
    );
    const searchType = filter ? filter.value : TOTAL;
    return (
      <Switch
        key="deviceType"
        activeById={true}
        activeId={searchType}
        width={300}
        style={{ marginLeft: 'auto' }}
        disabled={false}
        onClick={this.handleChange}
        els={this.searchTypes}
      />
    );
  }
}

export default withFiltersEditor(SearchTypeSwitch);
