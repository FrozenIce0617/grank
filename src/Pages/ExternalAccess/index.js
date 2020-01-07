// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql, Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Row, Col, Table } from 'reactstrap';

import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import Skeleton from 'Components/Skeleton';
import PaginationOptionsBase from 'Components/PaginationOptions';
import SortableHeaderBase from 'Components/Table/SortableHeader';
import StickyContainerBase from 'Components/Sticky/Container';

import { showModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n/index';
import Toast from 'Components/Toast';
import TableEmptyState from 'Components/TableEmptyState';
import { subscribeToUser } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { withTable, withProps, offlineFilter } from 'Components/HOC';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import { ACCOUNT_OWNERS } from 'Pages/Layout/ActionsMenu';

import IconButton from 'Components/IconButton';
import NewIcon from 'icons/arrow-right.svg?inline';

import SkeletonTableBody from 'Components/Skeleton/TableBody';

import './users-table.scss';

type Props = {
  showModal: Function,
  updateUser: Function,
  prepareData: Function,
};

type State = {
  isSilentUpdate: boolean,
};

const tableName = TableIDs.EXTERNAL_ACCESS;
const SortableHeader = withProps({ tableName })(SortableHeaderBase);
const PaginationOptions = withProps({ tableName })(PaginationOptionsBase);
const StickyContainer = withProps({ name: tableName })(StickyContainerBase);

const OWNERS_QUERY = gql`
  {
    user {
      id
      organization {
        id
        multiAccountOwners {
          id
          fromOrganization {
            name
          }
          fromOrganizationPays
          isOrgAdmin
          isHidden
          canImpersonate
        }
        pendingMultiAccountOwners {
          id
          fromOrganization {
            name
          }
          fromOrganizationPays
          isOrgAdmin
        }
      }
    }
  }
`;

const REMOVE_ACCESS = gql`
  mutation($input: RemoveMultiAccountInput!) {
    removeMultiAccount(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const DENY_ACCESS = gql`
  mutation($input: RemoveMultiAccountRequestInput!) {
    removeMultiAccountRequest(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const ACCEPT_ACCESS = gql`
  mutation($input: AcceptMultiAccountRequestInput!) {
    acceptMultiAccountRequest(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

class ExternalAccess extends Component<Props, State> {
  _userSubHandle: SubscriptionHandle;

  toast = null;
  state = {
    isSilentUpdate: false,
  };

  componentDidMount() {
    // if (!this.props.multiAccountOwners.length) {
    //   this.props.history.push('/account');
    //   return;
    // }
    this._userSubHandle = subscribeToUser(this.handleUpdate);
  }

  componentWillUnmount() {
    this._userSubHandle.unsubscribe();
  }

  handleDelete = ({ name, onClick }: { name: string, onClick: Function }) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        cancelLabel: t('Cancel'),
        confirmLabel: t('Remove access'),
        lockDuration: 0,
        title: t('Remove organization access?'),
        description: t(
          'Once removing access, the organization %s can no longer access your account.',
          name,
        ),
        action: () => onClick(),
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
          <th width="40%" column="fullName">
            {t('Organization name')}
          </th>
          <th width="30%" column="email">
            {t('User type')}
          </th>
          <th width="30%" column="organization.name" />
        </tr>
      )}
    </Sticky>
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
      </SkeletonTableBody>
    );
  }

  renderToast = (toast: React.Node) => {
    this.toast = toast;
    setTimeout(() => (this.toast = null), 500);
  };

  renderRow = ({ el, pending = false }) => {
    if (!el) return null;
    return (
      <tr key={el.id}>
        <td>{el.fromOrganization.name}</td>
        <td>{el.isOrgAdmin ? t('Admin') : t('Normal')}</td>
        {pending ? (
          <td>
            <Mutation mutation={ACCEPT_ACCESS} refetchQueries={[{ query: OWNERS_QUERY }]}>
              {(acceptMultiAccountRequest, { data, error, loading }) => {
                if (error && !this.toast)
                  this.renderToast(Toast.error(t('Unable to accept organization')));
                if (data && !this.toast) this.renderToast(Toast.success(t('Organization added')));

                return (
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      acceptMultiAccountRequest({ variables: { input: { id: el.id } } });
                    }}
                  >
                    Accept
                  </a>
                );
              }}
            </Mutation>
            <span> / </span>
            <Mutation mutation={DENY_ACCESS} refetchQueries={[{ query: OWNERS_QUERY }]}>
              {(removeMultiAccountRequest, { data, error }) => {
                if (error && !this.toast)
                  this.renderToast(Toast.error(t('Unable to deny organization')));
                if (data && !this.toast) this.renderToast(Toast.success(t('Organization denied')));

                return (
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      removeMultiAccountRequest({ variables: { input: { id: el.id, isOwner: false } } }) // prettier-ignore
                    }}
                  >
                    deny
                  </a>
                );
              }}
            </Mutation>
          </td>
        ) : (
          <td>
            {!el.fromOrganizationPays && (
              <Mutation mutation={REMOVE_ACCESS} refetchQueries={[{ query: OWNERS_QUERY }]}>
                {(removeMultiAccount, { data, error, loading }) => {
                  if (error && !this.toast)
                    this.renderToast(Toast.error(t('Unable to remove organization')));
                  if (data && !this.toast)
                    this.renderToast(Toast.success(t('Organization removed')));

                  return (
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.handleDelete({
                          name: el.fromOrganization.name,
                          onClick: () =>
                            removeMultiAccount({
                              variables: { input: { id: el.id, isOwner: true } },
                            }),
                        });
                      }}
                    >
                      Remove access
                    </a>
                  );
                }}
              </Mutation>
            )}
          </td>
        )}
      </tr>
    );
  };

  renderPending = ({ loading, error, data }) => (
    <div className="users-table-wrapper" style={{ marginBottom: 30 }}>
      <div className="users-table-title">Pending requests</div>
      <Row>
        <Col>
          <div className="users-table">
            <React.Fragment>
              <Table className="data-table table">
                {this.renderHead()}
                {loading ? (
                  this.renderSkeleton()
                ) : data.length ? (
                  <StickyContainer tag="tbody">
                    {data.map(el => this.renderRow({ el, pending: true }))}
                  </StickyContainer>
                ) : null}
              </Table>
            </React.Fragment>
          </div>
        </Col>
      </Row>
    </div>
  );

  renderOwners = ({ loading, error, data }) => (
    <div className="users-table-wrapper">
      <div className="actions-menu actions-menu--secondary">
        <div className="tabs-container">
          <div className="actions">
            <IconButton
              key="new"
              brand="orange"
              icon={<NewIcon />}
              link="/accounts"
              onMouseDown={() => {}}
            >
              {t('Manage sub-accounts')}
            </IconButton>
          </div>
        </div>
      </div>

      <div className="users-table-title">Organizations</div>
      <Row>
        <Col>
          <div className="users-table">
            <React.Fragment>
              <Table className="data-table table">
                {this.renderHead()}
                {loading ? (
                  this.renderSkeleton()
                ) : error ? (
                  error.toString()
                ) : data.length ? (
                  <StickyContainer tag="tbody">
                    {data.map(el => this.renderRow({ el }))}
                  </StickyContainer>
                ) : null}
              </Table>

              {!data.length && (
                <TableEmptyState
                  list={[]}
                  title={t('No organizations')}
                  subTitle={t('There are no external organizations with access to your account.')}
                />
              )}
            </React.Fragment>
          </div>
        </Col>
      </Row>
    </div>
  );

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={ACCOUNT_OWNERS} />
        <Query query={OWNERS_QUERY}>
          {({ loading, error, data }) => {
            const owners = data && data.user ? data.user.organization.multiAccountOwners : [];
            const pending = data && data.user ? data.user.organization.pendingMultiAccountOwners : []; // prettier-ignore

            return (
              <React.Fragment>
                {pending.length && !error
                  ? this.renderPending({ loading, error, data: pending })
                  : null}
                {this.renderOwners({ loading, error, data: owners })}
              </React.Fragment>
            );
          }}
        </Query>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => ({
  multiAccountOwners: state.user.organization.multiAccountOwners,
});

export default compose(
  withTable(tableName, { sortField: 'fullName' }),
  offlineFilter(tableName),
  connect(
    mapStateToProps,
    { showModal },
  ),
)(ExternalAccess);
