// @flow
import React, { Component } from 'react';
import IconButton from 'Components/IconButton';
import CrossIcon from 'icons/cross-rounded-thin.svg?inline';
import { t } from 'Utilities/i18n/index';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';

class ResetFilter extends Component<FiltersEditorProps> {
  handleReset = () => {
    this.props.filtersEditor.resetFilters();
  };

  render() {
    return (
      <IconButton
        className="reset-filter-icon"
        onClick={this.handleReset}
        icon={<CrossIcon />}
        bold
      >
        {t('Reset segment')}
      </IconButton>
    );
  }
}

export default withFiltersEditor(ResetFilter);
