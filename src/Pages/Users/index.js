// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Row, Col, Table } from 'reactstrap';

import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import Skeleton from 'Components/Skeleton';
import IconButton from 'Components/IconButton';
import NewIcon from 'icons/plus-rounded.svg?inline';
import PaginationOptionsBase from 'Components/PaginationOptions';
import SortableHeaderBase from 'Components/Table/SortableHeader';
import StickyContainerBase from 'Components/Sticky/Container';

import { showModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n/index';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';
import Toast from 'Components/Toast';
import TableEmptyState from 'Components/TableEmptyState';
import OptionsDropdown from 'Components/Controls/Dropdowns/OptionsDropdown';
import { subscribeToUser } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { withTable, withProps, offlineFilter } from 'Components/HOC';
import Gravatar from 'react-gravatar';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import { doAnyway } from 'Utilities/promise';

import SkeletonTableBody from 'Components/Skeleton/TableBody';

import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';

import './users-table.scss';

type Props = {
  data: Object,
  showModal: Function,
  updateUser: Function,
  prepareData: Function,
};

type State = {
  isSilentUpdate: boolean,
};

const tableName = TableIDs.USERS;
const SortableHeader = withProps({ tableName })(SortableHeaderBase);
const PaginationOptions = withProps({ tableName })(PaginationOptionsBase);
const StickyContainer = withProps({ name: tableName })(StickyContainerBase);

class Users extends Component<Props, State> {
  _userSubHandle: SubscriptionHandle;

  state = {
    isSilentUpdate: false,
  };

  componentDidMount() {
    this._userSubHandle = subscribeToUser(this.handleUpdate);
  }

  componentWillUnmount() {
    this._userSubHandle.unsubscribe();
  }

  getDropdownOptions = user => {
    const {
      data: {
        user: { id, isOrgAdmin },
      },
    } = this.props;

    return [
      {
        onSelect: () => this.handleEdit(user),
        label: t('Edit'),
        icon: <EditIcon />,
      },
      isOrgAdmin &&
        id !== user.id && {
          onSelect: () => this.handleDelete(user),
          label: t('Delete'),
          icon: <DeleteIcon />,
        },
    ];
  };

  getRows() {
    if (graphqlLoading({ ...this.props }) || graphqlError({ ...this.props })) {
      return [];
    }
    return this.props.prepareData(this.props.data.users);
  }

  handleUpdate = () => {
    this.setState({
      isSilentUpdate: true,
    });
    this.props.data.refetch().then(
      ...doAnyway(() => {
        this.setState({
          isSilentUpdate: false,
        });
      }),
    );
  };

  handleAdd = () => {
    this.props.showModal({
      modalType: 'AddUser',
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.data.refetch,
      },
    });
  };

  handleEdit = (user: Object) => {
    this.props.showModal({
      modalType: 'EditUser',
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.data.refetch,
        id: user.id,
      },
    });
  };

  handleDelete = (user: Object) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete user'),
        lockDuration: 0,
        title: t('Delete User?', user.fullName),
        description: t('Once deleted the user %s can no longer log in.', user.fullName),
        action: () => {
          const updateUserInput = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            isOrgAdmin: false,
            delete: true,
          };
          return this.props
            .updateUser({
              variables: {
                updateUserInput,
              },
            })
            .then(({ data: { updateUser: { errors } } }) => {
              if (errors && errors.length) {
                Toast.error('Something went wrong. Please reload and try again.');
              } else {
                Toast.success(t('User deleted'));
                this.props.data.refetch();
              }
            })
            .catch(() => Toast.error('Something went wrong. Please reload and try again.'));
        },
      },
    });
  };

  renderHead = () => (
    <Sticky
      containerName={StickyIDs.containers.USERS}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          <th className="icon-header" />
          <SortableHeader column="fullName">{t('Name')}</SortableHeader>
          <SortableHeader column="email">{t('Email')}</SortableHeader>
          <SortableHeader column="isOrgAdmin">{t('Account Type')}</SortableHeader>
          <th />
        </tr>
      )}
    </Sticky>
  );

  renderBody = () => {
    if (
      graphqlLoading({ ...this.props }) ||
      (graphqlError({ ...this.props }) && !this.state.isSilentUpdate)
    ) {
      return this.renderSkeleton();
    }
    return <StickyContainer tag="tbody">{this.getRows().map(this.renderRow)}</StickyContainer>;
  };

  renderRow = user => (
    <tr key={user.id}>
      <td>
        <span className="ico-wrapper">
          <Gravatar email={user.email} rating="g" default="mm" size={90} />
        </span>
      </td>
      <td>{user.fullName}</td>
      <td>{user.email}</td>
      <td>{user.isOrgAdmin ? t('Admin') : t('Normal')}</td>
      <td className="text-right">
        <OptionsDropdown items={this.getDropdownOptions(user)} />
      </td>
    </tr>
  );

  renderSkeleton() {
    return (
      <SkeletonTableBody>
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
        />
      </SkeletonTableBody>
    );
  }

  renderActionButtons = () => [
    <IconButton
      key="new"
      brand="orange"
      onClick={this.handleAdd}
      icon={<NewIcon />}
      onMouseDown={() => {}}
    >
      {t('Add user')}
    </IconButton>,
  ];

  renderPagination() {
    const { data } = this.props;
    let totalRows = 0;
    if (!graphqlError({ ...this.props }) && !(graphqlLoading({ ...this.props }) && !data.users)) {
      totalRows = data.users.length;
    }

    return <PaginationOptions totalRows={totalRows} />;
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="account_users">{this.renderActionButtons()}</ActionsMenu>
        <div className="users-table-wrapper">
          <Row>
            <Col>
              <div className="users-table">
                <Table className="data-table table">
                  {this.renderHead()}
                  {this.renderBody()}
                </Table>
                {!graphqlError({ ...this.props }) &&
                  !graphqlLoading({ ...this.props }) && (
                    <TableEmptyState
                      list={this.getRows()}
                      title={t('No Data')}
                      subTitle={t('There is currently no data in this table.')}
                    />
                  )}
              </div>
            </Col>
          </Row>
        </div>
        {this.renderPagination()}
      </DashboardTemplate>
    );
  }
}

const usersQuery = gql`
  query users_users {
    user {
      id
      isOrgAdmin
    }
    users {
      id
      fullName
      email
      isOrgAdmin
    }
  }
`;

const performEditUserQuery = gql`
  mutation users_editUser($updateUserInput: UpdateUserInput!) {
    updateUser(input: $updateUserInput) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  withTable(tableName, { sortField: 'fullName' }),
  offlineFilter(tableName),
  connect(
    null,
    { showModal },
  ),
  graphql(usersQuery, {
    options: {
      fetchPolicy: 'network-only',
    },
  }),
  graphql(performEditUserQuery, { name: 'updateUser' }),
)(Users);
