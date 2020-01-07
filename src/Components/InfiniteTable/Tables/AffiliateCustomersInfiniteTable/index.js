// @flow
import React, { Component } from 'react';
import moment from 'moment';
import { compose, withApollo } from 'react-apollo';
import { uniqueId } from 'lodash';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import type { FilterBase } from 'Types/Filter';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import * as Sort from 'Types/Sort';
import { ColumnIDs } from './ColumnIDs';
import { withProps, offlineFilter } from 'Components/HOC';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';
import FormatNumber from '../../../FormatNumber';

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

const tableName = TableIDs.AFFILIATE_CUSTOMERS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;
const defaultHeaderHeight = 37;

const customersAndTrialsQuery = gql`
  query AffiliateCustomersInfiniteTable_customersAndTrials($filters: [FilterInput]!) {
    affiliate {
      visitors(filters: $filters, includeTrials: true, includeCustomers: true) {
        id
        referrer
        totalCommission
        organization {
          id
          dateAdded
          activePlan {
            id
            name
            isTrial
          }
        }
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
      query: customersAndTrialsQuery,
      variables: {
        filters,
      },
      fetchPolicy: 'network-only',
    });
  };

  defaultColumns = [
    ColumnIDs.ID,
    ColumnIDs.REFERRED_ON,
    ColumnIDs.PLAN,
    ColumnIDs.STATUS,
    ColumnIDs.COMMISSION,
  ];

  getStatus = rowData => {
    const { organization } = rowData;
    if (!organization.activePlan) {
      return 'Not active';
    }
    if (organization.activePlan.isTrial) {
      return 'Trialing';
    }

    return 'Subscribed';
  };

  getColumns = () => [
    {
      id: ColumnIDs.ID,
      name: t('ID'),
      required: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => props.rowData.id,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.REFERRED_ON,
      name: t('Referred on'),
      width: 200,
      cellRenderer: (props: CellRendererParams) =>
        moment(new Date(props.rowData.organization.dateAdded)).format('LLL'),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.REFERRED_ON}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.PLAN,
      name: t('Plan'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => {
        const {
          rowData: { organization },
        } = props;
        return organization.activePlan ? organization.activePlan.name : '-';
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.PLAN}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.STATUS,
      name: t('Status'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => props.rowData.status,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.STATUS}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.COMMISSION,
      name: t('Total commission'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => {
        return <FormatNumber currency="USD">{props.rowData.totalCommission}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.COMMISSION}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
  ];

  resetTable = () => {
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({ affiliate: { visitors } }) => {
    const filteredVisitors = this.props.prepareData(
      visitors.map(item => ({ ...item, status: this.getStatus(item) })),
    );
    return {
      list: filteredVisitors,
      numResults: filteredVisitors.length,
    };
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.AFFILIATE_CUSTOMERS}
        tableName={tableName}
        itemsName={t('customers')}
        defaultSortField={ColumnIDs.ID}
        defaultSortOrder="desc"
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
    tableName,
    skipAll: true,
    sortTypes: {
      referredOn: Sort.DATE,
    },
    mappings: {
      commission: 'affiliate.commission',
      plan: 'organization.activePlan.name',
      referredOn: 'organization.date_added',
    },
    withoutPagination: true,
  }),
)(withApollo(AffiliateVisitorsInfiniteTable, { withRef: true }));
