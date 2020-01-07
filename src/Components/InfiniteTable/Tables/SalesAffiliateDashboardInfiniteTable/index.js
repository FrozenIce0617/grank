// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import { TableIDs } from 'Types/Table';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId } from 'lodash';

import { withProps, offlineFilter } from 'Components/HOC';
import InfiniteTable from 'Components/InfiniteTable';
import FormatNumber from 'Components/FormatNumber';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
  prepareData: Function,
};

const tableName = TableIDs.SALES_AFFILIATE_DASHBOARD;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;
const defaultHeaderHeight = 37;

const groupsQuery = gql`
  query salesAffiliateDashboardInfiniteTable_adminOrganizations {
    adminOrganizations(dataType: "affiliate") {
      id
      name
      additionalData
    }
  }
`;

type State = {
  resetIndicator: number,
};

class SalesAffiliateDashboardInfiniteTable extends Component<Props, State> {
  _table: any;

  state = {
    resetIndicator: 0,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  getQuery = () => {
    const { filters } = this.props;
    return this.props.client.query({
      query: groupsQuery,
      variables: {
        filters,
      },
      fetchPolicy: 'network-only',
    });
  };

  defaultColumns = [
    ColumnIDs.AFFILIATE,
    ColumnIDs.VISITORS,
    ColumnIDs.PAGE_VIEWS,
    ColumnIDs.TRIALS,
    ColumnIDs.CUSTOMERS,
    ColumnIDs.MONEY_EARNED,
    ColumnIDs.MMR,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.AFFILIATE,
      name: t('Affiliate'),
      required: true,
      responsive: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => props.rowData.name,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.AFFILIATE}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.VISITORS,
      name: t('Visitors'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => props.rowData.additionalData.visitors,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.VISITORS}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.TRIALS,
      name: t('Trials'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => props.rowData.additionalData.trials,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.TRIALS}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.CUSTOMERS,
      name: t('Customers'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => props.rowData.additionalData.customers,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.CUSTOMERS}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.MONEY_EARNED,
      name: t('Commission'),
      width: 130,
      cellRenderer: (props: CellRendererParams) => (
        <FormatNumber currency="USD">{props.rowData.additionalData.commission}</FormatNumber>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.MONEY_EARNED}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.MMR,
      name: t('MRR'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => (
        <FormatNumber currency="USD">{props.rowData.additionalData.mrr}</FormatNumber>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          className="no-border"
          sortField={ColumnIDs.MMR}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
  ];

  resetTable = () => {
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({ adminOrganizations }) => {
    adminOrganizations = adminOrganizations.map(org => {
      let additionalData = {};
      try {
        additionalData = JSON.parse(org.additionalData);
      } catch (ignore) {} // eslint-disable-line no-empty
      return {
        ...org,
        additionalData,
      };
    });

    const filteredAffiliates = this.props.prepareData(adminOrganizations);
    return {
      list: filteredAffiliates,
      numResults: filteredAffiliates.length,
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.SALES_AFFILIATE_DASHBOARD}
        tableName={tableName}
        itemsName={t('affiliates')}
        defaultSortField={ColumnIDs.AFFILIATE}
        ref={this.setTableRef}
        defaultSortOrder="asc"
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        resetIndicator={resetIndicator}
        onUpdate={onUpdate}
      />
    );
  }
}

const mapStateToProps = state => ({
  filters: state.filter.filterGroup.filters,
});

export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
  offlineFilter({
    skip: ['compare_to', 'period'],
    tableName,
    mappings: {
      [ColumnIDs.AFFILIATE]: 'name',
      [ColumnIDs.VISITORS]: 'additionalData.visitors',
      [ColumnIDs.PAGE_VIEWS]: 'additionalData.pageViews',
      [ColumnIDs.TRIALS]: 'additionalData.trials',
      [ColumnIDs.CUSTOMERS]: 'additionalData.customers',
      [ColumnIDs.MONEY_EARNED]: 'additionalData.commission',
      [ColumnIDs.MMR]: 'additionalData.mrr',
    },
    withoutPagination: true,
  }),
)(withApollo(SalesAffiliateDashboardInfiniteTable, { withRef: true }));
