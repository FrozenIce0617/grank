// @flow
import React, { Component } from 'react';
import moment from 'moment';
import { uniqueId, debounce } from 'lodash';
import { compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';

// mutations
import { mutationStarKeywords } from 'Pages/Keywords/Table/mutations';

// components
import InfiniteTable from 'Components/InfiniteTable';
import Toast from 'Components/Toast';

// actions
import { saveKeywordsTableState, resetKeywordsTableState } from 'Actions/KeywordsTableActions';

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
import HeaderCell from 'Components/InfiniteTable/Cells/HeaderCell';

// old cells
import Checkbox from 'Components/Controls/Checkbox'; // fixed
import DomainCell from 'Components/Table/TableRow/DomainCell'; // fixed
import KeywordCell from 'Components/Table/TableRow/KeywordCell'; // fixed
import LocationCell from 'Components/Table/TableRow/LocationCell'; // fixed
import RankCell from 'Components/Table/TableRow/RankCell'; // fixed
import RankOptions from 'Components/Table/TableRow/RankOptions'; // fixed
import URLStatus from 'Components/Table/TableRow/URLStatus'; // fixed
import URLCell from 'Components/Table/TableRow/URLCell'; // fixed
import SERPOptions from 'Components/Table/TableRow/SERPOptions'; // fixed
import ValueDelta from 'Components/Table/TableRow/ValueDelta'; // fixed
import ValueBar from 'Components/Table/TableRow/ValueBar'; // fixed
import SearchVolume from 'Components/Table/TableRow/SearchVolume'; // fixed
import FormatNumber from 'Components/FormatNumber'; // fixed
import KeywordActionsCell from 'Components/Table/TableRow/KeywordActionsCell';

type Props = {
  selected: Set<string>,
  handleSelect: Function,
  starKeywords: Function,
  hasAnalytics: boolean,
  handleSelectAll: Function,
  isAllSelected: boolean,
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
  user: Object,
  domainId: string | null,
};

const tableName = TableIDs.KEYWORDS;
const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const keywordsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 39;
const defaultHeaderHeight = 77;

/*
DO NOT CHANGE THIS WITHOUT TALKING TO BACKEND!!!
*/
const keywordsQuery = gql`
  query keywordsInfiniteTable_keywords(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $withPageSerpFeatures: Boolean!
    $withURL: Boolean!
    $withRank: Boolean!
    $withLocation: Boolean!
    $withSearchVolume: Boolean!
    $withAnalyticsPotential: Boolean!
    $withAnalyticsVisitors: Boolean!
    $withSoV: Boolean!
    $withDateAdded: Boolean!
    $withTimeAgo: Boolean!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        dateAdded @include(if: $withDateAdded)
        keyword
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
        enableAutocorrect
        searchType
        latestSerpHistoryUrl
        searchEngine {
          id
          name
          icon
        }
        searchVolume @include(if: $withSearchVolume) {
          id
          searchVolume
          avgCostPerClick
          competition
        }
        location @include(if: $withLocation)
        countrylocale @include(if: $withLocation) {
          id
          countryCode
          region
          locale
        }
        preferredLandingPage @include(if: $withURL) {
          id
          path
        }
        highestRankingPageStatus @include(if: $withURL)
        rank {
          id
          rank @include(if: $withRank)
          changes {
            rank @include(if: $withRank)
            rankChange @include(if: $withRank)
            shareOfVoice @include(if: $withSoV)
            shareOfVoiceChange @include(if: $withSoV)
            shareOfVoicePercentageChange @include(if: $withSoV)
          }
          searchDate @include(if: $withTimeAgo)
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
      pagination {
        page
        results
        numResults
        numPages
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

class KeywordsInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandlers: SubscriptionHandle[];
  _isMounted: boolean = false;

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

    this.handleKeywordClick = this.withTableInst(inst => {
      this.props.saveKeywordsTableState({
        tableState: inst.state,
        scrollState: inst.getScrollPosition(),
      });
    });

    this.optimisticUpdate = this.withTableInst(
      (inst, ...args) => inst && inst.optimisticUpdate(...args),
    );
    this.getList = this.withTableInst(inst => (inst ? inst.getList() : []));
    this.getNumResults = this.withTableInst(inst => (inst ? inst.getNumResults() : 0));
    this.resizeTable = this.withTableInst(inst => inst && inst.resizeAll());
    this.showSettings = this.withTableInst(inst => inst && inst.showSettings());
    this.insertItems = this.withTableInst((inst, ...args) => inst && inst.insertItems(...args));
    this.removeItems = this.withTableInst((inst, ...args) => inst && inst.removeItems(...args));
  }

  UNSAFE_componentWillMount() {
    const action = debounce(() => this.updateTable(), 1000);
    this._subHandlers = [subscribeToKeyword(action), subscribeToKeywords(action)];
  }

  componentDidMount() {
    const { tableState, scrollState } = this.props;
    this._isMounted = true;

    this.withTableInst(inst =>
      inst.setState(tableState, () => {
        if (scrollState) {
          window.scrollTo({
            top: scrollState.scrollTop,
          });
        }
      }),
    )();
    if (tableState) {
      this.props.resetKeywordsTableState();
    }
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

  handleStar = ({ currentTarget: { name: id, checked } }) => {
    const onRealUpdate = this.optimisticUpdate({ ids: [id], item: { starred: checked } });
    this.props
      .starKeywords({
        input: {
          keywords: [id],
          starred: checked,
          delete: false,
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Could not star keyword'));
      });
  };

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

    descriptor.onToggleStart(rows[rowIndex].id);
    setTimeout(() => {
      if (!this._isMounted) {
        return;
      }

      if (!descriptor.isDescriptorRow(row)) {
        this.insertItems({
          rowId: rows[rowIndex].id,
          descriptor,
          idx: nextRowIndex,
          items: items.map((item, idx) => ({
            item,
            id: descriptor.getId(rows[rowIndex], item, idx),
          })),
        });
        this.setState({
          expandedRanks: expandedRanks.set(rows[rowIndex].id, true),
        });
      } else {
        this.removeItems({
          rowId: rows[rowIndex].id,
          descriptor,
          idx: nextRowIndex,
          amount: items.length,
        });

        expandedRanks.delete(rows[rowIndex].id);
        this.setState({ expandedRanks });
      }
    }, 0);
  };

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters } = this.props;
    return keywordsPromiseBlocker.wrap(
      this.props.client.query({
        query: keywordsQuery,
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
          withPageSerpFeatures: customColumns.includes(ColumnIDs.SERP),
          withURL: customColumns.includes(ColumnIDs.URL),
          withRank: customColumns.includes(ColumnIDs.RANK),
          withLocation: customColumns.includes(ColumnIDs.LOCATION),
          withSearchVolume: Boolean(
            customColumns.includes(ColumnIDs.SEARCH_VOLUME) |
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
          withDateAdded: customColumns.includes(ColumnIDs.DATE_ADDED),
          withTimeAgo: customColumns.includes(ColumnIDs.KEYWORD_TIME_AGO),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.CHECKBOX,
    ColumnIDs.CHECKBOX_STARRED,
    ColumnIDs.KEYWORD,
    ColumnIDs.SEARCH_ENGINE,
    ColumnIDs.LOCATION,
    ColumnIDs.RANK,
    ColumnIDs.RANK_CHANGE,
    ColumnIDs.SHARE_OF_VOICE,
    ColumnIDs.SHARE_OF_VOICE_CHANGE,
    ColumnIDs.URL,
    ColumnIDs.URL_STATUS,
    ColumnIDs.SEARCH_VOLUME,
    ColumnIDs.SERP,
    ColumnIDs.DATE_ADDED,
    ColumnIDs.KEYWORD_TIME_AGO,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.CHECKBOX,
      name: t('Checkbox'),
      required: true,
      fixedLeft: true,
      width: 35,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        const isSelected = this.props.selected.has(rowData.id.toString());
        return (
          <Checkbox
            checked={this.props.isAllSelected ? !isSelected : isSelected}
            onChange={this.props.handleSelect}
            name={rowData.id}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          tableName={tableName}
          label={props.label}
          hideLabel
          className="no-border"
          onSelectAllChange={this.props.handleSelectAll}
          isSelected={this.props.isAllSelected}
          scrollXContainer={props.scrollXContainer}
          fixed
          fixedOffset={props.fixedOffset}
        />
      ),
      className: 'cell-center no-border',
    },
    {
      id: ColumnIDs.CHECKBOX_STARRED,
      parentId: ColumnIDs.CHECKBOX,
      name: t('Star'),
      fixedLeft: true,
      width: 42,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return (
          <Checkbox
            checked={rowData.starred}
            onChange={this.handleStar}
            name={rowData.id}
            kind="star"
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.STARRED]}
          sortField="starred"
          descDefault
          tableName={tableName}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          fixed
          hideLabel
          fixedOffset={props.fixedOffset}
        />
      ),
      className: 'cell-center',
    },
    {
      id: ColumnIDs.DOMAIN,
      name: t('Domain'),
      width: 300,
      fixedLeft: true,
      required: this.props.domainId === null,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return <DomainCell keywordData={rowData} />;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="domain"
          tableName={tableName}
          label={props.label}
          fixed
          fixedOffset={props.fixedOffset}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORD,
      name: t('Keyword'),
      width: 300,
      responsive: true,
      fixedLeft: true,
      hasDynamicHeight: true,
      required: true,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return (
          <KeywordCell
            showTags
            showOptions
            shouldOpenKeywordInfo
            onKeywordClick={this.handleKeywordClick}
            domainId={rowData.domain.id}
            keywordData={rowData}
            onTagDelete={this.resizeTable}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.KEYWORD, FilterAttribute.TAGS]}
          sortField="keyword"
          tableName={tableName}
          label={props.label}
          fixed
          fixedOffset={props.fixedOffset}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.SEARCH_ENGINE,
      parentId: ColumnIDs.KEYWORD,
      name: t('Search Engine'),
      width: 70,
      fixedLeft: true,
      cellRenderer: (props: CellRendererParams) => <RankOptions keywordData={props.rowData} />,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.SEARCH_TYPE, FilterAttribute.SEARCH_ENGINE]}
          sortField="search_type"
          tableName={tableName}
          label={props.label}
          fixed
          fixedOffset={props.fixedOffset}
          hideLabel
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'cell-center',
    },
    {
      id: ColumnIDs.LOCATION,
      name: t('Location'),
      width: 160,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        if (rowData.countrylocale) {
          const {
            countrylocale: { countryCode, region, locale },
            location,
          } = rowData;
          return (
            <LocationCell
              countryCode={countryCode}
              region={region}
              locale={locale}
              location={location}
            />
          );
        }
        return null;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.COUNTRY_LOCALE, FilterAttribute.LOCATION]}
          sortField="location"
          tableName={tableName}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.RANK,
      name: t('Rank'), //
      width: 110,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData, rowIndex } = props;
        return (
          <RankCell
            keywordData={rowData}
            rank={rowData.rank.rank}
            isToggling={this.state.togglingRanks.get(rowData.id)}
            extraRanksOpened={this.state.expandedRanks.has(rowData.id)}
            onToggleExtraRanks={({ items }) => this.handleToggleExtraRanks({ items, rowIndex })}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.RANK, FilterAttribute.SERP_FEATURES]}
          sortField="rank"
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.RANK_CHANGE,
      parentId: ColumnIDs.RANK,
      name: t('+/-'),
      width: 62,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return (
          <ValueDelta
            isRank={true}
            currentValue={rowData.rank.rank}
            delta={rowData.rank.changes.rankChange}
            showNumber={
              rowData.rank.changes.rankChange !== 9999 && rowData.rank.changes.rankChange !== -9999
            }
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.RANK_CHANGE]}
          sortField="rank_change"
          descDefault
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Change in rank between the two compared dates')}
        />
      ),
    },
    {
      id: ColumnIDs.URL,
      name: t('URL'),
      width: 250,
      responsive: false,
      cellRenderer: (props: CellRendererParams) => (
        <URLCell keywordsData={props.rowData} maxWidth={210} />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.HIGHEST_RANKING_PAGE]}
          sortField="highest_ranking_page"
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.URL_STATUS,
      parentId: ColumnIDs.URL,
      name: t('URL Status'),
      width: 41,
      cellRenderer: (props: CellRendererParams) => (
        <URLStatus
          keyword={props.rowData}
          refresh={this.resetTable}
          optimisticUpdate={this.optimisticUpdate}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.HIGHEST_RANKING_PAGE_MATCH]}
          tableName={tableName}
          label={props.label}
          hideLabel
          className="filter-right"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Does the highest ranking page match the one you prefer')}
        />
      ),
      className: 'cell-center',
    },
    {
      id: ColumnIDs.SEARCH_VOLUME,
      name: t('Searches'),
      width: 89,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return (
          <SearchVolume
            keywordData={rowData}
            searchVolume={rowData.searchVolume && rowData.searchVolume.searchVolume}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.SEARCH_VOLUME]}
          sortField="search_volume"
          tableName={tableName}
          descDefault={true}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Average monthly search volume')}
        />
      ),
    },
    {
      id: ColumnIDs.CPC,
      name: t('CPC'),
      width: 100,
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
          sortField="cpc"
          tableName={tableName}
          descDefault={true}
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
          sortField="competition"
          tableName={tableName}
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
      cellRenderer: (props: CellRendererParams) => (
        <FormatNumber>{props.rowData.rank.analyticsVisitors}</FormatNumber>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.VISITORS]}
          sortField="analytics_visitors"
          tableName={tableName}
          label={props.label}
          descDefault={true}
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
      cellRenderer: (props: CellRendererParams) => (
        <ValueBar checkmarkOnComplete value={props.rowData.rank.analyticsPotential} />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="analytics_potential"
          tableName={tableName}
          descDefault={true}
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
      cellRenderer: (props: CellRendererParams) => {
        const { shareOfVoicePercentage: isPercentage } = props.rowData.domain;
        const { shareOfVoice, shareOfVoicePercentage, rank } = props.rowData.rank;

        if (rank === -1) {
          return null;
        }

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
          filterAttributes={[FilterAttribute.SHARE_OF_VOICE]}
          sortField="share_of_voice"
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Share of Voice for this keyword')}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.SHARE_OF_VOICE_CHANGE,
      parentId: ColumnIDs.SHARE_OF_VOICE,
      name: t('+/-'),
      width: 100,
      requiresAdvancedMetrics: true,
      cellRenderer: (props: CellRendererParams) =>
        props.rowData.domain.shareOfVoicePercentage ? (
          <ValueDelta
            percentage
            precision={2}
            currentValue={props.rowData.rank.shareOfVoicePercentage}
            delta={props.rowData.rank.changes.shareOfVoicePercentageChange}
          />
        ) : (
          <ValueDelta
            currentValue={props.rowData.rank.shareOfVoice}
            delta={props.rowData.rank.changes.shareOfVoiceChange}
          />
        ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.SHARE_OF_VOICE_CHANGE]}
          sortField="share_of_voice_change"
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Change in SoV between the two compared dates')}
        />
      ),
    },
    {
      id: ColumnIDs.SHARE_OF_VOICE_CPC,
      name: t('SoV $'),
      width: 100,
      requiresAdvancedMetrics: true,
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
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Total value of your SoV (CPC * SoV)')}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.SHARE_OF_VOICE_CPC_CHANGE,
      parentId: ColumnIDs.SHARE_OF_VOICE_CPC,
      name: t('+/-'),
      width: 100,
      requiresAdvancedMetrics: true,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        let historic = 0;
        let now = 0;

        if (rowData.searchVolume) {
          historic =
            rowData.searchVolume.avgCostPerClick *
            (rowData.rank.shareOfVoice - rowData.rank.changes.shareOfVoiceChange);
          now = rowData.searchVolume.avgCostPerClick * rowData.rank.shareOfVoice;
        }

        return <ValueDelta currentValue={now} delta={now - historic} currency="USD" />;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Change in SoV $ between the two compared dates')}
        />
      ),
    },
    {
      id: ColumnIDs.SERP,
      name: t('SERP'),
      width: 150,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return rowData.rank ? (
          <SERPOptions pageSerpFeatures={rowData.rank.pageSerpFeatures} />
        ) : null;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.PAGE_SERP_FEATURES]}
          sortField="page_serp_features"
          tableName={tableName}
          descDefault={true}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Features on the SERP')}
        />
      ),
    },
    {
      id: ColumnIDs.DATE_ADDED,
      name: t('Created On'),
      width: 120,
      cellRenderer: (props: CellRendererParams) => props.rowData.dateAdded,
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.DATE_ADDED]}
          sortField="date_added"
          tableName={tableName}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Date when the keyword was added')}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORD_TIME_AGO,
      name: t('Age'),
      width: 120,
      cellRenderer: (props: CellRendererParams) => {
        if (props.rowData.rank && props.rowData.rank.searchDate) {
          return moment(new Date(props.rowData.rank.searchDate)).fromNow();
        }

        return null;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="search_date"
          tableName={tableName}
          descDefault={true}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          tooltip={t(
            'Time since the keyword was updated. You can change the period using the Compare To date selected',
          )}
        />
      ),
    },
    {
      id: ColumnIDs.ACTIONS,
      name: t('Actions'),
      width: 70,
      cellRenderer: (props: CellRendererParams) => (
        <KeywordActionsCell keywordData={props.rowData} optimisticUpdate={this.optimisticUpdate} />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          tableName={tableName}
          label={props.label}
          hideLabel
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
  ];

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

  queryDataFormatter = ({
    keywords: {
      keywords,
      pagination: { numResults },
    },
  }) => ({
    list: keywords.map(
      kdata =>
        !kdata.rank
          ? {
              ...kdata,
              rank: {
                rank: -1,
                shareOfVoice: -1,
                shareOfVoicePercentage: -1,
                changes: {},
              },
            }
          : kdata,
    ),
    numResults,
  });

  getExtraRankDescriptor = () => ({
    name: 'extraRanks',
    getId: (rowData, item, idx) => `extraRanks-${rowData.id}-${idx}`,
    isDescriptorRow: rowData => (rowData ? ~rowData.id.indexOf('extraRanks') : false),
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
    const { hasAnalytics, onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.KEYWORDS}
        tableName={tableName}
        defaultSortField="keyword"
        defaultSortOrder="asc"
        ref={this.setTableRef}
        defaultColumns={this.defaultColumns}
        itemsName={t('keywords')}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        minRowHeight={defaultRowHeight}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight} // todo
        hasAnalytics={hasAnalytics}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
        onUpdate={onUpdate}
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
    tableState: state.keywordsTable.tableState,
    scrollState: state.keywordsTable.scrollState,
  };
};

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { saveKeywordsTableState, resetKeywordsTableState },
    null,
    { withRef: true },
  ),
  mutationStarKeywords({ withRef: true }),
)(withApollo(KeywordsInfiniteTable, { withRef: true }));
