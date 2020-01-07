/* eslint-disable react/no-did-update-set-state */
// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { FilterAttribute } from 'Types/Filter';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, debounce } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { subscribeToKeyword, subscribeToKeywords } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';
import { withProps } from 'Components/HOC';
import SearchVolume from 'Components/Table/TableRow/SearchVolume';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// cells
import CompetitorRankCell from 'Components/Table/TableRow/CompetitorRankCell';
import KeywordCell from 'Components/Table/TableRow/KeywordCell';
import RankCell from 'Components/Table/TableRow/RankCell';
import ValueDelta from 'Components/Table/TableRow/ValueDelta'; // fixed
import RankOptions from 'Components/Table/TableRow/RankOptions';

type Props = {
  onUpdate: Function,

  // Automatic
  client: Object,
  filters: any,
};

const tableName = TableIDs.COMPETITOR_RANKINGS;

const HeaderCell = withProps({ tableName })(HeaderCellBase);

const keywordsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 35;
const defaultHeaderHeight = 77;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
  competitors: Object[] | null,
  competitorsDefaultColumns: string[],
};

const keywordsCompetitorsRanksQuery = gql`
  query keywordsCompetitorsRanks_keywordsRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $withKeyword: Boolean!
    $withRank: Boolean!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        keyword @include(if: $withKeyword)
        searchType
        searchEngine {
          id
          name
          icon
        }
        searchVolume {
          id
          searchVolume
        }
        rank @include(if: $withRank) {
          id
          rank
          changes {
            rank
            rankChange
          }
          competitorRanks {
            competitor {
              id
            }
            rank
            changes {
              rank
              rankChange
            }
          }
        }
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

const competitorsQuery = gql`
  query keywordsCompetitorsRanks_competitors(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $fakeOrdering: OrderingInput!
    $fakePagination: PaginationInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        competitors {
          id
          domain
        }
      }
    }
  }
