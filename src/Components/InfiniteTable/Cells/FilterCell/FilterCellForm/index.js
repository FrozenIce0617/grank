// @flow
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import type { FilterBase } from 'Types/Filter';
import getFilterData from 'Components/Filters/getFilterData';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import cn from 'classnames';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import './filter-cell-form.scss';
import FilterCell from '../index';

const smallIconCells = ['rank', 'rank_change', 'highest_ranking_page_match', 'search_volume'];

type Props = {
  filter: FilterBase,
  active: boolean,
  onCancel: Function,
  scrollXContainer: Element | null,
  fixed: boolean,
  fixedOffset: number,

  // optional
  onDelete?: Function,

  // auto
  form: string,
  change: Function,
  handleSubmit: Function,
} & FiltersEditorProps;

class FilterCellForm extends Component<Props> {
  // this was inspired by FilterEditorForm and EditForm

  handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.handleSubmit();
    }
  };

  handleReset = () => {
    const { active } = this.props;
    active && this.handleSelect({ value: null, reset: true });
  };

  handleSelect = ({ value, reset }) => {
    const { filter } = this.props;
    const filterViewData = getFilterData(filter.attribute);

    if (reset) {
      this.props.filtersEditor.removeFilter(this.props.filter.attribute);
      return;
    }

    const isNotDefaultValue = value !== filterViewData.defaultValue.value;
    const isOptionEditor = filterViewData.tableEditor === OptionEditor;

    if (isNotDefaultValue || isOptionEditor) {
      this.props.handleSubmit();
    }
  };

  render() {
    const { filter, scrollXContainer, active, fixed, fixedOffset } = this.props;
    const filterViewData = getFilterData(filter.attribute);
    const Editor = filterViewData.tableEditor;
    const editorProps = filterViewData.tableEditorProps || {};

    const className = cn('filter-cell-form', {
      active,
      'small-icon': smallIconCells.indexOf(filter.attribute) + 1,
    });

    return (
      <form onKeyDown={this.handleKeydown} className={className}>
        {Editor ? (
          <Editor
            autoFocus={false}
            scrollXContainer={scrollXContainer}
            handleSelect={this.handleSelect}
            handleReset={this.handleReset}
            isEmpty={!active}
            fixed={fixed}
            fixedOffset={fixedOffset}
            {...editorProps}
          />
        ) : (
          ''
        )}
      </form>
    );
  }
}

// https://redux-form.com/7.3.0/docs/faq/howtoconnect.md/

// eslint-disable-next-line no-class-assign
FilterCellForm = withFiltersEditor(FilterCellForm);

export default reduxForm({
  enableReinitialize: true,
})(FilterCellForm);
