// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose, withApollo } from 'react-apollo';
import { FilterAttribute } from 'Types/Filter';
import { t } from 'Utilities/i18n';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { withProps } from 'Components/HOC';
import moment from 'moment';
import { uniqueId, debounce } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { subscribeToKeyword, subscribeToKeywords, subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';

// new cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// old cells
import DomainCell from 'Components/Table/TableRow/DomainCell';
import KeywordCell from 'Components/Table/TableRow/KeywordCell';
import LocationCell from 'Components/Table/TableRow/LocationCell';
import RankCell from 'Components/Table/TableRow/RankCell';
import RankOptions from 'Components/Table/TableRow/RankOptions';
import RankChangeCell from 'Components/Table/TableRow/RankChangeCell';

type Props = {
  onLoad: Function,

  // Automatic
  client: Object,
  filters: any,
  language: string,
  domainId: string,
};

const tableName = TableIDs.NOTIFICATIONS;

const notificationsPromiseBlocker = new PromiseBlocker();

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const notificationsQuery = gql`
  query notificationsInfiniteTable_keywordsNotifications(
    $filters: [FilterInput]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $withSearchEngine: Boolean!
    $withLocation: Boolean!
    $withRank: Boolean!
    $withRankChange: Boolean!
    $withURL: Boolean!
    $withTimeAgo: Boolean!
    $withCurrentRank: Boolean!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      notifications(pagination: $pagination, ordering: $ordering) {
        notifications {
          id
          type @include(if: $withRankChange)
          keyword {
            id
            keyword
            domain {
              id
              domain
              displayName
            }
            searchEngine @include(if: $withSearchEngine) {
              id
              name
            }
            countrylocale @include(if: $withLocation) {
              id
              countryCode
              region
              locale
            }
            location @include(if: $withLocation)
          }
          currentKeywordRank @include(if: $withCurrentRank) {
            highestRankingPage @include(if: $withURL)
            rank @include(if: $withRank)
          }
          previousKeywordRank @include(if: $withRankChange) {
            rank
          }
          createdAt @include(if: $withTimeAgo)
        }
        pagination {
          page
          results
          numResults
          numPages
        }
      }
    }
  }
`;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

class NotificationsInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandlers: SubscriptionHandle[];

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillMount() {
    const action = debounce(() => this.updateTable(), 1000);
    this._subHandlers = [
      subscribeToDomain(action),
      subscribeToKeyword(action),
      subscribeToKeywords(action),
    ];
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandlers.forEach(handle => handle.unsubscribe());
  }

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters, onLoad } = this.props;
    return notificationsPromiseBlocker.wrap(
      this.props.client
        .query({
          query: notificationsQuery,
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
            fakePagination: {
              page: 1,
              results: 5,
            },
            fakeOrdering: {
              order: 'ASC',
              orderBy: 'keyword',
            },
            withSearchEngine: customColumns.includes(ColumnIDs.SEARCH_ENGINE),
            withLocation: customColumns.includes(ColumnIDs.LOCATION),
            withRank: Boolean(
              customColumns.includes(ColumnIDs.RANK) |
                customColumns.includes(ColumnIDs.RANK_CHANGE),
            ),
            withRankChange: customColumns.includes(ColumnIDs.RANK_CHANGE),
            withURL: customColumns.includes(ColumnIDs.URL),
            withTimeAgo: customColumns.includes(ColumnIDs.TIME_AGO),
            withCurrentRank: Boolean(
              customColumns.includes(ColumnIDs.RANK) |
                customColumns.includes(ColumnIDs.RANK_CHANGE) |
                customColumns.includes(ColumnIDs.URL),
            ),
          },
          fetchPolicy: 'network-only',
        })
        .then(result => {
          onLoad && onLoad();
          return result;
        }),
    );
  };

  defaultColumns = [
    ColumnIDs.DOMAIN,
    ColumnIDs.KEYWORD,
    ColumnIDs.SEARCH_ENGINE,
    ColumnIDs.LOCATION,
    ColumnIDs.RANK,
    ColumnIDs.RANK_CHANGE,
    ColumnIDs.URL,
    ColumnIDs.TIME_AGO,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.DOMAIN,
      name: t('Domain'),
      width: 300,
      required: this.props.domainId === null,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return <DomainCell keywordData={rowData.keyword} />;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="keyword__domain__domain"
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORD,
      name: t('Keyword'),
      width: 250,
      responsive: true,
      required: true,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return <KeywordCell keywordData={rowData.keyword} />;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="keyword__keyword"
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.SEARCH_ENGINE,
      name: t('Search Engine'),
      width: 130,
      cellRenderer: (props: CellRendererParams) => (
        <RankOptions showSearchType={false} keywordData={props.rowData.keyword} />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="keyword__search_engine"
          label={props.label}
          className="cell-center"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'cell-center',
    },
    {
      id: ColumnIDs.LOCATION,
      name: t('Location'),
      responsive: true,
      width: 160,
      cellRenderer: (props: CellRendererParams) => {
        const {
          rowData: { keyword },
        } = props;
        const {
          countrylocale: { countryCode, region, locale },
          location,
        } = keyword;
        return (
          <LocationCell
            countryCode={countryCode}
            region={region}
            locale={locale}
            location={location}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="keyword__countrylocale__country_code"
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.RANK,
      name: t('New rank'),
      width: 110,
      cellRenderer: (props: CellRendererParams) => {
        const {
          rowData: { currentKeywordRank },
        } = props;
        return <RankCell rank={currentKeywordRank.rank} />;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="current_keyword_rank__rank"
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
      name: t('Change'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => {
        const {
          rowData: { type, currentKeywordRank, previousKeywordRank },
        } = props;
        return (
          <RankChangeCell
            type={type}
            currentValue={currentKeywordRank.rank}
            delta={previousKeywordRank.rank - currentKeywordRank.rank}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          descDefault
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.URL,
      name: t('URL'),
      width: 300,
      responsive: true,
      cellRenderer: (props: CellRendererParams) =>
        props.rowData.currentKeywordRank && props.rowData.currentKeywordRank.highestRankingPage ? (
          <a href={props.rowData.currentKeywordRank.highestRankingPage} target="_blank">
            {props.rowData.currentKeywordRank.highestRankingPage}
          </a>
        ) : (
          '-'
        ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
      ),
    },
    {
      id: ColumnIDs.TIME_AGO,
      name: t('Time Ago'),
      width: 140,
      cellRenderer: (props: CellRendererParams) => (
        <Link to="/keywords/list">
          {moment(props.rowData.createdAt)
            .locale(this.props.language)
            .format('LL')}
        </Link>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="created_at"
          descDefault={true}
          label={props.label}
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

  showSettings = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .showSettings();

  queryDataFormatter = ({
    keywords: {
      notifications: {
        notifications,
        pagination: { numResults },
      },
    },
  }) => {
    return {
      list: notifications,
      numResults,
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.NOTIFICATIONS}
        tableName={tableName}
        defaultSortField="created_at"
        defaultSortOrder="desc"
        ref={this.setTableRef}
        defaultColumns={this.defaultColumns}
        itemsName={t('notifications')}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
        backToTopOnReset={false}
      />
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  return {
    language: state.user.language,
    filters: CompareDatesFiltersSelector(state),
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
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
)(withApollo(NotificationsInfiniteTable, { withRef: true }));
