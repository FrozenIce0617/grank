// @flow
import React, { Component } from 'react';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n/index';
import Button from 'Components/Forms/Button';
import { NonRequiredFiltersSelector } from 'Selectors/FiltersSelector';
import type { FilterBase } from 'Types/Filter';
import './table-empty-state.scss';

type Props = {
  list: any,
  title?: string,
  subTitle?: string,
  onBtnClick?: Function,
  btnTitle?: string,
  filtersPossible?: boolean,
  filters: Array<FilterBase>,
  style: Object,
} & FiltersEditorProps;

class TableEmptyState extends Component<Props> {
  renderButton(onBtnClick: Function | void, btnTitle: string | void) {
    if (!onBtnClick) return null;
    return (
      <Button theme="orange" onClick={onBtnClick}>
        {btnTitle}
      </Button>
    );
  }

  renderNoData() {
    const { onBtnClick, btnTitle, style } = this.props;
    return (
      <div className="table-empty-state text-center p-5" style={style}>
        <span className="title">{this.props.title}</span>
        <br />
        <span className="sub-title">{this.props.subTitle}</span>
        <br />
        {this.renderButton(onBtnClick, btnTitle)}
      </div>
    );
  }

  resetFilter = () => {
    this.props.filtersEditor.resetFilters();
  };

  renderNoDataFilters() {
    const { style } = this.props;
    return (
      <div className="table-empty-state text-center p-5" style={style}>
        <span className="title">{t('No data')}</span>
        <br />
        <span className="sub-title">
          {t(
            'There is currently no data to display, this could be due to your active filters. Clear your filters and try again.',
          )}
        </span>
        <br />
        {this.renderButton(this.resetFilter, t('Clear filters'))}
      </div>
    );
  }

  render() {
    const { list, filtersPossible, filters } = this.props;
    if (list && list.length < 1) {
      if (filtersPossible && filters && filters.length) return this.renderNoDataFilters();
      return this.renderNoData();
    }
    return null;
  }
}

const mapStateToProps = state => ({
  filters: NonRequiredFiltersSelector(state),
});

export default withFiltersEditor(connect(mapStateToProps)(TableEmptyState));
