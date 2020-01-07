// @flow
import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { showModal } from 'Actions/ModalAction';

import Toast from 'Components/Toast';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import SkeletonTableCell from 'Components/Skeleton/TableCell';

import { t, tct } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';

type Props = {
  availableAccounts: Object,
  removeAccess: Function,
  showModal: Function,
  renderState: number,
};

type State = {};

class SubAccountsTable extends Component<Props, State> {
  componentDidUpdate(prevProps) {
    if (prevProps.renderState !== this.props.renderState) {
      this.props.availableAccounts.refetch();
    }
  }

  getAccountRows() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return [];
    }
    const {
      availableAccounts: {
        user: {
          organization: { multiAccounts },
        },
      },
    } = this.props;
    return multiAccounts;
  }

  handleRemove = (id: string, fromOrganizationPays: boolean) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        cancelLabel: t('Cancel'),
        confirmLabel: fromOrganizationPays
          ? t('Remove access and cancel plan')
          : t('Remove access'),
        lockDuration: 0,
        title: t('Remove Access to Sub-account?'),
        description: fromOrganizationPays
          ? t(
              'This sub-account is paid by you. Removing access will cancel the sub-accounts subscription.',
            )
          : t('Access to the sub-account will be permanently removed.'),
        action: () => {
          this.props
            .removeAccess({ variables: { removeAccessInput: { id } } })
            .then(({ data: { removeMultiAccount: { errors } } }) => {
              if (!errors.length) {
                Toast.success(t('Access removed'));
                this.props.availableAccounts.refetch();
              } else {
                Toast.error(t('Unable to remove access'));
              }
            });
        },
      },
    });
  };

  handleLoginUserClick(id: string) {
    underdash.redirectToExternalUrl(`/org/multiaccount/change/${id}/`);
  }

  renderSkeleton() {
    return (
      <SkeletonTableBody>
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '80%', marginBottom: '10px' } }]}
        />
        <SkeletonTableCell
          className="hidden-sm-down"
          skeletonProps={{
            linesConfig: [{ type: 'text', options: { width: '55%', marginBottom: '10px' } }],
          }}
        />
        <SkeletonTableCell
          className="hidden-sm-down"
          skeletonProps={{
            linesConfig: [{ type: 'text', options: { width: '20%', marginBottom: '10px' } }],
          }}
        />
        <SkeletonTableCell
          className="hidden-sm-down"
          skeletonProps={{
            linesConfig: [{ type: 'text', options: { width: '40%', marginBottom: '10px' } }],
          }}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '70%', marginBottom: '10px' } }]}
        />
      </SkeletonTableBody>
    );
  }

  renderBody() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }
    return (
      <tbody>
        {this.getAccountRows().map(account => (
          <tr key={account.id}>
            <td>
              <span className="custom-link" onClick={() => this.handleLoginUserClick(account.id)}>
                {account.toOrganization.name}
              </span>
            </td>
            <td className="hidden-sm-down">{account.isOrgAdmin ? t('Admin') : t('Normal')}</td>
            <td className="hidden-sm-down">{account.fromOrganizationPays ? t('Yes') : t('No')}</td>
            <td className="hidden-sm-down">
              {account.toOrganization && account.toOrganization.activePlan
                ? account.toOrganization.activePlan.endDate
                : '-'}
            </td>
            <td className="hidden-sm-down">
              {account.fromOrganizationPays ? (
                tct('Find in [link:your invoice list]', {
                  link: <Link to={'/account/billing'} />,
                })
              ) : account.isOrgAdmin ? (
                <Link to={`/accounts/invoices/${account.toOrganization.id}`}>{t('Download')}</Link>
              ) : null}
            </td>
            <td>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  this.handleRemove(account.id, account.fromOrganizationPays);
                }}
              >
                {t('Remove access')}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  render() {
    return (
      <div className="sub-accounts-table">
        <Table className="data-table">
          <thead>
            <tr>
              <th>{t('Account Name')}</th>
              <th className="hidden-sm-down">{t('User Type')}</th>
              <th>{t('Paid by You')}</th>
              <th>{t('Next payment')}</th>
              <th>{t('Invoices')}</th>
              <th />
            </tr>
          </thead>
          {this.renderBody()}
        </Table>
        {!underdash.graphqlError({ ...this.props }) &&
          !underdash.graphqlLoading({ ...this.props }) && (
            <TableEmptyState
              list={this.getAccountRows()}
              title={t('No Data')}
              subTitle={t('There is currently no data in this table.')}
            />
          )}
      </div>
    );
  }
}

const availableAccountsQuery = gql`
  query subAccountsTable_availableAccounts {
    user {
      id
      organization {
        id
        multiAccounts {
          id
          isOrgAdmin
          fromOrganizationPays
          toOrganization {
            id
            name
            activePlan {
              endDate
            }
          }
        }
      }
    }
  }
`;

const removeAccessQuery = gql`
  mutation subAccountsTable_removeAccess($removeAccessInput: RemoveMultiAccountInput!) {
    removeMultiAccount(input: $removeAccessInput) {
      errors {
        field
        messages
      }
    }
  }
`;

const options: Object = { fetchPolicy: 'network-only' };

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(availableAccountsQuery, {
    name: 'availableAccounts',
    options,
  }),
  graphql(removeAccessQuery, { name: 'removeAccess' }),
)(SubAccountsTable);
