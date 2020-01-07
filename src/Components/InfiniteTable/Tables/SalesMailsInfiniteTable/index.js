// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, withApollo } from 'react-apollo';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import gql from 'graphql-tag';
import moment from 'moment';

import { t } from 'Utilities/i18n';
import Ellipsis from 'Components/Ellipsis';
import { showModal } from 'Actions/ModalAction';
import { MAX_NUMBER_OF_ROWS, TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import InfiniteTable from 'Components/InfiniteTable';
import { withProps } from 'Components/HOC';

import './sales-mails-infinite-table.scss';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  showModal: Function,
};

const tableName = TableIDs.SALES_MAILS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;
const defaultHeaderHeight = 37;

const adminMailsQuery = gql`
  query salesMailsInfiniteTable_adminLoggedEmail($startIndex: Int!, $stopIndex: Int!) {
    adminLoggedEmail(startIndex: $startIndex, stopIndex: $stopIndex) {
      id
      createdAt
      messageId
      subject
      recipients
      fromEmail
      replyTo
      mtaAccept
      mtaError
      notificationsTypes
      notifications
      opened
    }
  }
`;

class SalesMailsInfiniteTable extends Component<Props, State> {
  _table: any;

  handleShowDetails = rowData => {
    this.props.showModal({
      modalType: 'SalesMailDetails',
      modalProps: {
        data: rowData,
      },
    });
  };

  getQuery = ({ startIndex, stopIndex }) =>
    this.props.client.query({
      query: adminMailsQuery,
      fetchPolicy: 'network-only',
      variables: {
        startIndex,
        stopIndex,
      },
    });

  defaultColumns = [ColumnIDs.CREATED_AT, ColumnIDs.RECIPIENTS, ColumnIDs.SUBJECT];

  getColumns = () => [
    {
      id: ColumnIDs.CREATED_AT,
      name: t('Created At'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => (
        <a onClick={() => this.handleShowDetails(props.rowData)}>
          {moment(props.rowData.createdAt).format('YYYY-MM-DD HH:mm')}
        </a>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.RECIPIENTS,
      name: t('Recipient'),
      hasDynamicHeight: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => (
        <div className="email-recipients">{props.rowData.recipients.join(', ')}</div>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.SUBJECT,
      name: t('Subject'),
      responsive: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => (
        <div className="ellipsis">
          <Ellipsis>{props.rowData.subject}</Ellipsis>
        </div>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
  ];

  queryDataFormatter = ({ adminLoggedEmail }) => {
    return {
      list: adminLoggedEmail,
      numResults: MAX_NUMBER_OF_ROWS,
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;

    return (
      <InfiniteTable
        className="sales-mails-infinite-table"
        stickyId={StickyIDs.containers.SALES_MAILS}
        tableName={tableName}
        itemsName={t('emails')}
        defaultSortField={ColumnIDs.CREATED_AT}
        ref={this.setTableRef}
        defaultSortOrder="asc"
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        minRowHeight={defaultRowHeight}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        showPaginationInfo={false}
        onUpdate={onUpdate}
      />
    );
  }
}

export default compose(
  connect(
    null,
    { showModal },
    null,
    { withRef: true },
  ),
)(withApollo(SalesMailsInfiniteTable, { withRef: true }));
