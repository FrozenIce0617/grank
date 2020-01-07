/* eslint-disable quote-props */
// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import { identity, isEmpty } from 'lodash';

import ActionsMenu, { ACCOUNT_WALLET } from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import Skeleton from 'Components/Skeleton';
import PaginationOptionsBase from 'Components/PaginationOptions';
import StickyContainerBase from 'Components/Sticky/Container';

import { t } from 'Utilities/i18n/index';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';
import { withTable, withProps, offlineFilter } from 'Components/HOC';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import FormatNumber from 'Components/FormatNumber';

import SkeletonTableBody from 'Components/Skeleton/TableBody';

import './wallet.scss';

type Props = {
  data: Object,
  prepareData: Function,
};

const tableName = TableIDs.WALLET;
const PaginationOptions = withProps({ tableName })(PaginationOptionsBase);
const StickyContainer = withProps({ name: tableName })(StickyContainerBase);

const walletTypes = {
  A_1: 'Payment',
  A_2: 'Commission',
  A_3: 'Signup Bonus',
};

class Wallet extends Component<Props> {
  getRows(isAll?: boolean) {
    if (!this.isReady()) {
      return [];
    }
    const {
      data: { user },
    } = this.props;
    return user.organization && user.organization.affiliate
      ? (!isAll ? this.props.prepareData : identity)(user.organization.affiliate.wallet)
      : [];
  }

  isReady = () => !graphqlError({ ...this.props }) && !graphqlLoading({ ...this.props });

  renderHead = () => (
    <Sticky
      containerName={StickyIDs.containers.WALLET}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          <th>{t('Date')}</th>
          <th>{t('Description')}</th>
          <th>{t('Type')}</th>
          <th className="text-right">{t('Amount')}</th>
        </tr>
      )}
    </Sticky>
  );

  renderWalletOperationType = (walletType: String) => walletTypes[walletType] || 'Unknown';

  renderBody = () => {
    if (!this.isReady()) {
      return this.renderSkeleton();
    }

    let rows = this.getRows().map(this.renderRow);
    if (!isEmpty(rows)) {
      rows = rows.concat(
        <tr key="total" className="wallet-total-row">
          <td colSpan={3} className="wallet-total-label-cell">
            {t('Your available credit')}
          </td>
          <td className="wallet-total-amount-cell">
            <FormatNumber currency="USD">
              {this.getRows(true).reduce((acc, item) => acc + item.amount, 0)}
            </FormatNumber>
          </td>
        </tr>,
      );
    }

    return <StickyContainer tag="tbody">{rows}</StickyContainer>;
  };

  renderRow = wallet => (
    <tr key={wallet.id}>
      <td>{moment(wallet.createdAt).format('LLL')}</td>
      <td>{wallet.description}</td>
      <td>{this.renderWalletOperationType(wallet.walletType)}</td>
      <td className="text-right">
        <FormatNumber currency="USD">{wallet.amount}</FormatNumber>
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

  renderPagination() {
    const { data } = this.props;
    let totalRows = 0;
    if (
      !graphqlError({ ...this.props }) &&
      !(
        graphqlLoading({ ...this.props }) &&
        (!data.user || !data.user.organization || !data.user.organization.affiliate)
      )
    ) {
      totalRows = data.user.organization.affiliate.wallet.length;
    }

    return <PaginationOptions totalRows={totalRows} />;
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={ACCOUNT_WALLET} />
        <Container fluid className="wallet-table-wrapper content-container">
          <Row noGutters>
            <Col>
              <Table className="data-table">
                {this.renderHead()}
                {this.renderBody()}
              </Table>
              {this.isReady() && (
                <TableEmptyState
                  list={this.getRows()}
                  title={t('No Data')}
                  subTitle={t('There is currently no data in this table.')}
                />
              )}
            </Col>
          </Row>
        </Container>
        {this.renderPagination()}
      </DashboardTemplate>
    );
  }
}

const walletQuery = gql`
  query wallet_wallet {
    user {
      id
      organization {
        id
        affiliate {
          id
          wallet {
            id
            amount
            description
            walletType
            createdAt
          }
        }
      }
    }
  }
`;

export default compose(
  withTable(tableName, { sortField: 'createdAt' }),
  offlineFilter(tableName),
  graphql(walletQuery, {
    options: {
      fetchPolicy: 'network-only',
    },
  }),
)(Wallet);
