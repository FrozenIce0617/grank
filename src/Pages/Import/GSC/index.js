// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import classNames from 'classnames';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';

import { showModal } from 'Actions/ModalAction';
import { FilterAttribute, FilterValueType, FilterComparison } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { KEYWORDS } from 'Pages/Layout/ActionsMenu';

import IconButton from 'Components/IconButton';
import CheckIcon from 'icons/check.svg?inline';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import GSCKeywordsInfiniteTable from 'Components/InfiniteTable/Tables/GSCKeywordsInfiniteTable';

import { t, tn } from 'Utilities/i18n/index';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';

import '../imports.scss';

type Props = {
  showModal: Function,
  domainId: string,
  keyword: string,
  keywordComparison: string,
  hideExisting: boolean,
  countryName: string,
  impressions: number,
  impressionsComparison: string,
  clicks: number,
  clicksComparison: string,
  filterData: Function,
  prepareData: Function,
} & FiltersEditorProps;

type State = {
  selected: Set<string>, // selected keywords if isAllSelected false, unselected otherwise
  isAllSelected: boolean,
};

class ImportFromGSC extends Component<Props, State> {
  _table: any;

  state = {
    selected: new Set(),
    isAllSelected: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.filters !== nextProps.filters) {
      this.setState({
        selected: new Set(),
        isAllSelected: false,
      });
    }
  }

  handleSelect = ({ currentTarget: { name } }) => {
    const { selected, isAllSelected } = this.state;
    const set = new Set(selected);
    (set.has(name) ? set.delete : set.add).call(set, name);

    // (un)select all on (un)select last
    if (set.size === this.getNumResults() && set.size !== 0) {
      this.setState({
        isAllSelected: !isAllSelected,
        selected: new Set(),
      });
      return;
    }

    this.setState({
      selected: set,
    });
  };

  handleSelectAll = ({ currentTarget: { checked } }) => {
    this.setState({
      isAllSelected: checked,
      selected: new Set(),
    });
  };

  toggleHideExisting = () => {
    const { hideExisting } = this.props;
    if (!hideExisting) {
      this.props.filtersEditor.addFilter({
        attribute: FilterAttribute.GSC_EXISTS,
        type: FilterValueType.BOOL,
        comparison: FilterComparison.EQ,
        value: false,
      });
    } else {
      this.props.filtersEditor.removeFilter(FilterAttribute.GSC_EXISTS);
    }
  };

  isFiltered = () => {
    const {
      hideExisting,
      countryName,
      impressionsComparison,
      clicksComparison,
      keywordComparison,
    } = this.props;
    return (
      hideExisting ||
      !!countryName ||
      !!impressionsComparison ||
      !!clicksComparison ||
      !!keywordComparison
    );
  };

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        gscKeywords: this.getSelectedKeywords(),
        refresh: this.handleRefresh,
      },
    });
  };

  importAll = () => {
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        gscKeywords: this.getKeywords(),
        refresh: this.handleRefresh,
      },
    });
  };

  getSelectedKeywords = () => {
    const { selected, isAllSelected } = this.state;
    return this.getKeywords().filter(keywordData => {
      const hasKeyword = selected.has(keywordData.id.toString());
      return isAllSelected ? !hasKeyword : hasKeyword;
    });
  };

  handleRefresh = () => {
    this.resetTable();
  };

  handleUpdate = () => {
    this.forceUpdate();
  };

  getInfiniteTableInstance = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance();

  resetTable = () => {
    const instance = this.getInfiniteTableInstance();
    return instance && instance.resetTable();
  };

  getKeywords = () => {
    const instance = this.getInfiniteTableInstance();
    return instance ? instance.getList() : [];
  };

  getNumResults = () => {
    const instance = this.getInfiniteTableInstance();
    return instance ? instance.getNumResults() : 0;
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { selected, isAllSelected } = this.state;
    const { hideExisting } = this.props;
    const numResults = this.getNumResults();

    const selectedKeywordsSize = this.getSelectedKeywords().length;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={KEYWORDS}>
          <Actions.AddAction
            key="addSelected"
            label={tn(
              'Import selected keyword (%s)',
              'Import selected keywords (%s)',
              selectedKeywordsSize,
            )}
            onClick={selected.size || isAllSelected ? this.handleAddAction : () => {}}
            className={classNames({ disabled: !selectedKeywordsSize })}
          />
          <IconButton icon={CheckIcon} className="imports-btn" onClick={this.toggleHideExisting}>
            {hideExisting ? t('Show existing') : t('Hide existing')}
          </IconButton>
          <IconButton
            icon={CheckIcon}
            className={classNames('imports-btn', { disabled: !numResults })}
            onClick={!numResults ? () => {} : this.importAll}
          >
            {this.isFiltered() ? t('Import filtered (%s)', numResults) : t('Import all')}
          </IconButton>
        </ActionsMenu>
        <div className="gsc-keywords-table content-container">
          <div className="table-container">
            <GSCKeywordsInfiniteTable
              handleSelect={this.handleSelect}
              handleSelectAll={this.handleSelectAll}
              selected={selected}
              isAllSelected={isAllSelected}
              onUpdate={this.handleUpdate}
              ref={this.setTableRef}
              featureAdvancedMetrics={false}
              hasAnalytics={false}
            />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);
const keywordFilterSelector = SpecificFilterSelector(FilterAttribute.KEYWORD);
const countryNameFilterSelector = SpecificFilterSelector(FilterAttribute.COUNTRY_NAME);
const impressionsFilterSelector = SpecificFilterSelector(FilterAttribute.IMPRESSIONS);
const clicksFilterSelector = SpecificFilterSelector(FilterAttribute.CLICKS);
const gscExistsFilterSelector = SpecificFilterSelector(FilterAttribute.GSC_EXISTS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  const keywordFilter = keywordFilterSelector(state);
  const countryNameFilter = countryNameFilterSelector(state);
  const impressionsFilter = impressionsFilterSelector(state);
  const clicksFilter = clicksFilterSelector(state);
  const gscExistsFilter = gscExistsFilterSelector(state);

  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    keyword: keywordFilter && keywordFilter.value,
    keywordComparison: keywordFilter && keywordFilter.comparison,
    countryName: countryNameFilter && countryNameFilter.value,
    hideExisting: gscExistsFilter && !gscExistsFilter.value,
    impressions: impressionsFilter && impressionsFilter.value,
    impressionsComparison: impressionsFilter && impressionsFilter.comparison,
    clicks: clicksFilter && clicksFilter.value,
    clicksComparison: clicksFilter && clicksFilter.comparison,
    filters: state.filter.filterGroup.filters,
  };
};

export default compose(
  withFiltersEditor,
  connect(
    mapStateToProps,
    { showModal },
  ),
)(ImportFromGSC);
