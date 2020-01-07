// @flow
import React, { Component } from 'react';
import { compose, withApollo, graphql } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import Toast from 'Components/Toast';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, debounce } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { withProps } from 'Components/HOC';
import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// cells
import DomainDetailsCell from 'Components/Table/TableRow/DomainDetailsCell';
import ActionsCell from 'Components/Table/TableRow/ActionsCell';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
  user: Object,
  showModal: Function,
  deleteDomainMutation: Function,
};

const tableName = TableIDs.DOMAINS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const domainsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 45;
const defaultHeaderHeight = 37;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

const domainsQuery = gql`
  query domainsInfiniteTable_domains(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $withDomainDisplayName: Boolean!
    $withClientName: Boolean!
    $withKeywords: Boolean!
    $withDateAdded: Boolean!
  ) {
    domains(filters: $filters, pagination: $pagination, ordering: $ordering) {
      domains {
        id
        faviconUrl
        canUpdate
        domain
        displayName @include(if: $withDomainDisplayName)
        sortName
        dateAdded @include(if: $withDateAdded)
        totalKeywords @include(if: $withKeywords)
        client @include(if: $withClientName) {
          id
          name
        }
      }
      pagination {
        page
        results
        numResults
        numPages
      }
    }
  }
`;

class DomainsInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandler: SubscriptionHandle;

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillMount() {
    this._subHandler = subscribeToDomain(debounce(() => this.updateTable(), 1000));
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();
  }

  handleEditDomain = domain => {
    this.props.showModal({
      modalType: 'EditDomain',
      modalTheme: 'light',
      modalProps: {
        domainId: domain.id,
        refetch: this.resetTable,
      },
    });
  };

  handleDeleteDomain = domain => {
    const { id } = domain;

    this.props
      .deleteDomainMutation({
        variables: {
          input: {
            id,
          },
        },
      })
      .then(({ data: { deleteDomain: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Could not delete domain'));
          return;
        }
        Toast.success(t('Domain deleted'));
        this.resetTable();
      });
  };

  showDeleteConfirmation = domain => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Domain?'),
        description: t('The domain %s will be permanently deleted.', domain.domain),
        confirmLabel: t('Delete domain'),
        action: () => this.handleDeleteDomain(domain),
      },
    });
  };

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters } = this.props;
    return domainsPromiseBlocker.wrap(
      this.props.client.query({
        query: domainsQuery,
        variables: {
          filters,
          pagination: {
            page: 1,
            startIndex,
            stopIndex,
            results: 0,
          },
          ordering: {
            order: sortOrder.toUpperCase(),
            orderBy: sortField,
          },
          withDomainDisplayName: customColumns.includes(ColumnIDs.DOMAIN_DISPLAY_NAME),
          withClientName: customColumns.includes(ColumnIDs.CLIENT_NAME),
          withKeywords: customColumns.includes(ColumnIDs.KEYWORDS),
          withDateAdded: customColumns.includes(ColumnIDs.DATE_ADDED),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.DOMAIN_DISPLAY_NAME,
    ColumnIDs.CLIENT_NAME,
    ColumnIDs.KEYWORDS,
    ColumnIDs.DATE_ADDED,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.DOMAIN_DISPLAY_NAME,
      name: t('Domain Name'),
      required: true,
      responsive: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => (
        <DomainDetailsCell domainData={props.rowData} reset small />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.DOMAIN_DISPLAY_NAME}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.CLIENT_NAME,
      name: t('Belongs to Group'),
      width: 200,
      responsive: true,
      cellRenderer: (props: CellRendererParams) => props.rowData.client.name,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.CLIENT_NAME}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS,
      name: t('Number of Keywords'),
      width: 162,
      cellRenderer: (props: CellRendererParams) => props.rowData.totalKeywords,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.DATE_ADDED,
      name: t('Created On'),
      width: 100,
      responsive: true,
      required: true,
      cellRenderer: (props: CellRendererParams) => props.rowData.dateAdded,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.DATE_ADDED}
          descDefault
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.ACTIONS,
      name: t('Actions'),
      width: 60,
      cellRenderer: (props: CellRendererParams) => (
        <ActionsCell
          shouldUpdateIndicator={props.rowData}
          actions={[
            {
              onSelect: () => this.handleEditDomain(props.rowData),
              label: t('Edit'),
              icon: EditIcon,
            },
            {
              onSelect: () => this.showDeleteConfirmation(props.rowData),
              label: t('Delete'),
              icon: DeleteIcon,
            },
          ]}
        />
      ),
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

  getList = () =>
    this._table
      ? this._table
          .getWrappedInstance()
          .getWrappedInstance()
          .getList()
      : [];

  getNumResults = () =>
    this._table
      ? this._table
          .getWrappedInstance()
          .getWrappedInstance()
          .getNumResults()
      : 0;

  showSettings = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .showSettings();

  resetTable = () => {
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  updateTable = () => {
    this.setState({
      silentUpdateIndicator: uniqueId(),
    });
  };

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({
    domains: {
      domains,
      pagination: { numResults },
    },
  }) => ({
    list: domains,
    numResults,
  });

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.DOMAINS}
        tableName={tableName}
        itemsName={t('domains')}
        defaultSortField={ColumnIDs.DOMAIN_DISPLAY_NAME}
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
        silentUpdateIndicator={silentUpdateIndicator}
        batchSize={25}
        onUpdate={onUpdate}
      />
    );
  }
}

const deleteDomainMutation = gql`
  mutation domainsInfiniteTable_deleteDomain($input: DeleteDomainInput!) {
    deleteDomain(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const mapStateToProps = state => ({
  filters: CompareDatesFiltersSelector(state),
});

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
  graphql(deleteDomainMutation, { name: 'deleteDomainMutation', withRef: true }),
)(withApollo(DomainsInfiniteTable, { withRef: true }));
