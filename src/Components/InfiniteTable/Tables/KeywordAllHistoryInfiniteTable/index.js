// @flow
import React, { Component } from 'react';
import moment from 'moment';
import { uniqueId, debounce, orderBy, transform } from 'lodash';
import { compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';

// hoc
import withProps from 'Components/HOC/withProps';

// components
import InfiniteTable from 'Components/InfiniteTable';

// selectors
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';

// types
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import type { SubscriptionHandle } from 'Utilities/websocket';

// constants
import { FilterAttribute } from 'Types/Filter';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';

// utils
import { t } from 'Utilities/i18n';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { subscribeToKeyword, subscribeToKeywords } from 'Utilities/websocket';

// new cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// old cells
import RankCell from 'Components/Table/TableRow/RankCell'; // fixed
import SERPOptions, { getIconData } from 'Components/Table/TableRow/SERPOptions'; // fixed
import ValueBar from 'Components/Table/TableRow/ValueBar'; // fixed
import SearchVolume from 'Components/Table/TableRow/SearchVolume'; // fixed
import FormatNumber from 'Components/FormatNumber';
import URLCell from 'Components/Table/TableRow/URLCell'; // fixed

type Props = {
  onUpdate: Function,
  hasAnalytics: boolean,
  keywordId: string,
  scrollElement: Object,

  // Automatic
  client: Object,
  filters: any,
  user: Object,
  domainId: string | null,
  isSuperuser: boolean,
};

const tableName = TableIDs.KEYWORDS_ALL_HISTORY;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);
const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const keywordsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 38;
const defaultHeaderHeight = 35;

const keywordsQuery = gql`
  query keywordAllHistoryInfiniteTable_keywordsRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $withPageSerpFeatures: Boolean!
    $withURL: Boolean!
    $withSearchVolume: Boolean!
    $withAnalyticsPotential: Boolean!
    $withAnalyticsVisitors: Boolean!
    $withSoV: Boolean!
    $keywordId: ID!
    $isSuperuser: Boolean!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keyword(id: $keywordId) {
        id
        keyword
        dateAdded
        starred
        domain {
          id
          domain
          displayName
          lastRefreshAt
          canRefresh
          shareOfVoicePercentage
        }
        ignoreInShareOfVoice
        ignoreLocalResults
        ignoreVideoResults
        ignoreFeaturedSnippet
        searchType
        latestSerpHistoryUrl
        history @include(if: $isSuperuser) {
          url
          date
        }
        searchVolume @include(if: $withSearchVolume) {
          id
          searchVolume
          avgCostPerClick
          competition
        }
        preferredLandingPage @include(if: $withURL) {
          id
          path
        }
        highestRankingPageStatus @include(if: $withURL)
        ranks(competitors: []) {
          id
          rank
          searchDate
          shareOfVoice @include(if: $withSoV)
          shareOfVoicePercentage @include(if: $withSoV)
          analyticsPotential @include(if: $withAnalyticsPotential)
          analyticsVisitors @include(if: $withAnalyticsVisitors)
          hasVideo
          hasReviews
          hasSitelinks
          hasExtraRanks
          isLocalResult
          isFeaturedSnippet
          extraRanks
          highestRankingPage @include(if: $withURL)
          titleDescription @include(if: $withURL) {
            title
            description
          }
          pageSerpFeatures @include(if: $withPageSerpFeatures) {
            id
            adsTop
            adsBottom
            shopping
            mapsLocalTeaser
            mapsLocal
            relatedQuestions
            carousel
            imagePack
            reviews
            tweets
            news
            siteLinks
            featureSnippet
            knowledgePanel
            knowledgeCards
            video
          }
        }
        tags
      }
    }
  }
`;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
  expandedRanks: Map<string, boolean>,
  togglingRanks: Map<string, boolean>,
};

class KeywordAllHistoryInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandlers: SubscriptionHandle[];
  _isMounted: boolean = false;

  static defaultProps = {
    scrollElement: window,
  };

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
    expandedRanks: new Map(),
    togglingRanks: new Map(),
  };

  constructor(props) {
    super(props);

    this.withTableInst = wrapped => (...args) =>
      wrapped(this._table && this._table.getWrappedInstance().getWrappedInstance(), ...args);

    this.optimisticUpdate = this.withTableInst(
      (inst, ...args) => inst && inst.optimisticUpdate(...args),
    );
    this.getList = this.withTableInst(inst => (inst ? inst.getList() : []));
    this.getNumResults = this.withTableInst(inst => (inst ? inst.getNumResults() : 0));
    this.showSettings = this.withTableInst(inst => inst && inst.showSettings());
    this.getCopy = this.withTableInst(inst => (inst ? inst.getCopy() : ''));
    this.insertItems = this.withTableInst((inst, ...args) => inst && inst.insertItems(...args));
    this.removeItems = this.withTableInst((inst, ...args) => inst && inst.removeItems(...args));
  }

  UNSAFE_componentWillMount() {
    const action = debounce(() => this.updateTable(), 1000);
    this._subHandlers = [subscribeToKeyword(action), subscribeToKeywords(action)];
  }

  componentDidMount() {
    this._isMounted = true;
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandlers.forEach(handle => handle.unsubscribe());
    this._isMounted = false;
  }

  handleReset = () => {
    this.setState({
      expandedRanks: new Map(),
      togglingRanks: new Map(),
    });
  };

  handleToggleExtraRanks = ({ items, rowIndex }) => {
    const { expandedRanks } = this.state;

    const descriptor = this.getExtraRankDescriptor();
    const nextRowIndex = rowIndex + 1;
    const rows = this.getList();
    const row = rows[nextRowIndex];

    descriptor.onToggleStart(rows[rowIndex].rankId);
    setTimeout(() => {
      if (!this._isMounted) {
        return;
      }

      if (!descriptor.isDescriptorRow(row)) {
        this.insertItems({
          rowId: rows[rowIndex].rankId,
          descriptor,
          idx: nextRowIndex,
          items: items.map((item, idx) => ({
            item,
            rankId: descriptor.getId(rows[rowIndex], item, idx),
          })),
        });
        this.setState({
          expandedRanks: expandedRanks.set(rows[rowIndex].rankId, true),
        });
      } else {
        this.removeItems({
          rowId: rows[rowIndex].rankId,
          descriptor,
          idx: nextRowIndex,
          amount: items.length,
        });

        expandedRanks.delete(rows[rowIndex].rankId);
        this.setState({ expandedRanks });
      }
    }, 0);
  };

  getQuery = ({ sortOrder, sortField, customColumns }) => {
    const { filters, keywordId, isSuperuser } = this.props;
    return keywordsPromiseBlocker.wrap(
      this.props.client.query({
        query: keywordsQuery,
        variables: {
          filters,
          pagination: {
            page: 1,
            startIndex: 0,
            stopIndex: 9999,
            results: 0,
          },
          ordering: {
            order: sortOrder.toUpperCase(),
            orderBy: sortField,
          },
          keywordId,
          isSuperuser,
          withPageSerpFeatures: customColumns.includes(ColumnIDs.SERP),
          withURL: customColumns.includes(ColumnIDs.URL),
          withSearchVolume: Boolean(
            customColumns.includes(ColumnIDs.CPC) |
              customColumns.includes(ColumnIDs.AD_COMPETITION) |
              customColumns.includes(ColumnIDs.SHARE_OF_VOICE_CPC),
          ),
          withAnalyticsVisitors: customColumns.includes(ColumnIDs.ANALYTICS_VISITORS),
          withAnalyticsPotential: customColumns.includes(ColumnIDs.ANALYTICS_POTENTION),
          withSoV: Boolean(
            customColumns.includes(ColumnIDs.SHARE_OF_VOICE) |
              customColumns.includes(ColumnIDs.SHARE_OF_VOICE_PERCENTAGE) |
              customColumns.includes(ColumnIDs.SHARE_OF_VOICE_CPC),
          ),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.SEARCH_DATE,
    ColumnIDs.RANK,
    ColumnIDs.URL,
    ColumnIDs.CPC,
    ColumnIDs.AD_COMPETITION,
    ColumnIDs.ANALYTICS_VISITORS,
    ColumnIDs.ANALYTICS_POTENTIAL,
    ColumnIDs.SHARE_OF_VOICE,
    ColumnIDs.SHARE_OF_VOICE_CPC,
    ColumnIDs.SERP,
  ];

  getColumns = () => {
    const featureIconsData = getIconData();
    return [
      {
        id: ColumnIDs.SEARCH_DATE,
        name: t('Search date'),
        width: 150,
        required: true,
        dataToCopy: rowData => moment(rowData.rank.searchDate).format('YYYY-MM-DD HH:mm'),
        cellRenderer: (props: CellRendererParams) => {
          return moment(props.rowData.rank.searchDate).format('YYYY-MM-DD HH:mm');
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
      {
        id: ColumnIDs.RANK,
        name: t('Rank'),
        width: 110,
        dataToCopy: rowData => rowData.rank.rank,
        cellRenderer: (props: CellRendererParams) => {
          const { rowData, rowIndex } = props;
          return (
            <RankCell
              keywordData={rowData}
              rank={rowData.rank.rank}
              rowId={rowData.rankId}
              isToggling={this.state.togglingRanks.get(rowData.rankId)}
              extraRanksOpened={this.state.expandedRanks.has(rowData.rankId)}
              onToggleExtraRanks={({ items }) => this.handleToggleExtraRanks({ items, rowIndex })}
            />
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
      {
        id: ColumnIDs.URL,
        name: t('URL'),
        width: 150,
        responsive: true,
        dataToCopy: rowData => rowData.rank.highestRankingPage,
        cellRenderer: (props: CellRendererParams) => (
          <URLCell keywordsData={props.rowData} maxWidth={210} />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            descDefault={true}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.CPC,
        name: t('CPC'),
        width: 100,
        dataToCopy: rowData => (rowData.searchVolume ? rowData.searchVolume.avgCostPerClick : 0),
        cellRenderer: (props: CellRendererParams) => {
          const { rowData } = props;
          return (
            <FormatNumber currency="USD">
              {rowData.searchVolume && rowData.searchVolume.avgCostPerClick}
            </FormatNumber>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('Average cost per click (AdWords)')}
          />
        ),
      },
      {
        id: ColumnIDs.AD_COMPETITION,
        name: t('Ad Comp'),
        width: 100,
        dataToCopy: rowData => rowData.searchVolume && rowData.searchVolume.competition / 10,
        cellRenderer: (props: CellRendererParams) => {
          const rowData = props.rowData;
          let adCompColor = 'success';
          if (rowData.searchVolume) {
            if (rowData.searchVolume.competition / 10 > 1 / 3) {
              adCompColor = 'warning';
            }
            if (rowData.searchVolume.competition / 10 > 2 / 3) {
              adCompColor = 'danger';
            }
          }
          return (
            <ValueBar
              value={rowData.searchVolume && rowData.searchVolume.competition / 10}
              color={adCompColor}
            />
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('AdWords competition for this keyword')}
          />
        ),
      },
      {
        id: ColumnIDs.ANALYTICS_VISITORS,
        name: t('Est. Visitors'),
        width: 120,
        requiresAnalytics: true,
        dataToCopy: rowData => rowData.rank.analyticsVisitors,
        cellRenderer: (props: CellRendererParams) => (
          <FormatNumber>{props.rowData.rank.analyticsVisitors}</FormatNumber>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('Estimated number of monthly visitors')}
          />
        ),
      },
      {
        id: ColumnIDs.ANALYTICS_POTENTION,
        name: t('Potential'),
        width: 90,
        requiresAnalytics: true,
        dataToCopy: rowData => rowData.rank.analyticsPotential,
        cellRenderer: (props: CellRendererParams) => (
          <ValueBar checkmarkOnComplete value={props.rowData.rank.analyticsPotential} />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('Traffic potential for this keyword')}
          />
        ),
      },
      {
        id: ColumnIDs.SHARE_OF_VOICE,
        name: t('SoV'),
        width: 100,
        requiresAdvancedMetrics: true,
        dataToCopy: rowData => rowData.rank.shareOfVoice,
        cellRenderer: (props: CellRendererParams) => {
          const { shareOfVoicePercentage: isPercentage } = props.rowData.domain;
          const { shareOfVoice, shareOfVoicePercentage } = props.rowData.rank;

          if (isPercentage ? shareOfVoicePercentage === -1 : shareOfVoice === -1) {
            return null;
          }

          return isPercentage ? (
            shareOfVoicePercentage && shareOfVoicePercentage !== 0 ? (
              <FormatNumber percentage precision={2}>
                {shareOfVoicePercentage}
              </FormatNumber>
            ) : (
              0
            )
          ) : (
            <FormatNumber>{shareOfVoice || 0}</FormatNumber>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('Share of Voice for this keyword')}
          />
        ),
      },
      {
        id: ColumnIDs.SHARE_OF_VOICE_CPC,
        name: t('SoV $'),
        width: 100,
        requiresAdvancedMetrics: true,
        dataToCopy: rowData =>
          (rowData.searchVolume &&
            rowData.searchVolume.avgCostPerClick * rowData.rank.shareOfVoice) ||
          '-',
        cellRenderer: (props: CellRendererParams) => {
          const { rowData } = props;
          return (
            <FormatNumber currency="USD">
              {(rowData.searchVolume &&
                rowData.searchVolume.avgCostPerClick * rowData.rank.shareOfVoice) ||
                0}
            </FormatNumber>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('Total value of your SoV (CPC * SoV)')}
          />
        ),
      },
      {
        id: ColumnIDs.SERP,
        name: t('SERP'),
        width: 150,
        dataToCopy: rowData =>
          transform(
            rowData.rank.pageSerpFeatures,
            (acc, feature, key) => {
              const data = feature ? featureIconsData[key] : null;
              if (data) {
                acc.push(data.label);
              }
              return acc;
            },
            [],
          ).join(', '),
        cellRenderer: (props: CellRendererParams) => {
          const { rowData } = props;
          return rowData.rank ? (
            <SERPOptions pageSerpFeatures={rowData.rank.pageSerpFeatures} />
          ) : null;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            tooltip={t('Features on the SERP')}
          />
        ),
      },
    ];
  };

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

  queryDataFormatter = (data: Object) => {
    const keywordsHistoryData = data.keywords && data.keywords.keyword;
    let ranks = keywordsHistoryData ? keywordsHistoryData.ranks : [];
    ranks = ranks.reduce((acc, rankData) => {
      acc.push(
        rankData || {
          rank: -1,
          shareOfVoice: -1,
          shareOfVoicePercentage: -1,
        },
      );
      return acc;
    }, []);

    const sortedRanks = orderBy(ranks, [item => new Date(item.searchDate)], ['desc']);
    return {
      list: sortedRanks.map(rankItem => ({
        ...keywordsHistoryData,
        rank: rankItem,
        rankId: rankItem.id,
      })),
      numResults: sortedRanks.length,
    };
  };

  getExtraRankDescriptor = () => ({
    name: 'extraRanks',
    getId: (rowData, item, idx) => `extraRanks-${rowData.rankId}-${idx}`,
    isDescriptorRow: rowData => (rowData ? ~rowData.rankId.indexOf('extraRanks') : false),
    onToggleStart: id => {
      this.setState({
        togglingRanks: this.state.togglingRanks.set(id, true),
      });
    },
    onToggleEnd: id => {
      this.setState({
        togglingRanks: this.state.togglingRanks.set(id, false),
      });
    },
    columns: {
      [ColumnIDs.RANK]: (props: CellRendererParams) => {
        return props.rowData.item[0];
      },
      [ColumnIDs.URL]: (props: CellRendererParams) => {
        const url = props.rowData.item[1];
        const el = document.createElement('a');
        el.href = url;
        return (
          <a href={url} target="_blank">
            {el.pathname}
          </a>
        );
      },
    },
  });

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { hasAnalytics, onUpdate, scrollElement } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.KEYWORDS_ALL_HISTORY}
        tableName={tableName}
        itemsName={t('rank history entries')}
        defaultSortField={ColumnIDs.SEARCH_DATE}
        ref={this.setTableRef}
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
        hasAnalytics={hasAnalytics}
        onUpdate={onUpdate}
        scrollElement={scrollElement}
        idField="rankId"
        expandableDescriptors={[this.getExtraRankDescriptor()]}
        onReset={this.handleReset}
      />
    );
  }
}

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);

  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: CompareDatesFiltersSelector(state),
    isSuperuser: state.user.impersonateOriginUser
      ? state.user.impersonateOriginUser.isSuperuser
      : state.user.isSuperuser,
  };
};

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    null,
    null,
    { withRef: true },
  ),
)(withApollo(KeywordAllHistoryInfiniteTable, { withRef: true }));
