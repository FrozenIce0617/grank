// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId } from 'lodash';
import { withProps, offlineFilter } from 'Components/HOC';
import Button from 'Components/Forms/Button';
import PromiseMemorizer from 'Utilities/PromiseMemorizer';
import FormatNumber from 'Components/FormatNumber';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

type Props = {
  onPlanSelect: Function,

  // Automatic
  client: Object,
  filters: any,
  history: Object,
  prepareData: Function,
};

const tableName = TableIDs.SALES_PLAN_CHOICES;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const defaultRowHeight = 35;

const publicPlansQuery = gql`
  query salesPlanChoicesInfiniteTable_adminPublicPlans {
    adminPublicPlans {
      id
      name
      priceMonthly
      priceYearly
      currency
      isFree
      category
      isTrial
      maxKeywords
      maxDomains
      maxUsers
      maxCompetitors
      signonDiscount
      signonDiscountMonths
      featureApiAccess
      featureCompetitorMonitoring
      featureAnalyticsIntegration
      featureSearchVolume
      featureWhitelabel
      featureReporting
      featureKeywordRefresh
      featureAdvancedReporting
      featureCanPause
      featureSocial
      featureAdvancedMetrics
      isPublicPlan
      isDefaultTrial
      isCustomPlan
      comment
      dealStartDate
      dealEndDate
      showCountdown
      message
      validForNewOnly
    }
  }
`;

type State = {
  resetIndicator: number,
};

class SalesPlanChoicesInfiniteTable extends Component<Props, State> {
  _plansMemorizer = new PromiseMemorizer();

  state = {
    resetIndicator: 0,
  };

  getQuery = () =>
    this._plansMemorizer.wrap(() =>
      this.props.client.query({
        query: publicPlansQuery,
        fetchPolicy: 'network-only',
      }),
    );

  defaultColumns = [
    ColumnIDs.NAME,
    ColumnIDs.PRICE,
    ColumnIDs.KEYWORDS,
    ColumnIDs.COMPETITORS,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.NAME,
      name: t('Name'),
      required: true,
      responsive: true,
      width: 200,
      cellRenderer: (props: CellRendererParams) => props.rowData.name,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.PRICE,
      name: t('Price'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => (
        <span>
          <FormatNumber currency={props.rowData.currency}>
            {props.rowData.priceMonthly}
          </FormatNumber>m /{' '}
          <FormatNumber currency={props.rowData.currency}>{props.rowData.priceYearly}</FormatNumber>y
        </span>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS,
      name: t('Keywords'),
      width: 110,
      cellRenderer: (props: CellRendererParams) => props.rowData.maxKeywords,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.COMPETITORS,
      name: t('Competitors'),
      width: 110,
      cellRenderer: (props: CellRendererParams) => props.rowData.maxCompetitors,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.ACTIONS,
      name: t('Actions'),
      width: 120,
      cellRenderer: (props: CellRendererParams) => {
        return (
          <Button onClick={() => this.props.onPlanSelect(props.rowData)}>{t('Use plan')}</Button>
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          className="no-border"
          hideLabel
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'cell-center no-border',
    },
  ];

  resetTable = (keepMemorizer: boolean) => {
    !keepMemorizer && this._plansMemorizer.clear();
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({ adminPublicPlans }) => {
    const filteredPlans = Array.from(adminPublicPlans).sort((planA, planB) => {
      return planA.priceMonthly - planB.priceMonthly;
    });

    return {
      list: filteredPlans,
      numResults: filteredPlans.length,
    };
  };

  render() {
    const { resetIndicator } = this.state;
    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.SALES_PLAN_CHOICES}
        tableName={tableName}
        itemsName={t('base plans')}
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        resetIndicator={resetIndicator}
      />
    );
  }
}

export default compose(
  offlineFilter({
    tableName,
    withoutPagination: true,
  }),
)(withApollo(SalesPlanChoicesInfiniteTable, { withRef: true }));