`;

const defaultColumns = [
  ColumnIDs.KEYWORD,
  ColumnIDs.SEARCH_ENGINE,
  ColumnIDs.SEARCH_VOLUME,
  ColumnIDs.RANK,
  ColumnIDs.RANK_CHANGE,
];

class CompetitorsRanksInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandlers: SubscriptionHandle[];

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
    competitors: null,
    competitorsDefaultColumns: defaultColumns,
  };

  UNSAFE_componentWillMount() {
    const action = debounce(() => this.updateTable(), 1000);
    this._subHandlers = [subscribeToKeyword(action), subscribeToKeywords(action)];
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.filters !== this.props.filters) {
      this.resetTable();
    }

    if (prevState.competitors !== this.state.competitors) {
      this.setState({
        competitorsDefaultColumns: [
          ...defaultColumns,
          ...(this.state.competitors || []).reduce((acc, { id }) => {
            acc.push(this.getRankId(id));
            acc.push(this.getRankChangeId(id));
            return acc;
          }, []),
        ],
      });
    }
  }

  componentWillUnmount() {
    this._subHandlers.forEach(handler => {
      handler.unsubscribe();
    });
  }

  queryCompetitors = () => {
    const { client, filters } = this.props;
    return client.query({
      query: competitorsQuery,
      fetchPolicy: 'network-only',
      variables: {
        filters,
        fakePagination: {
          page: 1,
          results: 5,
        },
        fakeOrdering: {
          order: 'ASC',
          orderBy: 'keyword',
        },
        pagination: {
          page: 1,
          results: 100,
        },
        ordering: {
          order: 'ASC',
          orderBy: 'domain',
        },
      },
    });
  };

  getQuery = async ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters } = this.props;
    const { competitors } = this.state;

    if (!competitors) {
      const { data } = await this.queryCompetitors();
      if (data.keywords && data.keywords.competitors) {
        this.setState({
          competitors: data.keywords.competitors.competitors,
        });
      }
    }

    return keywordsPromiseBlocker.wrap(
      this.props.client.query({
        query: keywordsCompetitorsRanksQuery,
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
          withKeyword: customColumns.includes(ColumnIDs.KEYWORD),
          withRank: customColumns.includes(ColumnIDs.RANK),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  getRankId = id => `competitor-${id}-rank`;
  getRankChangeId = id => `competitor-${id}-rank-change`;

  getColumns = () => {
    const { competitors } = this.state;
    return (competitors || []).reduce(
      (acc, competitor) => {
        acc.push({
          id: this.getRankId(competitor.id),
          name: competitor.domain,
          width: 120,
          cellRenderer: (props: CellRendererParams) => (
            <CompetitorRankCell competitorRanksData={props.rowData} competitor={competitor} />
          ),
          headerRenderer: (props: HeaderRendererParams) => (
            <HeaderCell
              id={props.id}
              label={props.label}
              ellipsis
              className="no-border"
              scrollXContainer={props.scrollXContainer}
            />
          ),
          headerClassName: 'ellipsis',
          className: 'no-border',
        });

        acc.push({
          id: this.getRankChangeId(competitor.id),
          parentId: this.getRankId(competitor.id),
          name: t('+/-'),
          width: 62,
          cellRenderer: (props: CellRendererParams) => {
            const { rowData } = props;
            const competitorRanks = rowData.rank ? rowData.rank.competitorRanks || [] : [];
            const competitorRank = competitorRanks.find(
              rankObj => rankObj.competitor.id === competitor.id,
            );

            if (competitorRank && competitorRank.changes) {
              return (
                <ValueDelta
                  delta={competitorRank.changes.rankChange}
                  currentValue={competitorRank.rank}
                  showNumber={
                    competitorRank.changes.rankChange !== 9999 &&
                    competitorRank.changes.rankChange !== -9999
                  }
                />
              );
            }

            return <span />;
          },
          headerRenderer: (props: HeaderRendererParams) => (
            <HeaderCell
              id={props.id}
              label={props.label}
              ellipsis
              scrollXContainer={props.scrollXContainer}
            />
          ),
          headerClassName: 'ellipsis',
        });

        return acc;
      },
      [
        {
          id: ColumnIDs.KEYWORD,
          name: t('Keyword'),
          required: true,
          responsive: true,
          width: 300,
          cellRenderer: (props: CellRendererParams) => {
            const { rowData } = props;
            return <KeywordCell showTags showOptions keywordData={rowData} />;
          },
          headerRenderer: (props: HeaderRendererParams) => (
            <HeaderCell
              id={props.id}
              label={props.label}
              filterAttributes={[FilterAttribute.KEYWORD]}
              sortField={ColumnIDs.KEYWORD}
              scrollXContainer={props.scrollXContainer}
            />
          ),
        },
        {
          id: ColumnIDs.SEARCH_ENGINE,
          parentId: ColumnIDs.KEYWORD,
          name: t('Search Engine'),
          width: 70,
          cellRenderer: (props: CellRendererParams) => <RankOptions keywordData={props.rowData} />,
          headerRenderer: (props: HeaderRendererParams) => (
            <HeaderCell
              id={props.id}
              filterAttributes={[FilterAttribute.SEARCH_TYPE, FilterAttribute.SEARCH_ENGINE]}
              sortField="search_type"
              tableName={tableName}
              label={props.label}
              hideLabel
              className="filter-right"
              scrollXContainer={props.scrollXContainer}
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
          id: ColumnIDs.RANK,
          name: t('Rank'),
          width: 120,
          cellRenderer: (props: CellRendererParams) => {
            const { rowData } = props;
            return <RankCell keywordData={rowData} rank={rowData.rank ? rowData.rank.rank : '-'} />;
          },
          headerRenderer: (props: HeaderRendererParams) => (
            <HeaderCell
              id={props.id}
              label={props.label}
              filterAttributes={[FilterAttribute.RANK]}
              sortField={ColumnIDs.RANK}
              scrollXContainer={props.scrollXContainer}
              className="no-border"
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

            if (rowData.rank && rowData.rank.changes) {
              return (
                <ValueDelta
                  delta={rowData.rank.changes.rankChange}
                  currentValue={rowData.rank.rank}
                  showNumber={
                    rowData.rank.changes.rankChange !== 9999 &&
                    rowData.rank.changes.rankChange !== -9999
                  }
                />
              );
            }
            return <span />;
          },
          headerRenderer: (props: HeaderRendererParams) => (
            <HeaderCell
              id={props.id}
              label={props.label}
              scrollXContainer={props.scrollXContainer}
            />
          ),
        },
      ],
    );
  };

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

  rowHeightFunc = () => defaultRowHeight;

  queryDataFormatter = ({
    keywords: {
      keywords,
      pagination: { numResults },
    },
  }) => ({
    list: keywords,
    numResults,
  });

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator, competitorsDefaultColumns } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.COMPETITOR_RANKINGS}
        tableName={tableName}
        itemsName={t('keywords')}
        defaultSortField={ColumnIDs.KEYWORD}
        ref={this.setTableRef}
        defaultColumns={competitorsDefaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
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
  connect(
    mapStateToProps,
    null,
    null,
    { withRef: true },
  ),
)(withApollo(CompetitorsRanksInfiniteTable, { withRef: true }));
