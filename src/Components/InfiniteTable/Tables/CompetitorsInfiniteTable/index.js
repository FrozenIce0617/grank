// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { graphql } from 'react-apollo/index';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import Toast from 'Components/Toast';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { withProps } from 'Components/HOC';
import DeleteIcon from 'icons/remove.svg?inline';
import { CompareDatesFiltersSelector } from 'Selectors/FiltersSelector';

// base cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';
// old cells
import Checkbox from 'Components/Controls/Checkbox'; // fixed
import FormattedDomainCell from 'Components/Table/TableRow/FormattedDomainCell';
import FormatNumber from 'Components/FormatNumber'; // fixed
import ValueDelta from 'Components/Table/TableRow/ValueDelta'; // fixed
import ActionsCell from 'Components/Table/TableRow/ActionsCell';

type Props = {
  onUpdate: Function,
  selected: Set<string>,
  onSelect: Function,
  onDelete: Function,
  showShareOfVoicePercentage: boolean,

  // Automatic
  client: Object,
  filters: any,
  user: Object,
  showModal: Function,
  deleteCompetitorMutation: Function,
};

const tableName = TableIDs.COMPETITORS;

const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const competitorsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 50;
const defaultHeaderHeight = 35;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

const competitorsQuery = gql`
  query competitorsInfiniteTable_keywordsCompetitors(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
    $withCompetitorInfo: Boolean!
    $withSov: Boolean!
    $withKeywordsWinners: Boolean!
    $withKeywordsLosers: Boolean!
    $withRankStats: Boolean!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        domain {
          domain @include(if: $withCompetitorInfo) {
            id
            faviconUrl
            displayName
            domain
          }
          stats {
            shareOfVoice @include(if: $withSov)
            shareOfVoiceChange @include(if: $withSov)
            shareOfVoicePercentage @include(if: $withSov)
            shareOfVoicePercentageChange @include(if: $withSov)
            keywords0To3 @include(if: $withRankStats)
            keywords0To3Change @include(if: $withRankStats)
            keywords4To10 @include(if: $withRankStats)
            keywords4To10Change @include(if: $withRankStats)
            keywords11To20 @include(if: $withRankStats)
            keywords11To20Change @include(if: $withRankStats)
            keywords21To50 @include(if: $withRankStats)
            keywords21To50Change @include(if: $withRankStats)
            keywordsAbove50 @include(if: $withRankStats)
            keywordsAbove50Change @include(if: $withRankStats)
            keywordsUnranked @include(if: $withRankStats)
            keywordsUnrankedChange @include(if: $withRankStats)
            keywordsWinners @include(if: $withKeywordsWinners)
            keywordsLosers @include(if: $withKeywordsLosers)
          }
        }
        competitors {
          id
          faviconUrl @include(if: $withCompetitorInfo)
          googleBusinessName
          domain @include(if: $withCompetitorInfo)
          competitorForDomain {
            id
            domain
          }
          stats {
            shareOfVoice @include(if: $withSov)
            shareOfVoiceChange @include(if: $withSov)
            shareOfVoicePercentage @include(if: $withSov)
            shareOfVoicePercentageChange @include(if: $withSov)
            keywords0To3 @include(if: $withRankStats)
            keywords0To3Change @include(if: $withRankStats)
            keywords4To10 @include(if: $withRankStats)
            keywords4To10Change @include(if: $withRankStats)
            keywords11To20 @include(if: $withRankStats)
            keywords11To20Change @include(if: $withRankStats)
            keywords21To50 @include(if: $withRankStats)
            keywords21To50Change @include(if: $withRankStats)
            keywordsAbove50 @include(if: $withRankStats)
            keywordsAbove50Change @include(if: $withRankStats)
            keywordsUnranked @include(if: $withRankStats)
            keywordsUnrankedChange @include(if: $withRankStats)
            keywordsWinners @include(if: $withKeywordsWinners)
            keywordsLosers @include(if: $withKeywordsLosers)
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

class CompetitorsInfiniteTable extends Component<Props, State> {
  _table: any;

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { filters } = this.props;
    return competitorsPromiseBlocker.wrap(
      this.props.client.query({
        query: competitorsQuery,
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
          withCompetitorInfo: customColumns.includes(ColumnIDs.COMPETITOR_INFO),
          withSov:
            customColumns.includes(ColumnIDs.SHARE_OF_VOICE) ||
            customColumns.includes(ColumnIDs.SHARE_OF_VOICE_CHANGE),
          withKeywordsWinners: customColumns.includes(ColumnIDs.KEYWORDS_WINNERS),
          withKeywordsLosers: customColumns.includes(ColumnIDs.KEYWORDS_LOSERS),
          withRankStats:
            customColumns.includes(ColumnIDs.KEYWORDS_0_TO_3) ||
            customColumns.includes(ColumnIDs.KEYWORDS_4_TO_10) ||
            customColumns.includes(ColumnIDs.KEYWORDS_11_TO_20) ||
            customColumns.includes(ColumnIDs.KEYWORDS_21_TO_50) ||
            customColumns.includes(ColumnIDs.KEYWORDS_ABOVE_50) ||
            customColumns.includes(ColumnIDs.KEYWORDS_UNRANKED),
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.CHECKBOX,
    ColumnIDs.COMPETITOR_INFO,
    ColumnIDs.SHARE_OF_VOICE,
    ColumnIDs.SHARE_OF_VOICE_CHANGE,
    ColumnIDs.KEYWORDS_WINNERS,
    ColumnIDs.KEYWORDS_LOSERS,
    ColumnIDs.KEYWORDS_0_TO_3,
    ColumnIDs.KEYWORDS_0_TO_3_CHANGE,
    ColumnIDs.KEYWORDS_4_TO_10,
    ColumnIDs.KEYWORDS_4_TO_10_CHANGE,
    ColumnIDs.KEYWORDS_11_TO_20,
    ColumnIDs.KEYWORDS_11_TO_20_CHANGE,
    ColumnIDs.KEYWORDS_21_TO_50,
    ColumnIDs.KEYWORDS_21_TO_50_CHANGE,
    ColumnIDs.KEYWORDS_ABOVE_50,
    ColumnIDs.KEYWORDS_ABOVE_50_CHANGE,
    ColumnIDs.KEYWORDS_UNRANKED,
    ColumnIDs.KEYWORDS_UNRANKED_CHANGE,
    ColumnIDs.ACTIONS,
  ];

  handleDeleteCompetitor = competitor => {
    const { id } = competitor;

    this.props
      .deleteCompetitorMutation({
        variables: {
          input: {
            id,
            delete: true,
          },
        },
      })
      .then(({ data: { updateCompetitor: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Could not delete competitor'));
          return;
        }
        Toast.success(t('Competitor deleted'));
        this.resetTable();
        this.props.onDelete(competitor);
      });
  };

  showDeleteConfirmation = competitor => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Competitor?'),
        description: t('The competitor and its historic data will be permanently deleted.'),
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete competitor'),
        action: () => this.handleDeleteCompetitor(competitor),
      },
    });
  };

  getColumns = () => [
    {
      id: ColumnIDs.CHECKBOX,
      name: t('Checkbox'),
      required: true,
      width: 35,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        if (
          !props.rowData.competitorForDomain || // competitorForDomain field is absent for own domain
          props.rowData.competitorForDomain.domain === props.rowData.domain
        ) {
          return null;
        }
        const isSelected = this.props.selected.has(rowData.domain);
        return (
          <Checkbox checked={isSelected} onChange={this.props.onSelect} name={rowData.domain} />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          label={props.label}
          tableName={tableName}
          hideLabel
          sortField={ColumnIDs.CHECKBOX}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'cell-center',
    },
    {
      id: ColumnIDs.COMPETITOR_INFO,
      name: t('Competitor'),
      width: 220,
      required: true,
      responsive: true,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return (
          <FormattedDomainCell
            domain={rowData.domain}
            displayName={rowData.displayName}
            faviconUrl={rowData.faviconUrl}
          />
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField="domain"
          tableName={tableName}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.SHARE_OF_VOICE,
      name: t('SoV'),
      width: 100,
      sortField: 'share_of_voice',
      // TODO - handle advanced render?
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
          sortField="share_of_voice"
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Share of Voice for this competitor')}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.SHARE_OF_VOICE_CHANGE,
      parentId: ColumnIDs.SHARE_OF_VOICE,
      sortField: 'share_of_voice_change',
      name: t('+/-'),
      width: 80,
      requiresAdvancedMetrics: true,
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
          sortField="share_of_voice_change"
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Change in SoV between the two compared dates')}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_WINNERS,
      name: t('Winners'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => (
        <span className="badge badge-success">
          <FormatNumber>{props.rowData.stats.keywordsWinners}</FormatNumber>
        </span>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          tableName={tableName}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Keyword winners for this competitor')}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_LOSERS,
      name: t('Losers'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => (
        <span className="badge badge-danger">
          <FormatNumber>{props.rowData.stats.keywordsLosers}</FormatNumber>
        </span>
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          tableName={tableName}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
          tooltip={t('Keyword losers for this competitor')}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_0_TO_3,
      name: t('1-3'),
      width: 70,
      cellRenderer: (props: CellRendererParams) => {
        const value = props.rowData.stats.keywords0To3;
        return <FormatNumber>{value || 0}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_0_TO_3}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.KEYWORDS_0_TO_3_CHANGE,
      parentId: ColumnIDs.KEYWORDS_0_TO_3,
      name: t('+/-'),
      width: 64,
      cellRenderer: (props: CellRendererParams) => (
        <ValueDelta
          currentValue={props.rowData.stats.keywords0To3}
          delta={props.rowData.stats.keywords0To3Change}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_0_TO_3_CHANGE}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_4_TO_10,
      name: t('4-10'),
      width: 70,
      cellRenderer: (props: CellRendererParams) => {
        const value = props.rowData.stats.keywords4To10;
        return <FormatNumber>{value || 0}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_4_TO_10}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.KEYWORDS_4_TO_10_CHANGE,
      parentId: ColumnIDs.KEYWORDS_4_TO_10,
      name: t('+/-'),
      width: 64,
      cellRenderer: (props: CellRendererParams) => (
        <ValueDelta
          currentValue={props.rowData.stats.keywords4To10}
          delta={props.rowData.stats.keywords4To10Change}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_4_TO_10_CHANGE}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_11_TO_20,
      name: t('11-20'),
      width: 70,
      cellRenderer: (props: CellRendererParams) => {
        const value = props.rowData.stats.keywords11To20;
        return <FormatNumber>{value || 0}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_11_TO_20}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.KEYWORDS_11_TO_20_CHANGE,
      parentId: ColumnIDs.KEYWORDS_11_TO_20,
      name: t('+/-'),
      width: 64,
      cellRenderer: (props: CellRendererParams) => (
        <ValueDelta
          currentValue={props.rowData.stats.keywords11To20}
          delta={props.rowData.stats.keywords11To20Change}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_11_TO_20_CHANGE}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_21_TO_50,
      name: t('21-50'),
      width: 70,
      cellRenderer: (props: CellRendererParams) => {
        const value = props.rowData.stats.keywords21To50;
        return <FormatNumber>{value || 0}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_21_TO_50}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.KEYWORDS_21_TO_50_CHANGE,
      parentId: ColumnIDs.KEYWORDS_21_TO_50,
      name: t('+/-'),
      width: 64,
      cellRenderer: (props: CellRendererParams) => (
        <ValueDelta
          currentValue={props.rowData.stats.keywords21To50}
          delta={props.rowData.stats.keywords21To50Change}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_21_TO_50_CHANGE}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_ABOVE_50,
      name: t('51-500'),
      width: 70,
      cellRenderer: (props: CellRendererParams) => {
        const value = props.rowData.stats.keywordsAbove50;
        return <FormatNumber>{value || 0}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_ABOVE_50}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.KEYWORDS_ABOVE_50_CHANGE,
      parentId: ColumnIDs.KEYWORDS_ABOVE_50,
      name: t('+/-'),
      width: 64,
      cellRenderer: (props: CellRendererParams) => (
        <ValueDelta
          currentValue={props.rowData.stats.keywordsAbove50}
          delta={props.rowData.stats.keywordsAbove50Change}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_ABOVE_50_CHANGE}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.KEYWORDS_UNRANKED,
      name: t('Unranked'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => {
        const value = props.rowData.stats.keywordsUnranked;
        return <FormatNumber>{value || 0}</FormatNumber>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_UNRANKED}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="no-border"
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'no-border',
    },
    {
      id: ColumnIDs.KEYWORDS_UNRANKED_CHANGE,
      parentId: ColumnIDs.KEYWORDS_UNRANKED,
      name: t('+/-'),
      width: 64,
      cellRenderer: (props: CellRendererParams) => (
        <ValueDelta
          currentValue={props.rowData.stats.keywordsUnranked}
          delta={props.rowData.stats.keywordsUnrankedChange}
        />
      ),
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          sortField={ColumnIDs.KEYWORDS_UNRANKED}
          descDefault={true}
          tableName={tableName}
          label={props.label}
          className="hide-filter-input filter-right"
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.ACTIONS,
      name: t('Actions'),
      width: 60,
      cellRenderer: (props: CellRendererParams) => {
        const actions = [];
        if (
          props.rowData.competitorForDomain && // competitorForDomain field is absent for own domain
          props.rowData.competitorForDomain.domain !== props.rowData.domain
        ) {
          actions.push({
            onSelect: () => this.showDeleteConfirmation(props.rowData),
            label: t('Delete'),
            icon: DeleteIcon,
          });
        }
        return <ActionsCell shouldUpdateIndicator={props.rowData} actions={actions} />;
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
      className: 'no-border',
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

  rowHeightFunc = obj => defaultRowHeight;

  queryDataFormatter = (data: Object) => {
    const competitorsData = data.keywords.competitors;
    const currentData = competitorsData.domain.domain
      ? {
          ...competitorsData.domain,
          ...competitorsData.domain.domain,
        }
      : null;

    let list = competitorsData.competitors;
    if (currentData) {
      // we generate a single list of own domain and competitors, so we get id conflicts in merge func
      // need to prevent id conflicts:
      currentData.id += '-own';
      list = [currentData, ...competitorsData.competitors];
    }
    return {
      list,
      numResults: competitorsData.pagination.numResults + (currentData ? 1 : 0),
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.COMPETITORS}
        tableName={tableName}
        itemsName={t('domains/competitors')}
        defaultSortField={ColumnIDs.COMPETITOR_INFO}
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
        onUpdate={onUpdate}
      />
    );
  }
}

const deleteCompetitorMutation = gql`
  mutation competitorsInfiniteTable_updateCompetitor($input: UpdateCompetitorInput!) {
    updateCompetitor(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const mapStateToProps = state => ({
  filters: CompareDatesFiltersSelector(state),
});

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
  graphql(deleteCompetitorMutation, { name: 'deleteCompetitorMutation', withRef: true }),
)(withApollo(CompetitorsInfiniteTable, { withRef: true }));
