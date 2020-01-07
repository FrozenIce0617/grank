// @flow
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { compose, withApollo } from 'react-apollo';
import moment from 'moment';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, debounce } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { withProps } from 'Components/HOC';
import URLEllipsis from 'Components/URLEllipsis';
import { Link } from 'react-router-dom';
import { FilterAttribute, FilterValueType, FilterComparison } from 'Types/Filter';
import type { HighestRankingPageFilter } from 'Types/Filter';
import linkWithFilters from 'Components/Filters/linkWithFilters';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import { UncontrolledTooltip } from 'reactstrap';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { subscribeToDomain } from 'Utilities/websocket';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';
import './landing-pages-infinite-table.scss';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';
// old cells
import Checkbox from 'Components/Controls/Checkbox'; // fixed
import FormatNumber from 'Components/FormatNumber'; // fixed
import ValueDelta from 'Components/Table/TableRow/ValueDelta'; // fixed
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import ValueBar from 'Components/Table/TableRow/ValueBar';

type Props = {
  onUpdate: Function,
  selected: Set<string>,
  onSelect: Function,
  showShareOfVoicePercentage: boolean,

  // Automatic
  client: Object,
  filters: any,
  user: Object,
  showModal: Function,
  domainId: string,
};

const tableName = TableIDs.LANDING_PAGES;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const landingPagesPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 38;
const defaultHeaderHeight = 35;

function linkToKeywordList(path: string) {
  const highestRankingPageFilter: HighestRankingPageFilter = {
    attribute: FilterAttribute.HIGHEST_RANKING_PAGE,
    type: FilterValueType.STRING,
    comparison: FilterComparison.ENDS_WITH,
    value: path,
  };
  return linkWithFilters('/keywords/list', [highestRankingPageFilter], KEYWORDS_FILTER_SET);
}

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
  pathColumnWidth: number,
};

const landingPagesQuery = gql`
  query landingPagesInfiniteTable_keywordsLandingPages(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
    $withSov: Boolean!
    $withSearchVolume: Boolean!
    $withCostValue: Boolean!
    $withOrganicPageviews: Boolean!
    $withVisitors: Boolean!
    $withAverageTimeSpentOnPage: Boolean!
    $withAveragePageLoadTime: Boolean!
    $withBounceRate: Boolean!
    $withGoals: Boolean!
    $withRevenue: Boolean!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      landingPages(pagination: $pagination, ordering: $ordering) {
        landingPages {
          id
          domain {
            id
            domain
          }
          path
          stats {
            keywords
            searchVolume @include(if: $withSearchVolume)
            shareOfVoice @include(if: $withSov)
            shareOfVoiceChange @include(if: $withSov)
            shareOfVoicePercentage @include(if: $withSov)
            shareOfVoicePercentageChange @include(if: $withSov)
            cpc @include(if: $withCostValue)
            avrCpc @include(if: $withCostValue)
            avrTimeSpentOnPage @include(if: $withAverageTimeSpentOnPage)
            avrTimeSpentOnPageChange @include(if: $withAverageTimeSpentOnPage)
            visitors @include(if: $withVisitors)
            visitorsChange @include(if: $withVisitors)
            organicPageviews @include(if: $withOrganicPageviews)
            organicPageviewsChange @include(if: $withOrganicPageviews)
            bounceRate @include(if: $withBounceRate)
            bounceRateChange @include(if: $withBounceRate)
            goals @include(if: $withGoals)
            goalsChange @include(if: $withGoals)
            revenue @include(if: $withRevenue)
            revenueChange @include(if: $withRevenue)
            avgPageLoadTime @include(if: $withAveragePageLoadTime)
            avgPageLoadTimeChange @include(if: $withAveragePageLoadTime)
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
  }
`;

const formatDuration = (time: number) => {
  if (time > 60) {
    return `${moment.duration(time, 'seconds').get('minutes')}m`;
  }
  return `${moment.duration(time, 'seconds').get('seconds')}s`;
};

