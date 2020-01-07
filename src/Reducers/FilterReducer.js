// @flow
import { getButtonsConfigs } from 'Components/PeriodFilter/buttons';
import { clampRange, rangeToFilters } from 'Components/PeriodFilter/model';

import {
  INIT_FILTERS,
  SELECT_FILTERSET,
  SAVE_FILTER_GROUP,
  DELETE_FILTER_GROUP,
  SET_FILTERS,
  SET_DEFAULT_FILTERS,
  RENAME_FILTER_GROUP,
  UPDATE_FILTER_GROUPS,
  UPDATE_FILTER_GROUP_FILTERS,
  TOGGLE_DEFAULT_FILTER_GROUP,
  UPDATE_DEFAULT_COMPARE_TO,
} from 'Actions/FilterAction';
import type { Action } from 'Actions/FilterAction';
import { subfilterDiff, FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import type { FilterBase, FilterGroup } from 'Types/Filter';
import {
  KEYWORDS_FILTER_SET,
  isFilterInSet,
  isShownInFilterBar,
  DOMAINS_FILTER_SET,
  getFilterSetType,
  AFFILIATE_FILTER_SET,
  SALES_FILTER_SET,
} from 'Types/FilterSet';
import type { FilterSet } from 'Types/FilterSet';

type State = {
  +filters: Array<FilterBase>,
  +filterGroup: FilterGroup,
  +filterGroups: Array<FilterGroup>,
  +filterSet: FilterSet,
  +pristine: boolean,
  +defaultCompareTo: string,
};

/**
 * [getDateRangeFilter]
 *
 * Function relies on "compare to" filter buttons' config and will grab
 * the declared range for the respective `compareTo` value.
 *
 * `compareTo` is a user prop (`user.defaultCompareTo`) and will always
 * be set from the getButtonsConfigs(). For that reason it's matching
 * up against those values here as well, in order to only maintain
 * defined "compare to" ranges once; in 'Components/PeriodFilter/buttons'
 *
 * @param  {String} compareTo
 * @param  {boolean} includeCompareToFilter - check if we need only period filter but not compare to one
 * @return {Array<FilterBase>}
 */
const getCompareTo = (compareTo: string, includeCompareToFilter: boolean) => {
  const btns = getButtonsConfigs(true);
  const defaultCompareTo = btns.filter(el => el.id === compareTo);

  return rangeToFilters(
    !defaultCompareTo.length
      ? clampRange(btns[0].getRange(), new Date(0), new Date())
      : clampRange(defaultCompareTo[0].getRange(), new Date(0), new Date()),
    includeCompareToFilter,
  );
};

const allDomainsFilter = {
  attribute: FilterAttribute.DOMAINS,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getFilterGroup = ({ group, compareTo }) => {
  return {
    name: 'Default',
    type: group === KEYWORDS_FILTER_SET || group === DOMAINS_FILTER_SET ? 'A_2' : '',
    id: '',
    filters:
      {
        [KEYWORDS_FILTER_SET]: [...getCompareTo(compareTo), allDomainsFilter],
        [DOMAINS_FILTER_SET]: getCompareTo(compareTo),
        [AFFILIATE_FILTER_SET]: getCompareTo(compareTo, false),
        [SALES_FILTER_SET]: getCompareTo(compareTo, false),
      }[group] || [],
  };
};

const getDefaultFilterGroup = (state: State, compareTo: string = state.defaultCompareTo) => {
  const { filterSet, filterGroups } = state;
  const filterSetType = getFilterSetType(filterSet);
  const userDefaultFilterGroup = filterGroups.find(filterGroup => {
    const filterGroupType = parseInt(filterGroup.type.split('_')[1], 10);
    const currentTypeMatch = filterGroupType === filterSetType;
    if (!currentTypeMatch) return false;
    if (filterSet === DOMAINS_FILTER_SET) {
      return filterGroup.defaultForDomains;
    }
    return false;
  });

  const defaultFilterGroup = getFilterGroup({ group: filterSet, compareTo });

  if (userDefaultFilterGroup) {
    return {
      ...userDefaultFilterGroup,
      filters: [...defaultFilterGroup.filters, ...userDefaultFilterGroup.filters],
    };
  }
  return defaultFilterGroup;
};

const getInitialFilters = (compareTo: string) => {
  let defaultFilters = [...getCompareTo(compareTo), allDomainsFilter];
  const savedFiltersData = sessionStorage.getItem('all_filters');
  if (savedFiltersData) {
    try {
      let savedFilters = JSON.parse(savedFiltersData).filters;
      savedFilters = savedFilters.filter(
        filter =>
          !defaultFilters.find(defaultFilter => defaultFilter.attribute === filter.attribute),
      );
      defaultFilters = [...defaultFilters, ...savedFilters];
    } catch (e) {
      // Ignore error
    }
  }
  return defaultFilters;
};

const initialState: State = {
  filters: getInitialFilters('yesterday'),
  // Current filter group
  filterGroup: getFilterGroup({ group: 'keywords', compareTo: 'yesterday' }),
  // Filter groups received from the backend + default ones
  filterGroups: [
    {
      name: 'Default',
      type: 'A_2',
      id: '',
      filters: [],
    },
    {
      name: 'Default',
      type: 'A_1',
      id: '',
      filters: [],
    },
  ],
  // Current filter set id
  filterSet: KEYWORDS_FILTER_SET,
  // Are filters in filter bar up to date
  pristine: true,
  defaultCompareTo: 'yesterday', // This will be overwritten by the user specific default on init
};

function selectFilterGroup(state: State, segmentId: string): State {
  if (state.filterGroup.id !== segmentId) {
    const newFilterGroup = state.filterGroups.find(filterGroup => filterGroup.id === segmentId);
    return {
      ...state,
      filterGroup: newFilterGroup || getFilterGroup({}), // noFilterGroup,
    };
  }
  return state;
}

function updateSubfilters(state: State, newSubfilters: Array<FilterBase>): State {
  const isPristine = subfilterDiff(state.filterGroup.filters, newSubfilters).every(
    (filterAttribute: string) => !isShownInFilterBar(filterAttribute, state.filterSet),
  );

  return {
    ...state,
    filterGroup: {
      ...state.filterGroup,
      filters: newSubfilters,
    },
    pristine: isPristine,
  };
}

function changeFilters(state: State, filters: FilterBase[]) {
  const withoutSetFilters: FilterBase[] = state.filters.filter(
    filter =>
      !isFilterInSet(filter.attribute, state.filterSet) &&
      !filters.find(newFilter => newFilter.attribute === filter.attribute), // don't include same filters twice
  );
  const newFilters = [...withoutSetFilters, ...filters];
  return {
    ...state,
    filters: newFilters,
  };
}

const getCurrentDomainId = (state: State) => {
  const filters = state.filterGroup.filters;
  const domainsFilter = filters.find(filter => filter.attribute === FilterAttribute.DOMAINS);
  const domainsIds = domainsFilter.value;
  return domainsIds.length ? domainsIds[0] : undefined;
};

const defaultCompareToMap = {
  [AFFILIATE_FILTER_SET]: 'last-month',
  [SALES_FILTER_SET]: 'last-week',
};

export default function(state: State = initialState, action: Action): State {
  const filterGroup = state.filterGroup;
  switch (action.type) {
    case INIT_FILTERS: {
      // HACK: Update default filter value
      allDomainsFilter.value = action.domainsFilter.value;
      return state;
    }

    case SELECT_FILTERSET: {
      const newFilterSet = action.filterSet;
      return {
        ...state,
        filterSet: newFilterSet,
        filterGroup: {
          ...state.filterGroup,
          filters: state.filters.filter(filter => isFilterInSet(filter.attribute, newFilterSet)),
        },
      };
    }

    case SET_FILTERS: {
      // We set filters for the current filter set only
      state = selectFilterGroup(state, action.segmentId);
      state = updateSubfilters(state, action.filters);
      return changeFilters(state, state.filterGroup.filters);
    }

    case SET_DEFAULT_FILTERS: {
      state = {
        ...state,
        filterGroup: getDefaultFilterGroup(state, defaultCompareToMap[state.filterSet]),
      };
      return changeFilters(state, state.filterGroup.filters);
    }

    case UPDATE_FILTER_GROUPS: {
      return {
        ...state,
        filterGroups: [...state.filterGroups, ...action.filterGroups],
      };
    }

    case SAVE_FILTER_GROUP: {
      const newFilterGroup = action.filterGroup;
      return {
        ...state,
        filterGroup: {
          ...filterGroup,
          name: newFilterGroup.name,
          id: newFilterGroup.id,
          type: newFilterGroup.type,
        },
        filterGroups: [...state.filterGroups, newFilterGroup],
        pristine: true,
      };
    }

    case DELETE_FILTER_GROUP: {
      const idToRemove = action.id;
      const newFilterGroups = state.filterGroups.filter(fGroup => fGroup.id !== idToRemove);
      return {
        ...state,
        filterGroups: newFilterGroups,
      };
    }

    case RENAME_FILTER_GROUP: {
      const idToRename = action.id;
      const newName = action.name;
      const newFilterGroups = state.filterGroups.map(fGroup => {
        if (fGroup.id === idToRename) {
          return { ...fGroup, name: newName };
        }
        return fGroup;
      });
      return {
        ...state,
        filterGroup: {
          ...state.filterGroup,
          name: action.id === state.filterGroup.id ? newName : state.filterGroup.name,
        },
        filterGroups: newFilterGroups,
      };
    }

    case TOGGLE_DEFAULT_FILTER_GROUP: {
      const idToToggle = action.id;
      const newFilterGroups = state.filterGroups.map(fGroup => {
        if (state.filterSet === DOMAINS_FILTER_SET) {
          const defaultForDomains = fGroup.id === idToToggle ? action.isDefault : false;
          return { ...fGroup, defaultForDomains };
        } else if (state.filterSet === KEYWORDS_FILTER_SET) {
          const domainId = getCurrentDomainId(state);
          if (domainId) {
            let defaultForKeywords = fGroup.defaultForKeywords || [];
            defaultForKeywords = defaultForKeywords.filter(
              defaultDomainId => defaultDomainId !== domainId,
            );
            if (fGroup.id === idToToggle && action.isDefault) {
              defaultForKeywords.push(domainId);
            }
            return { ...fGroup, defaultForKeywords };
          }
        }
        return fGroup;
      });
      return {
        ...state,
        filterGroups: newFilterGroups,
      };
    }

    case UPDATE_FILTER_GROUP_FILTERS: {
      const newFilters = action.filters;
      const idToReplaceFilters = action.id;
      const newFilterGroups = state.filterGroups.map(fGroup => {
        if (fGroup.id === idToReplaceFilters) {
          return { ...fGroup, filters: newFilters };
        }
        return fGroup;
      });
      return {
        ...state,
        filterGroups: newFilterGroups,
        pristine: true,
      };
    }

    case UPDATE_DEFAULT_COMPARE_TO: {
      return {
        ...state,
        defaultCompareTo: action.id,
      };
    }

    default:
      return state;
  }
}
