// @flow
import * as React from 'react';
import { compose, withApollo } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, transform } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { withProps } from 'Components/HOC';
import URLEllipsis from 'Components/URLEllipsis';
import { orderBy } from 'lodash';
import moment from 'moment';
import { CompareDatesRequiredFiltersSelector } from 'Selectors/FiltersSelector';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// old cells
import RankCell from 'Components/Table/TableRow/RankCell';
import SERPOptions, { getIconData } from 'Components/Table/TableRow/SERPOptions';

import FormatNumber from 'Components/FormatNumber';

type Props = {
  keywordId: string,
  onLoad: Function,
  scrollElement: any,

  onUpdate: Function,
  client: Object,
  filters: any,
  isSuperuser: boolean,
};

const tableName = TableIDs.KEYWORD_HISTORY;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const keywordHistoryPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 38;
const defaultHeaderHeight = 35;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

const keywordHistoryQuery = gql`
  query keywordHistoryInfiniteTable_keywordRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $keywordId: ID!
    $isSuperuser: Boolean!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keyword(id: $keywordId) {
        id
        domain {
          id
          domain
          shareOfVoicePercentage
        }
        keyword
        history @include(if: $isSuperuser) {
          url
          date
        }
        ranks(competitors: []) {
          id
          searchDate
          rank
          shareOfVoice
          shareOfVoicePercentage
          highestRankingPage
          pageSerpFeatures {
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
      }
    }
  }
`;

class KeywordHistoryInfiniteTable extends React.Component<Props, State> {
  _table: any;

  static defaultProps = {
    scrollElement: window,
  };

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField }) => {
    const { filters } = this.props;
    return keywordHistoryPromiseBlocker.wrap(
      this.props.client.query({
        query: keywordHistoryQuery,
        variables: {
          filters,
          isSuperuser: this.props.isSuperuser,
          keywordId: this.props.keywordId,
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
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.SEARCH_DATE,
    ColumnIDs.RANK,
    ColumnIDs.SHARE_OF_VOICE,
    ColumnIDs.URL,
    ColumnIDs.SERP,
    ColumnIDs.SERP_PAGE,
  ];

  getHistoryForDate = (history: Array<Object>, date: Date) => {
    // return null if not existing
    if (history) {
      const items = history.filter(item => {
        const d1 = moment(date);
        const d2 = moment(item.date);
        return d1.isSame(d2, 'day');
      });

      if (items.length > 0) {
        return items[0];
      }

      return null;
    }
  };

  getColumns = () => {
    const featureIconsData = getIconData();
    const { isSuperuser } = this.props;

    const columns = [
      {
        id: ColumnIDs.SEARCH_DATE,
        name: t('Search date'),
        width: 150,
        required: true,
        dataToCopy: rowData => moment(rowData.searchDate).format('YYYY-MM-DD HH:mm'),
        cellRenderer: (props: CellRendererParams) => {
          return moment(props.rowData.searchDate).format('YYYY-MM-DD HH:mm');
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
      {
        id: ColumnIDs.RANK,
        name: t('Rank'),
        width: 110,
        dataToCopy: rowData => rowData.rank,
        cellRenderer: (props: CellRendererParams) => {
          const { rowData } = props;
          return <RankCell keywordData={rowData} rank={rowData.rank} />;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
      {
        id: ColumnIDs.SHARE_OF_VOICE,
        name: t('SoV'),
        width: 100,
        requiresAdvancedMetrics: true,
        dataToCopy: rowData => rowData.shareOfVoice,
        cellRenderer: (props: CellRendererParams) =>
          props.rowData.isShareOfVoisePercentage ? (
            <FormatNumber percentage precision={2}>
              {props.rowData.shareOfVoicePercentage || 0}
            </FormatNumber>
          ) : (
            <FormatNumber>{props.rowData.shareOfVoice || 0}</FormatNumber>
          ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
      {
        id: ColumnIDs.URL,
        name: t('URL'),
        width: 150,
        responsive: true,
        dataToCopy: rowData => rowData.highestRankingPage,
        cellRenderer: (props: CellRendererParams) => {
          let urlString = '-';
          if (props.rowData.highestRankingPage) {
            const el = document.createElement('a');
            el.href = props.rowData.highestRankingPage;
            urlString = el.pathname;
          }
          if (urlString !== '-') {
            return (
              <a href={props.rowData.highestRankingPage} target="_blank">
                <URLEllipsis maxWidth={150} url={urlString} />
              </a>
            );
          }
          return urlString;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
      {
        id: ColumnIDs.SERP,
        name: t('SERP'),
        width: 130,
        requiresAdvancedMetrics: true,
        dataToCopy: rowData =>
          transform(
            rowData.pageSerpFeatures,
            (acc, feature, key) => {
              const data = feature ? featureIconsData[key] : null;
              if (data) {
                acc.push(data.label);
              }
              return acc;
            },
            [],
          ).join(', '),
        cellRenderer: (props: CellRendererParams) => (
          <SERPOptions pageSerpFeatures={props.rowData.pageSerpFeatures} />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      },
    ];

    if (isSuperuser) {
      columns.push({
        id: ColumnIDs.SERP_PAGE,
        name: t('View SERP'),
        width: 130,
        dataToCopy: rowData => rowData.historyUrl,
        cellRenderer: (props: CellRendererParams) =>
          props.rowData.historyUrl && <a href={props.rowData.historyUrl}>{t('link')}</a>,
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell id={props.id} label={props.label} scrollXContainer={props.scrollXContainer} />
        ),
      });
    }

    return columns;
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

  getCopy = () =>
    this._table
      ? this._table
          .getWrappedInstance()
          .getWrappedInstance()
          .getCopy()
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

  rowHeightFunc = obj => (obj.historyUrl ? 46 : defaultHeaderHeight);

  queryDataFormatter = (data: Object) => {
    const keywordsHistoryData = data.keywords && data.keywords.keyword;
    if (this.props.onLoad) {
      this.props.onLoad(keywordsHistoryData);
    }
    const ranks = keywordsHistoryData ? [...keywordsHistoryData.ranks] : [];
    const ranksWithHistory = [];
    ranks.forEach(rankData => {
      const historyEntry = this.getHistoryForDate(keywordsHistoryData.history, rankData.searchDate);
      ranksWithHistory.push(
        Object.assign(
          {
            historyUrl: historyEntry ? historyEntry.url : '',
            isShareOfVoisePercentage: data.keywords.keyword.domain.shareOfVoicePercentage,
          },
          rankData,
        ),
      );
    });

    const sortedRanks = orderBy(ranksWithHistory, [item => new Date(item.searchDate)], ['desc']);
    return {
      list: sortedRanks,
      numResults: sortedRanks.length,
    };
  };

  getTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate, scrollElement } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        scrollElement={scrollElement}
        stickyId={StickyIDs.containers.KEYWORD_HISTORY}
        tableName={tableName}
        itemsName={t('rank history entries')}
        defaultSortField={ColumnIDs.SEARCH_DATE}
        ref={this.getTableRef}
        defaultColumns={this.defaultColumns}
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
  filters: CompareDatesRequiredFiltersSelector(state),
  isSuperuser: state.user.impersonateOriginUser
    ? state.user.impersonateOriginUser.isSuperuser
    : state.user.isSuperuser,
});

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
)(withApollo(KeywordHistoryInfiniteTable, { withRef: true }));
