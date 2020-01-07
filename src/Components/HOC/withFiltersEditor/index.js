// @flow
import * as React from 'react';
import FiltersEditorComponent from 'Components/Filters/FiltersEditor';
import type { FiltersEditor } from 'Components/Filters/FiltersEditor';
import type { FilterGroup } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';

export type FiltersEditorProps = {
  filterGroup: FilterGroup,
  filterSet: FilterSet,
  filtersEditor: FiltersEditor,
};

function withFiltersEditor<InputProps: {}>(
  Component: React.ComponentType<InputProps>,
): React.ComponentType<InputProps & FiltersEditorProps> {
  return function FiltersEditorWrapper(props: InputProps) {
    return (
      <FiltersEditorComponent>
        <Component {...props} />
      </FiltersEditorComponent>
    );
  };
}

export default withFiltersEditor;