class LandingPagesInfiniteTable extends React.Component<Props, State> {
  _table: any;
  _subHandler: SubscriptionHandle;
  _pathRef = React.createRef();

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
    pathColumnWidth: 0,
  };

  constructor(props) {
    super(props);

    this._subHandler = subscribeToDomain(debounce(this.updateTable, 1000));

    window.addEventListener('resize', this.handleResize);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();

    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = debounce(() => {
    const node = findDOMNode(this._pathRef.current);
    if (node && node.clientWidth !== this.state.pathColumnWidth) {
      this.setState({ pathColumnWidth: node.clientWidth });
    }
  }, 0);

  handleUpdate = () => {
    const { onUpdate } = this.props;
    onUpdate && onUpdate();
    this.handleResize();
  };

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters } = this.props;
    return landingPagesPromiseBlocker.wrap(
      this.props.client.query({
        query: landingPagesQuery,
        variables: {
          filters,
          pagination: {
            page: 1,
            startIndex,
            stopIndex,
            results: 0,
          },
          fakePagination: {
            page: 1,
            results: 5,
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          ordering: {
            order: sortOrder.toUpperCase(),
            orderBy: sortField,
          },
          withSov:
            customColumns.includes(ColumnIDs.SHARE_OF_VOICE) ||
            customColumns.includes(ColumnIDs.SHARE_OF_VOICE_CHANGE),
          withSearchVolume: customColumns.includes(ColumnIDs.SEARCH_VOLUME),
          withCostValue: customColumns.includes(ColumnIDs.COST_VALUE),
          withOrganicPageviews:
            customColumns.includes(ColumnIDs.ORGANIC_PAGEVIEWS) ||
            customColumns.includes(ColumnIDs.ORGANIC_PAGEVIEWS_CHANGE),
          withVisitors:
            customColumns.includes(ColumnIDs.VISITORS) ||
            customColumns.includes(ColumnIDs.VISITORS_CHANGE),
          withAverageTimeSpentOnPage:
            customColumns.includes(ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE) ||
            customColumns.includes(ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE_CHANGE),
          withAveragePageLoadTime:
            customColumns.includes(ColumnIDs.AVERAGE_PAGE_LOAD_TIME) ||
            customColumns.includes(ColumnIDs.AVERAGE_PAGE_LOAD_TIME_CHANGE),
          withBounceRate:
            customColumns.includes(ColumnIDs.BOUNCE_RATE) ||
            customColumns.includes(ColumnIDs.BOUNCE_RATE_CHANGE),
          withGoals:
            customColumns.includes(ColumnIDs.GOALS) ||
            customColumns.includes(ColumnIDs.GOALS_CHANGE),
          withRevenue:
            customColumns.includes(ColumnIDs.REVENUE) ||
            customColumns.includes(ColumnIDs.REVENUE_CHANGE),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.CHECKBOX,
    ColumnIDs.PATH,
    ColumnIDs.KEYWORDS,
    ColumnIDs.SEARCH_VOLUME,
    ColumnIDs.SHARE_OF_VOICE,
    ColumnIDs.SHARE_OF_VOICE_CHANGE,
    ColumnIDs.COST_VALUE,
    ColumnIDs.ORGANIC_PAGEVIEWS,
    ColumnIDs.ORGANIC_PAGEVIEWS_CHANGE,
    ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE,
    ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE_CHANGE,
    ColumnIDs.AVERAGE_PAGE_LOAD_TIME,
    ColumnIDs.AVERAGE_PAGE_LOAD_TIME_CHANGE,
    ColumnIDs.BOUNCE_RATE,
    ColumnIDs.BOUNCE_RATE_CHANGE,
    ColumnIDs.GOALS,
    ColumnIDs.GOALS_CHANGE,
    ColumnIDs.REVENUE,
    ColumnIDs.REVENUE_CHANGE,
  ];

  getColumns = () => {
    const columns = [
      {
        id: ColumnIDs.CHECKBOX,
        name: t('Checkbox'),
        required: true,
        width: 35,
        cellRenderer: (props: CellRendererParams) => {
          const { rowData } = props;
          const isSelected = this.props.selected.has(rowData.id);
          return <Checkbox checked={isSelected} onChange={this.props.onSelect} name={rowData.id} />;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            hideLabel={true}
          />
        ),
        className: 'cell-center',
      },
      {
        id: ColumnIDs.PATH,
        name: t('Path'),
        width: 150,
        required: true,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { pathColumnWidth } = this.state;
          const link = `//${props.rowData.domain.domain}${props.rowData.path}`;
          const linkId = `landing-page-path-link-${props.rowData.id}`;
          return (
            <a href={link} id={linkId} target="_blank" rel="noopener noreferrer">
              <URLEllipsis
                maxWidth={(pathColumnWidth || 150) - /*padding*/ 20}
                url={props.rowData.path}
              />
              <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={linkId}>
                {props.rowData.path}
              </UncontrolledTooltip>
            </a>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            ref={this._pathRef}
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            sortField={ColumnIDs.PATH}
          />
        ),
      },
      {
        id: ColumnIDs.KEYWORDS,
        required: true,
        name: t('Keywords'),
        width: 120,
        cellRenderer: (props: CellRendererParams) => {
          let { domain } = props.rowData.domain;
          if (domain.charAt(domain.length - 1) === '/') {
            domain = domain.substring(0, domain.length - 1);
          }
          const link = linkToKeywordList(domain + props.rowData.path);
          return (
            <Link to={link}>
              <FormatNumber>{props.rowData.stats.keywords}</FormatNumber>
            </Link>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            sortField={ColumnIDs.KEYWORDS}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.SEARCH_VOLUME,
        name: t('Search volume'),
        width: 124,
        cellRenderer: (props: CellRendererParams) => (
          <FormatNumber>{props.rowData.stats.searchVolume}</FormatNumber>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            sortField={ColumnIDs.SEARCH_VOLUME}
            descDefault={true}
          />
        ),
      },

      {
        id: ColumnIDs.SHARE_OF_VOICE,
        name: t('SoV'),
        width: 100,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => {
          const { showShareOfVoicePercentage: isPercentage } = this.props;
          const { shareOfVoice, shareOfVoicePercentage } = props.rowData.stats;

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
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            sortField={ColumnIDs.SHARE_OF_VOICE}
            descDefault={true}
            className="no-border"
            tooltip={t('Share of Voice for this landing page')}
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.SHARE_OF_VOICE_CHANGE,
        parentId: ColumnIDs.SHARE_OF_VOICE,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) =>
          this.props.showShareOfVoicePercentage ? (
            <ValueDelta
              percentage
              precision={2}
              currentValue={props.rowData.stats.shareOfVoicePercentage}
              delta={props.rowData.stats.shareOfVoicePercentageChange}
            />
          ) : (
            <ValueDelta
              currentValue={props.rowData.stats.shareOfVoice}
              delta={props.rowData.stats.shareOfVoiceChange}
            />
          ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.COST_VALUE,
        name: t('Cost value'),
        width: 100,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <span id={`tooltipCpc_${props.rowData.id}`}>
            <FormatNumber currency="USD">{props.rowData.stats.cpc}</FormatNumber>
            <UncontrolledTooltip placement="top" target={`tooltipCpc_${props.rowData.id}`}>
              {t('Average CPC:')}{' '}
              <FormatNumber currency="USD">{props.rowData.stats.avrCpc}</FormatNumber>
            </UncontrolledTooltip>
          </span>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.ORGANIC_PAGEVIEWS,
        name: t('Organic visitors'),
        width: 140,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <FormatNumber>{props.rowData.stats.organicPageviews}</FormatNumber>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
            className="no-border"
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.ORGANIC_PAGEVIEWS_CHANGE,
        parentId: ColumnIDs.ORGANIC_PAGEVIEWS,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) => (
          <ValueDelta
            currentValue={props.rowData.stats.organicPageviews}
            delta={props.rowData.stats.organicPageviewsChange}
          />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE,
        name: t('Avg. time spent'),
        width: 140,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <span>{formatDuration(props.rowData.stats.avrTimeSpentOnPage)}</span>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
            className="no-border"
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE_CHANGE,
        parentId: ColumnIDs.AVERAGE_TIME_SPENT_ON_PAGE,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) => (
          <ValueDelta
            currentValue={props.rowData.stats.avrTimeSpentOnPage}
            delta={props.rowData.stats.avrTimeSpentOnPageChange}
          />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.AVERAGE_PAGE_LOAD_TIME,
        name: t('Avg. load time'),
        width: 120,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <span>{formatDuration(props.rowData.stats.avgPageLoadTime)}</span>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
            className="no-border"
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.AVERAGE_PAGE_LOAD_TIME_CHANGE,
        parentId: ColumnIDs.AVERAGE_PAGE_LOAD_TIME,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) => (
          <ValueDelta
            reverseColor={true}
            currentValue={props.rowData.stats.avgPageLoadTime}
            delta={props.rowData.stats.avgPageLoadTimeChange}
          />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.BOUNCE_RATE,
        name: t('Bounce rate'),
        width: 110,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <span id={`tooltipBounceRate_${props.rowData.id}`}>
            <ValueBar value={props.rowData.stats.bounceRate / 100} color="success" />
            <UncontrolledTooltip placement="top" target={`tooltipBounceRate_${props.rowData.id}`}>
              <FormatNumber>{props.rowData.stats.bounceRate}</FormatNumber>%
            </UncontrolledTooltip>
          </span>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
            className="no-border"
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.BOUNCE_RATE_CHANGE,
        parentId: ColumnIDs.BOUNCE_RATE,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) => (
          <ValueDelta
            reverseColor={true}
            currentValue={props.rowData.stats.bounceRate}
            delta={props.rowData.stats.bounceRateChange}
          />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.GOALS,
        name: t('Goals'),
        width: 100,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <FormatNumber>{props.rowData.stats.goals}</FormatNumber>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
            className="no-border"
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.GOALS_CHANGE,
        parentId: ColumnIDs.GOALS,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) => (
          <ValueDelta
            currentValue={props.rowData.stats.goals}
            delta={props.rowData.stats.goalsChange}
          />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
      {
        id: ColumnIDs.REVENUE,
        name: t('Revenue'),
        width: 100,
        requiresAdvancedMetrics: true,
        cellRenderer: (props: CellRendererParams) => (
          <FormatNumber currency="USD">{props.rowData.stats.revenue}</FormatNumber>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
            className="no-border"
          />
        ),
        className: 'no-border',
      },
      {
        id: ColumnIDs.REVENUE_CHANGE,
        parentId: ColumnIDs.REVENUE,
        name: t('+/-'),
        width: 72,
        cellRenderer: (props: CellRendererParams) => (
          <ValueDelta
            currentValue={props.rowData.stats.revenue}
            delta={props.rowData.stats.revenueChange}
          />
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            tableName={tableName}
            label={props.label}
            scrollXContainer={props.scrollXContainer}
            descDefault={true}
          />
        ),
      },
    ];
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

  rowHeightFunc = obj => defaultRowHeight;

  queryDataFormatter = (data: Object) => {
    const landingPagesData = data.keywords.landingPages;
    return {
      list: landingPagesData.landingPages,
      numResults: landingPagesData.pagination.numResults,
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        className="landing-pages-infinite-table"
        stickyId={StickyIDs.containers.LANDING_PAGES}
        tableName={tableName}
        itemsName={t('landing pages')}
        defaultSortField={ColumnIDs.KEYWORDS}
        ref={this.setTableRef}
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
        onUpdate={this.handleUpdate}
      />
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: CompareDatesFiltersSelector(state),
  };
};

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
)(withApollo(LandingPagesInfiniteTable, { withRef: true }));
