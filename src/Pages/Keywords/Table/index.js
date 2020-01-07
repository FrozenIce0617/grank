// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';

import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';

import { showModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';
import { FilterAttribute } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import type { FilterBase } from 'Types/Filter';
import MoreActions from './Actions/MoreActions';
import MoreRemoveActions from './Actions/MoreRemoveActions';
import './keywords-table.scss';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';

import KeywordsInfiniteTable from 'Components/InfiniteTable/Tables/KeywordsInfiniteTable';
import { KEYWORDS } from 'Pages/Layout/ActionsMenu';

type Props = {
  // Actions
  showModal: Function,
  filters: FilterBase[],

  domainId: ?string,
  domainData: Object,
  featureAdvancedMetrics: boolean,
  domainInfo?: DomainInfo,
};

type State = {
  selected: Set<string>, // selected keywords if isAllSelected false, unselected otherwise
  isAllSelected: boolean,
};

class KeywordsTable extends Component<Props, State> {
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

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        refresh: this.resetTable,
      },
    });
  };

  handleReportAction = () => {
    this.props.showModal({
      modalType: 'OneTimeReport',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
      },
    });
  };

  handleCompareAction = () => {
    const { selected, isAllSelected } = this.state;
    const selectedKeywords = selected.size
      ? this.getKeywords().filter(keywordData => selected.has(keywordData.id))
      : [];
    const realSelectedKeywords = !isAllSelected
      ? selectedKeywords
      : this.getKeywords().filter(item => !selectedKeywords.includes(item));

    this.props.showModal({
      modalType: 'KeywordsComparison',
      modalTheme: 'light',
      modalProps: {
        keywords: realSelectedKeywords,
      },
    });
  };

  handleSelect = ({ currentTarget: { name } }) => {
    const { selected, isAllSelected } = this.state;
    const set = new Set(selected);
    (set.has(name) ? set.delete : set.add).call(set, name);

    // (un)select all on (un)select last
    // TODO uncomment when add notes for filtered keywords will be ready
    // if (set.size === this.getNumResults() && set.size !== 0) {
    //   this.setState({
    //     isAllSelected: !isAllSelected,
    //     selected: new Set(),
    //   });
    //   return;
    // }

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

  // TODO as we don't use redux store - update of the child components
  // don't apply on the parent ones -> stale state from the children is rendered. Temp fix.
  // It's bad practice and another reason why we need to use redux store.
  handleUpdate = () => {
    this.forceUpdate();
  };

  // TODO refactor infinite table to use redux global store to remove these spagetti methods
  // this should be done before applying infinite table to other tables
  getInfiniteTableInstance = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance();

  optimisticUpdate = (...args) => {
    const instance = this.getInfiniteTableInstance();
    return instance && instance.optimisticUpdate(...args);
  };

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

  showTableSettings = () => {
    const instance = this.getInfiniteTableInstance();
    return instance && instance.showSettings();
  };

  renderActionButtons = () => {
    const actions = [];
    const { domainId, filters } = this.props;
    const { isAllSelected, selected } = this.state;

    // only show if we don't have multiple domains
    if (domainId) {
      actions.push(
        <Actions.AddAction key="add" label={t('Add keywords')} onClick={this.handleAddAction} />,
      );
      actions.push(<Actions.SettingsAction key="settings" onClick={this.showTableSettings} />);
      actions.push(<Actions.ReportAction key="report" onClick={this.handleReportAction} />);

      // if keywords are selected
      const selectedKeywords = selected.size
        ? this.getKeywords().filter(keywordData => selected.has(keywordData.id))
        : [];
      const numResults = this.getNumResults();

      actions.push(
        <MoreActions
          key="more"
          domainId={domainId}
          allKeywords={this.getKeywords()}
          keywords={selectedKeywords}
          shouldExclude={isAllSelected}
          optimisticUpdate={this.optimisticUpdate}
          numResults={numResults}
          filters={filters}
          refresh={this.resetTable}
        />,
        <MoreRemoveActions
          key="moreRemove"
          domainId={domainId}
          keywords={selectedKeywords}
          shouldExclude={isAllSelected}
          optimisticUpdate={this.optimisticUpdate}
          numResults={numResults}
          filters={filters}
          refresh={this.resetTable}
        />,
      );

      const realySelected = !isAllSelected
        ? selectedKeywords.length
        : numResults - selectedKeywords.length;
      if (realySelected) {
        actions.push(
          <Actions.CompareAction
            key="compare"
            label={`${realySelected} ${t('selected')}`}
            onClick={this.handleCompareAction}
          />,
        );
      }

      actions.push(<Actions.UpgradeAction key="upgradePlan" alignRight={true} />);
    }

    return actions;
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { domainId, featureAdvancedMetrics } = this.props;
    let { domainInfo } = this.props;
    const { isAllSelected, selected } = this.state;

    if (!domainId) {
      // Multiple domains case
      domainInfo = {
        id: null,
        canRefresh: false,
      };
    }

    return (
      <DashboardTemplate>
        <ActionsMenu menuFor={KEYWORDS} domainId={domainId} domainInfo={domainInfo}>
          {this.renderActionButtons()}
        </ActionsMenu>
        <div className="keywords-table content-container">
          <div className="table-container">
            <KeywordsInfiniteTable
              handleSelect={this.handleSelect}
              handleSelectAll={this.handleSelectAll}
              selected={selected}
              isAllSelected={isAllSelected}
              onUpdate={this.handleUpdate}
              ref={this.setTableRef}
              featureAdvancedMetrics={featureAdvancedMetrics}
              hasAnalytics={false}
            />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);

  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: state.filter.filterGroup.filters,
    featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  queryDomainInfo(),
)(KeywordsTable);
