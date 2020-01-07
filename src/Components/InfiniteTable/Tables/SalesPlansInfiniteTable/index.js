// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose, withApollo } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, debounce } from 'lodash';
import { withProps, offlineFilter } from 'Components/HOC';
import copy from 'copy-to-clipboard';
import CopyIcon from 'icons/copy.svg?inline';
import ViewIcon from 'icons/view.svg?inline';
import PromiseMemorizer from 'Utilities/PromiseMemorizer';
import FormatNumber from 'Components/FormatNumber';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// cells
import ActionsCell from 'Components/Table/TableRow/ActionsCell';

type Props = {
  searchTerm: string,
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
  history: Object,
  prepareData: Function,
};

const tableName = TableIDs.SALES_PLANS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;

const plansQuery = gql`
  query salesPlansInfiniteTable_adminPlans {
    adminPlans {
      id
      name
      priceMonthly
      priceYearly
      currency
      comment
      subscribers
    }
  }
`;

type State = {
  resetIndicator: number,
};

class SalesPlansInfiniteTable extends Component<Props, State> {
  _plansMemorizer = new PromiseMemorizer();

  state = {
    resetIndicator: 0,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable(true);
    }

    if (nextProps.searchTerm !== this.props.searchTerm) {
      debounce(() => this.resetTable(true), 300)();
    }
  }

  getQuery = () =>
    this._plansMemorizer.wrap(() =>
      this.props.client.query({
        query: plansQuery,
        fetchPolicy: 'network-only',
      }),
    );

  defaultColumns = [
    ColumnIDs.NAME,
    ColumnIDs.COMMENT,
    ColumnIDs.PRICE,
    ColumnIDs.SUBSCRIBERS,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.NAME,
      name: t('Name'),
      required: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => props.rowData.name,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.NAME}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.COMMENT,
      name: t('Comment'),
      responsive: true,
      hasDynamicHeight: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => <span>{props.rowData.comment}</span>,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.PRICE,
      name: t('Price'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => (
        <span>
          <FormatNumber currency={props.rowData.currency}>
            {props.rowData.priceMonthly}
          </FormatNumber>m /{' '}
          <FormatNumber currency={props.rowData.currency}>{props.rowData.priceYearly}</FormatNumber>y
        </span>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.PRICE}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.SUBSCRIBERS,
      name: t('Subscribers'),
      width: 110,
      cellRenderer: (props: CellRendererParams) => props.rowData.subscribers,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.SUBSCRIBERS}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.ACTIONS,
      name: t('Actions'),
      width: 60,
      cellRenderer: (props: CellRendererParams) => {
        const planRelativeLink = `/checkout/1/${props.rowData.id}`;
        const planLink = `${window.location.origin}/app${planRelativeLink}`;
        return (
          <ActionsCell
            shouldUpdateIndicator={props.rowData}
            actions={[
              {
                onSelect: () => copy(planLink),
                label: t('Copy link'),
                icon: CopyIcon,
              },
              {
                onSelect: () => this.props.history.push(planRelativeLink),
                label: t('View'),
                icon: ViewIcon,
              },
            ]}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          className="no-border"
          hideLabel
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
  ];

  resetTable = (keepMemorizer: boolean) => {
    !keepMemorizer && this._plansMemorizer.clear();
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  queryDataFormatter = ({ adminPlans }) => {
    const st = this.props.searchTerm.toLowerCase();
    const filteredPlans = this.props.prepareData(
      adminPlans.filter(plan => {
        const isIDMatch = plan.id === st;
        const isNameMatch = plan.name.toLowerCase().indexOf(st) !== -1;
        const isCommentMatch = plan.comment.toLowerCase().indexOf(st) !== -1;
        return isIDMatch || isNameMatch || isCommentMatch;
      }),
    );
    return {
      list: filteredPlans,
      numResults: filteredPlans.length,
    };
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.SALES_PLANS}
        tableName={tableName}
        itemsName={t('plans')}
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        minRowHeight={defaultRowHeight}
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
  withRouter,
  connect(
    mapStateToProps,
    null,
    null,
    { withRef: true },
  ),
  offlineFilter({
    tableName,
    mappings: {
      price: 'priceMonthly',
    },
    withoutPagination: true,
  }),
)(withApollo(SalesPlansInfiniteTable, { withRef: true }));
