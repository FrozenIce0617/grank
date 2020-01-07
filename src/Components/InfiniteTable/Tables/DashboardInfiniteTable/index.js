// @flow
import React, { Component, Fragment } from 'react';
import cn from 'classnames';
import { compose, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, debounce, get } from 'lodash';
import { linkToKeywordsDomain } from 'Components/Filters/LinkToDomain';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import FormatNumber from 'Components/FormatNumber';
import { withProps } from 'Components/HOC';
import LinkToDomain from 'Components/Filters/LinkToDomain';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';
import './dashboard-infinite-table.scss';
import formatNumberHelper from 'Components/FormatNumber/formatNumberHelper';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// cells
import DomainDetailsCell from 'Components/Table/TableRow/DomainDetailsCell';
import ValueDelta from 'Components/Table/TableRow/ValueDelta';
import RankingDistributionCell from 'Components/Table/TableRow/RankingDistributionCell';
import KeywordsNumberCell from 'Components/Table/TableRow/KeywordsNumberCell';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  history: Object,
  filters: any,
  user: Object,
  showModal: Function,
};

const tableName = TableIDs.DOMAINS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const domainsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 66;
const noKeywordsRowHeight = 66; // 120;
const defaultHeaderHeight = 37;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

const domainsQuery = gql`
  query dashboardInfiniteTable_domains(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $withDomainDisplayName: Boolean!
    $withKeywords: Boolean!
    $withAvgRank: Boolean!
    $withShareOfVoice: Boolean!
    $withShareOfVoiceChange: Boolean!
    $withRankingDistribution: Boolean!
    $withNotifications: Boolean!
  ) {
    domains(filters: $filters, pagination: $pagination, ordering: $ordering) {
      domains {
        id
        displayName @include(if: $withDomainDisplayName)
        domain
        faviconUrl
        totalKeywords @include(if: $withKeywords)
        totalMobileKeywords
        totalDesktopKeywords
        shareOfVoicePercentage
        canUpdate
        dashboard {
          searchType
          shareOfVoice {
            searchType
            shareOfVoice @include(if: $withShareOfVoice)
            shareOfVoiceChange @include(if: $withShareOfVoiceChange)
            shareOfVoiceChangePercentage @include(if: $withShareOfVoiceChange)
            shareOfVoicePercentage @include(if: $withShareOfVoice)
            shareOfVoicePercentageChange @include(if: $withShareOfVoiceChange)
          }
          avgRank @include(if: $withAvgRank) {
            avgRank
            avgRankChange
            avgRankChangePercentage
          }
          rankingDistribution @include(if: $withRankingDistribution) {
            searchType
            keywordsTotal
            keywords0To3
            keywords4To10
            keywords11To20
            keywords21To50
            keywordsAbove50
            keywordsUnranked
          }
        }
        notifications @include(if: $withNotifications)
      }
      pagination {
        page
        results
        numResults
        numPages
      }
    }
  }
`;

class DashboardInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandler: SubscriptionHandle;

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillMount() {
    this._subHandler = subscribeToDomain(debounce(() => this.updateTable(), 1000));
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();
  }

  handleAddKeywordAction = domainId => {
    this.props.history.push(linkToKeywordsDomain(domainId), { modalHide: false });
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId,
        refresh: this.resetTable,
      },
    });
  };

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters } = this.props;
    return domainsPromiseBlocker.wrap(
      this.props.client.query({
        query: domainsQuery,
        variables: {
          filters,
          pagination: {
            page: 1,
            startIndex,
            stopIndex,
            results: 0,
          },
          ordering: {
            order: sortOrder.toUpperCase(),
            orderBy: sortField,
          },
          withDomainDisplayName: customColumns.includes(ColumnIDs.DOMAIN_DISPLAY_NAME),
          withKeywords: customColumns.includes(ColumnIDs.KEYWORDS),
          withAvgRank: customColumns.includes(ColumnIDs.AVG_RANK),
          withShareOfVoice: customColumns.includes(ColumnIDs.SHARE_OF_VOICE),
          withShareOfVoiceChange: customColumns.includes(ColumnIDs.SHARE_OF_VOICE),
          withShareOfVoiceChangePercentage: customColumns.includes(ColumnIDs.SHARE_OF_VOICE),
          withRankingDistribution: customColumns.includes(ColumnIDs.RANKING_DISTRIBUTION),
          withNotifications: customColumns.includes(ColumnIDs.NOTIFICATIONS),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.DOMAIN_DISPLAY_NAME,
    ColumnIDs.KEYWORDS,
    ColumnIDs.AVG_RANK,
    ColumnIDs.AVG_RANK_CHANGE,
    ColumnIDs.SHARE_OF_VOICE,
    ColumnIDs.SHARE_OF_VOICE_CHANGE,
    ColumnIDs.RANKING_DISTRIBUTION,
    ColumnIDs.NOTIFICATIONS,
  ];

  // Get data array by key for total
  getDataByKey = (domainItem, key) => {
    const { dashboard } = domainItem;
    return dashboard.filter(item => item.searchType == null).map(item => get(item, key))[0];
  };

  getColumns = () => [
    {
      id: ColumnIDs.DOMAIN_DISPLAY_NAME,
      name: t('Domain Name'),
      required: true,
      responsive: true,
      width: 300,
      cellRenderer: (props: CellRendererParams) => (
        <DomainDetailsCell domainData={props.rowData} reset={true} />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          sortField={ColumnIDs.DOMAIN_DISPLAY_NAME}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS,
      name: t('Number of Keywords'),
      width: 180,
      cellRenderer: (props: CellRendererParams) => (
        <div className="dashboard-kpi">
          <KeywordsNumberCell
            domainData={props.rowData}
            onAddKeyword={this.handleAddKeywordAction}
          />
        </div>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'main-value-keywords',
    },
    {
      id: ColumnIDs.AVG_RANK,
      name: t('Average Rank'),
      width: 260,
      cellRenderer: (props: CellRendererParams) => {
        const { totalKeywords } = props.rowData;
        if (totalKeywords <= 0) {
          return null;
        }

        const avgRank = this.getDataByKey(props.rowData, 'avgRank.avgRank');
        const avgRankChangePercentage = this.getDataByKey(
          props.rowData,
          'avgRank.avgRankChangePercentage',
        );
        const avgRankChange = this.getDataByKey(props.rowData, 'avgRank.avgRankChange');

        const avgRankChangeFormatted = formatNumberHelper({ value: avgRankChange, precision: 1 });
        const avgRankChangePercentageFormatted = parseInt(
          (avgRankChangePercentage * 100).toFixed(0),
          10,
        );
        return (
          <div className="dashboard-kpi-section">
            <div className="dashboard-kpi">
              {props.rowData.totalKeywords !== 0 ? (avgRank ? avgRank.toFixed(1) : 0) : ''}
            </div>

            {avgRankChangeFormatted !== 0 ? (
              <div className="dashboard-evolution">
                <ValueDelta reverseColor isRank currentValue={avgRank} delta={avgRankChange} />
                {avgRankChangePercentageFormatted !== 0 && (
                  <div
                    className={cn('Kpi-evolution small', {
                      red: avgRankChangePercentage > 0,
                      green: avgRankChangePercentage < 0,
                    })}
                    style={{ marginLeft: 10 }}
                  >
                    {`${
                      avgRankChangePercentage > 0 ? '+' : ''
                    }${avgRankChangePercentageFormatted}%`}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
          </div>
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          className="no-border"
          sortField={ColumnIDs.AVG_RANK}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'main-value',
    },
    {
      id: ColumnIDs.SHARE_OF_VOICE,
      name: t('Share of Voice'),
      width: 280,
      cellRenderer: (props: CellRendererParams) => {
        const { totalKeywords } = props.rowData;
        if (totalKeywords <= 0) {
          return null;
        }

        const sovChangePercentage = this.getDataByKey(
          props.rowData,
          props.rowData.shareOfVoicePercentage
            ? 'shareOfVoice.shareOfVoicePercentageChange'
            : 'shareOfVoice.shareOfVoiceChangePercentage',
        );
        const sovChange = this.getDataByKey(props.rowData, 'shareOfVoice.shareOfVoiceChange');

        const isPercentage = props.rowData.shareOfVoicePercentage;

        const sovChangeFormatted = formatNumberHelper({ value: sovChange, precision: 1 });
        const sovChangePercentageFormatted = parseInt((sovChangePercentage * 100).toFixed(0), 10);

        const shareOfVoice = this.getDataByKey(
          props.rowData,
          isPercentage ? 'shareOfVoice.shareOfVoicePercentage' : 'shareOfVoice.shareOfVoice',
        );

        return (
          <div className="dashboard-kpi-section">
            <div className="dashboard-kpi">
              <FormatNumber percentage={isPercentage} precision={2}>
                {shareOfVoice}
              </FormatNumber>
            </div>

            {sovChangeFormatted !== 0 && (
              <div className="dashboard-evolution">
                {!isPercentage ? (
                  <Fragment>
                    <ValueDelta currentValue={shareOfVoice} delta={sovChange} precision={1} />
                    {sovChangePercentageFormatted !== 0 && (
                      <div
                        className={cn('Kpi-evolution small', {
                          red: sovChangePercentage < 0,
                          green: sovChangePercentage > 0,
                        })}
                        style={{ marginLeft: 10 }}
                      >
                        {`${sovChangePercentage > 0 ? '+' : ''}${sovChangePercentageFormatted}%`}
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <ValueDelta
                    percentage
                    precision={0}
                    currentValue={shareOfVoice}
                    delta={sovChangePercentage}
                  />
                )}
              </div>
            )}
          </div>
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          className="no-border"
          descDefault
          sortField={ColumnIDs.SHARE_OF_VOICE}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'main-value',
    },
    {
      id: ColumnIDs.RANKING_DISTRIBUTION,
      name: t('Ranking Distribution'),
      width: 400,
      cellRenderer: (props: CellRendererParams) => {
        const { totalKeywords } = props.rowData;
        if (totalKeywords <= 0) {
          return null;
        }
        const { id } = props.rowData;
        return (
          <RankingDistributionCell
            rankingDistributionData={this.getDataByKey(props.rowData, 'rankingDistribution')}
            domainId={id}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.NOTIFICATIONS,
      name: t('Notifications'),
      width: 120,
      cellRenderer: (props: CellRendererParams) => {
        const { totalKeywords } = props.rowData;
        if (totalKeywords <= 0) {
          return null;
        }

        return (
          <LinkToDomain
            scrollTo={'notifications'}
            domainId={props.rowData.id}
            scr
            className="title dashboard-kpi"
          >
            <FormatNumber>{props.rowData.notifications}</FormatNumber>
          </LinkToDomain>
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
      className: 'main-value',
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

  rowHeightFunc = item => (item.totalKeywords ? defaultRowHeight : noKeywordsRowHeight);

  queryDataFormatter = ({
    domains: {
      domains,
      pagination: { numResults },
    },
  }) => ({
    list: domains,
    numResults,
  });

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        className="dashboard-infinite-table"
        stickyId={StickyIDs.containers.DASHBOARD}
        tableName={tableName}
        itemsName={t('domains')}
        defaultSortField={ColumnIDs.DOMAIN_DISPLAY_NAME}
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
        batchSize={25}
        onUpdate={onUpdate}
      />
    );
  }
}

const mapStateToProps = state => ({
  filters: CompareDatesFiltersSelector(state),
});

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  withRouter,
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
)(withApollo(DashboardInfiniteTable, { withRef: true }));
