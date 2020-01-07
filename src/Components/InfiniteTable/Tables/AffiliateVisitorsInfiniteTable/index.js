// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { uniqueId } from 'lodash';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import type { FilterBase } from 'Types/Filter';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { withProps, offlineFilter } from 'Components/HOC';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: FilterBase[],
  showModal: Function,
  prepareData: Function,
};

type State = {
  resetIndicator: number,
};

const tableName = TableIDs.AFFILIATE_VISITORS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;
const defaultHeaderHeight = 37;

const referrersQuery = gql`
  query AffiliateVisitorsInfiniteTable_referrers($filters: [FilterInput]!) {
    affiliate {
      referrers(filters: $filters) {
        url
        amount
      }
    }
  }
`;

class AffiliateVisitorsInfiniteTable extends Component<Props, State> {
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
      query: referrersQuery,
      variables: {
        filters,
      },
      fetchPolicy: 'network-only',
    });
  };

  defaultColumns = [ColumnIDs.URL, ColumnIDs.AMOUNT];

  getColumns = () => [
    {
      id: ColumnIDs.URL,
      name: t('URL'),
      required: true,
      responsive: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => props.rowData.url,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.AMOUNT,
      name: t('Amount'),
      required: true,
      width: 100,
      cellRenderer: (props: CellRendererParams) => props.rowData.amount,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.AMOUNT}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
  ];

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({ affiliate: { referrers } }) => {
    const filteredReferrers = this.props.prepareData(referrers);
    return {
      list: filteredReferrers,
      numResults: filteredReferrers.length,
    };
  };

  resetTable = () => {
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.AFFILIATE_VISITORS}
        tableName={tableName}
        itemsName={t('referrers')}
        defaultSortField={ColumnIDs.AMOUNT}
        defaultSortOrder="desc"
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        idField="url"
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
    tableName,
    skipAll: true,
    withoutPagination: true,
  }),
)(withApollo(AffiliateVisitorsInfiniteTable, { withRef: true }));
