// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose, withApollo } from 'react-apollo';
import * as Sort from 'Types/Sort';
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
import { subscribeToGroup } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { withProps, offlineFilter } from 'Components/HOC';
import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';
import linkWithFilters from 'Components/Filters/linkWithFilters';
import { FilterAttribute, FilterComparison, FilterValueType } from 'Types/Filter';
import type { DomainsFilter } from 'Types/Filter';

import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// cells
import ActionsCell from 'Components/Table/TableRow/ActionsCell';
import GroupCell from 'Components/Table/TableRow/GroupCell';
import { graphql } from 'react-apollo/index';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
  showModal: Function,
  deleteClientMutation: Function,
  prepareData: Function,
};

const tableName = TableIDs.GROUPS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;
const defaultHeaderHeight = 37;

const groupsQuery = gql`
  query groupsInfiniteTable_clients {
    clients {
      id
      name
      dateAdded
      numberOfDomains
      numberOfKeywords
      organization {
        id
      }
      domains {
        id
      }
    }
  }
`;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

class GroupsInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandler: SubscriptionHandle;

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillMount() {
    this._subHandler = subscribeToGroup(debounce(() => this.updateTable(), 1000));
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();
  }

  handleEditGroup = group => {
    this.props.showModal({
      modalType: 'EditGroup',
      modalTheme: 'light',
      modalProps: {
        groupId: group.id,
        initialValues: {
          groupName: group.name,
        },
        refetch: this.resetTable,
      },
    });
  };

  handleDeleteGroup = group => {
    const { id, name, organization } = group;
    this.props
      .deleteClientMutation({
        variables: {
          input: {
            id,
            name,
            organization: organization.id,
            delete: true,
          },
        },
      })
      .then(({ data: { updateClient: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Could not delete group'));
          return;
        }
        Toast.success(t('Group deleted'));
        this.resetTable();
      });
  };

  showDeleteConfirmation = group => {
    const { name } = group;
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Group?'),
        description: t(
          'The group %s and all the domains within it will be permanently deleted.',
          name,
        ),
        confirmLabel: t('Delete group'),
        action: () => this.handleDeleteGroup(group),
      },
    });
  };

  makeOverviewLink = (group: any) => {
    if (!group.domains || group.domains.length === 0) return '';
    const domainsIds = group.domains.map(domain => domain.id);
    const domainsFilter: DomainsFilter = {
      attribute: FilterAttribute.DOMAINS,
      type: FilterValueType.LIST,
      comparison: FilterComparison.CONTAINS,
      value: domainsIds,
    };
    return linkWithFilters('/keywords/overview', [domainsFilter], KEYWORDS_FILTER_SET, [], true);
  };

  getQuery = () =>
    this.props.client.query({
      query: groupsQuery,
      fetchPolicy: 'network-only',
    });

  defaultColumns = [
    ColumnIDs.GROUP_NAME,
    ColumnIDs.NUMBER_OF_DOMAINS,
    ColumnIDs.NUMBER_OF_KEYWORDS,
    ColumnIDs.CREATED_AT,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.GROUP_NAME,
      name: t('Group Name'),
      required: true,
      responsive: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => <GroupCell groupData={props.rowData} />,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.GROUP_NAME}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.NUMBER_OF_DOMAINS,
      name: t('Number of Domains'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => props.rowData.numberOfDomains,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.NUMBER_OF_DOMAINS}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.NUMBER_OF_KEYWORDS,
      name: t('Number of Keywords'),
      width: 162,
      cellRenderer: (props: CellRendererParams) =>
        props.rowData.numberOfDomains ? (
          <Link to={this.makeOverviewLink(props.rowData)}>{props.rowData.numberOfKeywords}</Link>
        ) : (
          props.rowData.numberOfKeywords
        ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.NUMBER_OF_KEYWORDS}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.CREATED_AT,
      name: t('Created At'),
      width: 100,
      responsive: true,
      required: true,
      cellRenderer: (props: CellRendererParams) => props.rowData.dateAdded,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.CREATED_AT}
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
              onSelect: () => this.handleEditGroup(props.rowData),
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

  queryDataFormatter = ({ clients }) => {
    const filteredClients = this.props.prepareData(clients);
    return {
      list: filteredClients,
      numResults: filteredClients.length,
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.GROUPS}
        tableName={tableName}
        itemsName={t('groups')}
        defaultSortField={ColumnIDs.GROUP_NAME}
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
        onUpdate={onUpdate}
      />
    );
  }
}

const deleteClientMutation = gql`
  mutation groupsInfiniteTable_updateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

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
    sortTypes: {
      createdAt: Sort.DATE,
    },
    transformData: {
      domains: domain => domain.map(({ id }) => id),
    },
    mappings: {
      createdAt: 'dateAdded',
      clients: 'id',
    },
    withoutPagination: true,
  }),
  graphql(deleteClientMutation, { name: 'deleteClientMutation', withRef: true }),
)(withApollo(GroupsInfiniteTable, { withRef: true }));
