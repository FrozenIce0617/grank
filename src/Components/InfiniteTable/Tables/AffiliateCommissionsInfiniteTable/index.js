// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import moment from 'moment';
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
import FormatNumber from '../../../FormatNumber';

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

const paymentsQuery = gql`
  query AffiliateVisitorsInfiniteTable_payments($filters: [FilterInput]!) {
    affiliate {
      payments(filters: $filters) {
        id
        createdAt
        amount
        payment {
          paymentType
        }
        paid
      }
    }
  }
`;

class AffiliatePaymentsInfiniteTable extends Component<Props, State> {
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
      query: paymentsQuery,
      variables: {
        filters,
      },
      fetchPolicy: 'network-only',
    });
  };

  defaultColumns = [ColumnIDs.URL, ColumnIDs.AMOUNT];

  getColumns = () => [
    {
      id: ColumnIDs.CREATED_AT,
      name: t('Date'),
      required: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => moment(props.rowData.createdAt).format('LLL'),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.PAYMENT_TYPE,
      name: t('Type'),
      required: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => props.rowData.type,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.AMOUNT,
      name: t('Commission amount'),
      required: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => {
        return <FormatNumber currency="USD">{props.rowData.amount}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.PAID,
      name: t('Paid'),
      required: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => (props.rowData.paid ? 'Yes' : 'No'),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
  ];

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({ affiliate: { payments } }) => {
    const filteredPayments = this.props.prepareData(
      payments.map(item => ({ ...item, type: this.getPaymentType(item) })),
    );
    return {
      list: filteredPayments,
      numResults: filteredPayments.length,
    };
  };

  resetTable = () => {
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  getPaymentType = rowData => {
    const {
      payment: { paymentType },
    } = rowData;

    if (paymentType === 'A_1') {
      return 'New';
    } else if (paymentType === 'A_2') {
      return 'Recurring';
    } else if (paymentType === 'A_3') {
      return 'Upgrade';
    } else if (paymentType === 'A_4') {
      return 'Downgrade';
    } else if (paymentType === 'A_5') {
      return 'Reactivation';
    } else if (paymentType === 'A_10') {
      return 'Partner API';
    }

    return '';
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.AFFILIATE_PAYMENTS}
        tableName={tableName}
        itemsName={t('payments')}
        defaultSortField={ColumnIDs.AMOUNT}
        defaultSortOrder="desc"
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        idField="id"
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
)(withApollo(AffiliatePaymentsInfiniteTable, { withRef: true }));
