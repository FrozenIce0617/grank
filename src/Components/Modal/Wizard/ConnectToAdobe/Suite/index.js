// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import TableEmptyState from 'Components/TableEmptyState';
import Button from 'Components/Forms/Button';

import { t } from 'Utilities/i18n/index';
import { graphqlOK } from 'Utilities/underdash';

type Props = {
  adobeSuites: Object,
  connectionId: string,
  onSubmit: Function,
  onBack: Function,
};

class AdobeSuite extends Component<Props> {
  getRows = () => {
    const {
      connectionId,
      adobeSuites: {
        user: {
          organization: { adobeMarketingConnections },
        },
      },
    } = this.props;
    const currentConnection = adobeMarketingConnections.find(
      connection => connection.id === connectionId,
    );
    return (currentConnection && currentConnection.suiteIds) || [];
  };

  renderBody() {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }
    return (
      <tbody>
        {this.getRows().map(suite => (
          <tr key={suite.id}>
            <td>
              <a tabIndex={0} onClick={() => this.props.onSubmit({ suiteId: suite.id })}>
                {suite.label}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text', options: { width: '20%', marginBottom: '10px' } }]} />
    </SkeletonTableBody>
  );

  render() {
    const { onBack } = this.props;
    return (
      <div>
        <Table className="data-table">
          <thead>
            <tr>
              <th>{t('Suite')}</th>
            </tr>
          </thead>
          {this.renderBody()}
        </Table>
        {graphqlOK(this.props) && (
          <TableEmptyState
            list={this.getRows()}
            title={t('No Data')}
            subTitle={t('There are currently no suites.')}
          />
        )}
        <div className="confirmation-button-wrapper text-right mt-3">
          <Button theme="grey" onClick={onBack}>
            {t('Back')}
          </Button>
        </div>
      </div>
    );
  }
}

const adobeSuitesQuery = gql`
  query adobeSuite_adobeSuites {
    user {
      id
      organization {
        id
        adobeMarketingConnections {
          id
          suiteIds {
            id
            label
          }
        }
      }
    }
  }
`;

export default compose(
  graphql(adobeSuitesQuery, {
    name: 'adobeSuites',
    options: (props: Props) => ({
      fetchPolicy: 'network-only',
    }),
  }),
)(AdobeSuite);
