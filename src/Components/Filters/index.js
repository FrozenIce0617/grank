// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import type { FilterBase, FilterGroup } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import cn from 'classnames';
import ResetFilter from './ResetFilter';
import UpdateFilterGroup from './UpdateFilterGroup';
import SaveFilterGroup from './SaveFilterGroup';
import FilterItemList from './FilterItemList';
import SavedFilterGroups from './SavedFilterGroups';
import { VisibleFiltersSelector } from 'Selectors/FiltersSelector';
import './filters.scss';

type Props = {
  showSegments: boolean,
  filterSet: FilterSet,
  filters: FilterBase[],
  filterGroup: FilterGroup,
  pristine: boolean,
};

class Filters extends Component<Props> {
  static defaultProps = {
    showSegments: true,
  };

  render() {
    const { showSegments, filterSet, filterGroup, filters: visibleFilters, pristine } = this.props;

    const hasFilters = visibleFilters.length > 0;
    const canUpdate =
      filterGroup.id !== 'default' && filterGroup.id !== '' && hasFilters && !pristine;
    return (
      <div className={cn('filters', { active: hasFilters })}>
        <FilterItemList filters={visibleFilters} filterSet={filterSet} />
        {showSegments && (
          <div className="actions">
            {hasFilters && <SaveFilterGroup />}
            {canUpdate && <UpdateFilterGroup />}
            {hasFilters && <ResetFilter />}
            <SavedFilterGroups />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  filterSet: state.filter.filterSet,
  filters: VisibleFiltersSelector(state),
  filterGroup: state.filter.filterGroup,
  pristine: state.filter.pristine,
});

export default connect(mapStateToProps)(Filters);
