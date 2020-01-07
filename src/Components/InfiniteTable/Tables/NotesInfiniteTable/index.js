// @flow
import React, { Component } from 'react';
import { compose, withApollo, graphql } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import { FilterAttribute } from 'Types/Filter';
import Toast from 'Components/Toast';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId } from 'lodash';
import { withProps, offlineFilter } from 'Components/HOC';
import * as Sort from 'Types/Sort';
import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';
import Ellipsis from 'Components/Ellipsis';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// cells
import ActionsCell from 'Components/Table/TableRow/ActionsCell';
import { formatDate } from 'Utilities/format';

type Props = {
  domainId: string,
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
  user: Object,
  showModal: Function,
  deleteNoteMutation: Function,
  prepareData: Function,
};

const tableName = TableIDs.NOTES;

const HeaderCell = withProps({ tableName })(HeaderCellBase);

const defaultRowHeight = 35;
const defaultHeaderHeight = 77;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

const notesQuery = gql`
  query notesInfiniteTable_domain($id: ID!) {
    domain(id: $id) {
      id
      notes {
        id
        createdAt
        note
        keywords {
          id
          keyword
        }
        user {
          id
          fullName
        }
      }
    }
  }
`;

class NotesInfiniteTable extends Component<Props, State> {
  _table: any;

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  showDeleteConfirmation = (action, note) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Note?'),
        description: t('The note will be permanently deleted.'),
        confirmLabel: t('Delete note'),
        cancelLabel: t('Cancel'),
        action: () => action(note),
      },
    });
  };

  deleteNote = note => {
    this.props
      .deleteNoteMutation({
        variables: {
          input: {
            createdAt: formatDate(new Date()),
            note: '~~DELETED~~',
            id: note.id,
            delete: true,
          },
        },
      })
      .then(({ data: { updateDomain: { errors } = {} } }) => {
        if (errors && errors.length) {
          Toast.error(t('Could not delete note. Something went wrong, please try again.'));
          return;
        }
        Toast.success(t('Note deleted'));
        this.resetTable();
      });
  };

  handleEditNote = note => {
    this.props.showModal({
      modalType: 'EditNote',
      modalTheme: 'light',
      modalProps: {
        noteId: note.id,
        refresh: this.resetTable,
        enableEditingKeywords: true,
      },
    });
  };

  getQuery = () => {
    const { domainId } = this.props;
    return this.props.client.query({
      query: notesQuery,
      variables: {
        id: domainId,
      },
      fetchPolicy: 'network-only',
    });
  };

  defaultColumns = [
    ColumnIDs.DATE,
    ColumnIDs.NOTE,
    ColumnIDs.FULLNAME,
    ColumnIDs.KEYWORDS,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.DATE,
      name: t('Created At'),
      width: 300,
      cellRenderer: (props: CellRendererParams) => props.rowData.createdAt,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.DATE]}
          label={props.label}
          sortField={ColumnIDs.DATE}
          descDefault
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.NOTE,
      name: t('Note'),
      width: 200,
      responsive: true,
      required: true,
      cellRenderer: (props: CellRendererParams) => <Ellipsis>{props.rowData.note}</Ellipsis>,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.NOTE]}
          sortField={ColumnIDs.NOTE}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'ellipsis',
    },
    {
      id: ColumnIDs.FULLNAME,
      name: t('Created By'),
      width: 150,
      cellRenderer: (props: CellRendererParams) =>
        props.rowData.user && props.rowData.user.fullName,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.USER_NAME]}
          sortField={ColumnIDs.FULLNAME}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS,
      name: t('Keywords'),
      width: 100,
      responsive: true,
      cellRenderer: (props: CellRendererParams) => (
        <Ellipsis>{props.rowData.keywords.map(({ keyword }) => keyword).join(', ')}</Ellipsis>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.KEYWORDS]}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'ellipsis',
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
              onSelect: () => this.handleEditNote(props.rowData),
              label: t('Edit'),
              icon: EditIcon,
            },
            {
              onSelect: () => this.showDeleteConfirmation(this.deleteNote, props.rowData),
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

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({ domain: { notes } }) => {
    const list = this.props.prepareData(notes);
    return {
      list,
      numResults: list.length,
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
        stickyId={StickyIDs.containers.NOTES}
        tableName={tableName}
        defaultSortField={ColumnIDs.DATE}
        itemsName={t('notes')}
        ref={this.setTableRef}
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

const mapStateToProps = state => ({
  filters: state.filter.filterGroup.filters,
});

const deleteNoteMutation = gql`
  mutation notesInfiniteTable_editNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      note {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  offlineFilter({
    skip: ['domains'],
    mappings: { date: 'createdAt', fullName: 'user.fullName' },
    sortTypes: { date: Sort.DATE },
    transformData: {
      keywords: kws => kws.map(({ id }) => id),
    },
    tableName,
    withoutPagination: true,
  }),
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
  graphql(deleteNoteMutation, { name: 'deleteNoteMutation', withRef: true }),
)(withApollo(NotesInfiniteTable, { withRef: true }));
