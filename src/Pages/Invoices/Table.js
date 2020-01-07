// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';
import moment from 'moment';
import { FormattedNumber } from 'react-intl';

import Icon from 'Components/Icon';
import CheckIcon from 'icons/check.svg?inline';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import TableEmptyState from 'Components/TableEmptyState';
import LocaleSelector from 'Selectors/LocaleSelector';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';
import { t } from 'Utilities/i18n/index';
import StickyContainer from 'Components/Sticky/Container';
import Sticky from 'Components/Sticky';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import { withTable, withProps, offlineFilter } from 'Components/HOC';
import PaginationOptionsBase from 'Components/PaginationOptions';
import cn from 'classnames';

import './invoices.scss';

type Props = {
  invoices: Object,
  fullLocale: string,
  prepareData: Function,
};

const tableName = TableIDs.INVOICES;
const PaginationOptions = withProps({ tableName })(PaginationOptionsBase);

class InvoicesTable extends Component<Props> {
  getInvoiceRows() {
    if (graphqlError({ ...this.props }) || graphqlLoading({ ...this.props })) {
      return [];
    }
    const {
      invoices: {
        organization: { invoices },
      },
    } = this.props;
    return this.props.prepareData(invoices);
  }

  renderBody() {
    if (graphqlError({ ...this.props }) || graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }
    const { fullLocale } = this.props;
    return (
      <StickyContainer name={StickyIDs.containers.INVOICES} tag="tbody">
        {this.getInvoiceRows().map(invoice => (
          <tr key={invoice.url}>
            <td>
              {moment(invoice.createdAt)
                .locale(fullLocale)
                .format('ll')}
            </td>
            <td>
              <a href={invoice.url}>{invoice.number}</a>
            </td>
            <td>
              <FormattedNumber
                style="currency"
                value={invoice.amount}
                currency={invoice.currency}
                currencyDisplay="code"
              />
            </td>
            <td>
              <FormattedNumber
                style="currency"
                value={invoice.vat}
                currency={invoice.currency}
                currencyDisplay="code"
              />
            </td>
            <td>
              <FormattedNumber
                style="currency"
                value={invoice.total}
                currency={invoice.currency}
                currencyDisplay="code"
              />
            </td>
            <td>
              {invoice.paid && (
                <Icon className="invoice-paid-icon" tooltip={t('Paid')} icon={CheckIcon} />
              )}
            </td>
          </tr>
        ))}
      </StickyContainer>
    );
  }

  renderHead = () => (
    <Sticky
      containerName={StickyIDs.containers.INVOICES}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          <th>{t('Date')}</th>
          <th>{t('Invoice Number')}</th>
          <th>{t('Amount Excl. VAT')}</th>
          <th>{t('VAT')}</th>
          <th>{t('Total')}</th>
          <th>{t('Paid')}</th>
        </tr>
      )}
    </Sticky>
  );

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text', options: { width: '80%', marginBottom: '10px' } }]} />
      <Skeleton linesConfig={[{ type: 'text', options: { width: '55%', marginBottom: '10px' } }]} />
      <Skeleton linesConfig={[{ type: 'text', options: { width: '40%', marginBottom: '10px' } }]} />
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

  renderPagination() {
    const { invoices: data } = this.props;
    let totalRows = 0;
    if (
      !graphqlError({ ...this.props }) &&
      !(graphqlLoading({ ...this.props }) && (!data.organization || data.organization.invoices))
    ) {
      totalRows = data.organization.invoices.length;
    }
    return <PaginationOptions totalRows={totalRows} />;
  }

  render() {
    return (
      <div className="invoices-table-wrapper">
        <Table className="data-table table">
          {this.renderHead()}
          {this.renderBody()}
        </Table>
        {!graphqlError({ ...this.props }) &&
          !graphqlLoading({ ...this.props }) && (
            <TableEmptyState
              list={this.getInvoiceRows()}
              title={t('No Data')}
              subTitle={t('There is currently no data in this table.')}
            />
          )}
        {this.renderPagination()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
});

const invoicesQuery = gql`
  query invoicesTable_invoices($id: ID!) {
    organization(id: $id) {
      id
      name
      invoices {
        number
        createdAt
        paid
        currency
        vat
        amount
        total
        url
      }
    }
  }
`;

export default compose(
  withTable(tableName, { sortField: 'createdAt', descDefault: true, rowsDefault: 10 }),
  offlineFilter(tableName),
  connect(mapStateToProps),
  graphql(invoicesQuery, {
    name: 'invoices',
  }),
)(InvoicesTable);
