// @flow
import * as React from 'react';
import type { FilterSet } from 'Types/FilterSet';
import FilterUrlSyncHandler from 'Components/Filters/FilterUrlSyncHandler';

function withFilterset<InputProps: {}>(
  Component: React.ComponentType<InputProps>,
  filterSet: FilterSet,
): React.ComponentType<InputProps> {
  return function PageContainerWrapper(props: InputProps) {
    return (
      <FilterUrlSyncHandler filterSet={filterSet}>
        <Component {...props} />
      </FilterUrlSyncHandler>
    );
  };
}

export default withFilterset;
