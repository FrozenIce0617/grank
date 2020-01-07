// @flow
import React, { Component } from 'react';
import { Table } from 'reactstrap';
import Moment from 'moment';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Toast from 'Components/Toast';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import SkeletonTableCell from 'Components/Skeleton/TableCell';

import LocaleSelector from 'Selectors/LocaleSelector';
import { t } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';

type Props = {
  pendingRequests: Object,
  removeAccessRequest: Function,
  fullLocale: string,
  renderState: number,
};

type State = {};

class PendingRequests extends Component<Props, State> {
  componentDidUpdate(prevProps) {
    if (prevProps.renderState !== this.props.renderState) {
      this.props.pendingRequests.refetch();
    }
  }

  onRemoveRequestClick = id => {
    const removeAccessRequestInput = {
      id,
    };
    this.props
      .removeAccessRequest({ variables: { removeAccessRequestInput } })
      .then(({ data: { removeMultiAccountRequest: { errors } } }) => {
        if (!errors.length) {
          Toast.success(t('Request removed'));
          this.props.pendingRequests.refetch();
        } else {
          Toast.error(t('Unable to remove access'));
        }
      });
  };

  getRequestRows() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return [];
    }
    const {
      pendingRequests: {
        user: {
          organization: { pendingMultiAccounts },
        },
      },
    } = this.props;
    return pendingMultiAccounts;
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

    const {
      pendingRequests: {
        user: {
          organization: { pendingMultiAccounts },
        },
      },
      fullLocale,
    } = this.props;
    return (
      <tbody>
        {this.getRequestRows().map(req => (
          <tr key={req.id}>
            <td>{req.toEmail}</td>
            <td className="hidden-sm-down">{req.isOrgAdmin ? t('Admin') : t('Normal')}</td>
            <td className="hidden-sm-down">
              {Moment(req.createdAt)
                .locale(fullLocale || 'en')
                .format('lll')}
            </td>
            <td>
              <a onClick={() => this.onRemoveRequestClick(req.id)}>{t('Delete request')}</a>
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  render() {
    return (
      <div className="pending-requests-table">
        <Table className="data-table">
          <thead>
            <tr>
              <th>{t('Sent to')}</th>
              <th className="hidden-sm-down">{t('User type')}</th>
              <th className="hidden-sm-down">{t('Created')}</th>
              <th />
            </tr>
          </thead>
          {this.renderBody()}
        </Table>
        {!underdash.graphqlError({ ...this.props }) &&
          !underdash.graphqlLoading({ ...this.props }) && (
            <TableEmptyState
              list={this.getRequestRows()}
              title={t('No Data')}
              subTitle={t('There is currently no data in this table.')}
            />
          )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
});

const pendingRequestsQuery = gql`
  query pendingRequests_pendingRequests {
    user {
      id
      organization {
        id
        pendingMultiAccounts {
          id
          toEmail
          isOrgAdmin
          createdAt
        }
      }
    }
  }
`;

const removeAccessRequestQuery = gql`
  mutation pendingRequests_removeAccessRequest(
    $removeAccessRequestInput: RemoveMultiAccountRequestInput!
  ) {
    removeMultiAccountRequest(input: $removeAccessRequestInput) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  connect(mapStateToProps),
  graphql(pendingRequestsQuery, {
    name: 'pendingRequests',
  }),
  graphql(removeAccessRequestQuery, { name: 'removeAccessRequest' }),
)(PendingRequests);
