// @flow
import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { FilterAttribute } from 'Types/Filter';
import cn from 'classnames';
import { t } from 'Utilities/i18n/index';
import { withProps, offlineFilter } from 'Components/HOC';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import InfiniteTable from 'Components/InfiniteTable';
import { TableIDs } from 'Types/Table';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import { uniqueId, debounce } from 'lodash';
import PromiseBlocker from 'Utilities/PromiseBlocker';
import { mutationStarKeywords } from 'Pages/Keywords/Table/mutations';
import { subscribeToKeyword, subscribeToKeywords } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';

// new cells
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';

// old cells
import Checkbox from 'Components/Controls/Checkbox';

type Props = {
  selected: Set<string>,
  handleSelect: Function,
  hasAnalytics: boolean,
  handleSelectAll: Function,
  isAllSelected: boolean,
  onUpdate: Function,

  // Automatic
  domainId: string | null,
  client: Object,
  filters: any,
  user: Object,
};

const tableName = TableIDs.IMPORT_GSC;
const HeaderCell = withProps({ tableName })(HeaderCellBase);

const keywordsPromiseBlocker = new PromiseBlocker();
const defaultRowHeight = 35;
const defaultHeaderHeight = 77;

const keywordsQuery = gql`
  query gscKeywordsInfiniteTable_gscKeywords($domainId: ID!) {
    domain(id: $domainId) {
      id
      googleOauthConnectionGscKeywords {
        id
        clicks
        countryCode
        countryName
        exists
        impressions
        keyword
      }
    }
  }
`;

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

class GSCKeywordsInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandlers: SubscriptionHandle[];

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  UNSAFE_componentWillMount() {
    const action = debounce(() => this.updateTable(), 1000);
    this._subHandlers = [subscribeToKeyword(action), subscribeToKeywords(action)];
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filters !== this.props.filters) {
      this.resetTable();
    }
  }

  componentWillUnmount() {
    this._subHandlers.forEach(handler => {
      handler.unsubscribe();
    });
  }

  getQuery = () => {
    const { domainId } = this.props;
    return keywordsPromiseBlocker.wrap(
      this.props.client.query({
        query: keywordsQuery,
        variables: {
          domainId,
        },
        fetchPolicy: 'network-only',
      }),
    );
  };

  defaultColumns = [
    ColumnIDs.CHECKBOX,
    ColumnIDs.KEYWORD,
    ColumnIDs.COUNTRY_NAME,
    ColumnIDs.IMPRESSIONS,
    ColumnIDs.CLICKS,
  ];

  getColumns = () => [
    {
      id: ColumnIDs.CHECKBOX,
      name: t('Checkbox'),
      required: true,
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
          label={props.label}
          hideLabel
          onSelectAllChange={this.props.handleSelectAll}
          isSelected={this.props.isAllSelected}
          scrollXContainer={props.scrollXContainer}
        />
      ),
      className: 'cell-center',
    },
    {
      id: ColumnIDs.KEYWORD,
      name: t('Keyword'),
      width: 300,
      responsive: true,
      required: true,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return <div className={cn({ exists: rowData.exists })}>{rowData.keyword}</div>;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.KEYWORD]}
          sortField={ColumnIDs.KEYWORD}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.COUNTRY_NAME,
      name: t('Country'),
      width: 200,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return (
          <div>
            <span className={`flag-icon flag-icon-${rowData.countryCode.toLowerCase()}`} />{' '}
            {rowData.countryName}
          </div>
        );
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.COUNTRY_NAME]}
          sortField={ColumnIDs.COUNTRY_NAME}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.IMPRESSIONS,
      name: t('Impressions'),
      width: 120,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return rowData.impressions;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.IMPRESSIONS]}
          sortField={ColumnIDs.IMPRESSIONS}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
    },
    {
      id: ColumnIDs.CLICKS,
      name: t('Clicks'),
      width: 100,
      cellRenderer: (props: CellRendererParams) => {
        const { rowData } = props;
        return rowData.clicks;
      },
      headerRenderer: (props: HeaderRendererParams) => (
        <HeaderCell
          id={props.id}
          filterAttributes={[FilterAttribute.CLICKS]}
          sortField={ColumnIDs.CLICKS}
          label={props.label}
          scrollXContainer={props.scrollXContainer}
        />
      ),
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

  rowHeightFunc = () => defaultRowHeight; // if keyword has tags it should be higher

  queryDataFormatter = ({ domain: { googleOauthConnectionGscKeywords: keywords } }) => {
    const list = this.props.prepareData(keywords);
    return {
      list,
      numResults: list.length,
    };
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    const { hasAnalytics, onUpdate } = this.props;
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.IMPORT_GSC}
        tableName={tableName}
        defaultSortField={ColumnIDs.IMPRESSIONS}
        defaultSortOrder="desc"
        ref={this.setTableRef}
        defaultColumns={this.defaultColumns}
        itemsName={t('keywords')}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        rowHeightFunc={this.rowHeightFunc}
        defaultRowHeight={defaultRowHeight}
        defaultHeaderHeight={defaultHeaderHeight} // todo
        hasAnalytics={hasAnalytics}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
        onUpdate={onUpdate}
        loaderText={t('Contacting Google')}
      />
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);

  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: state.filter.filterGroup.filters,
  };
};

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  offlineFilter({
    skip: ['domains'],
    mappings: { [FilterAttribute.GSC_EXISTS]: 'exists' },
    tableName,
    withoutPagination: true,
  }),
  connect(
    mapStateToProps,
    null,
    null,
    { withRef: true },
  ),
  mutationStarKeywords({ withRef: true }),
)(withApollo(GSCKeywordsInfiniteTable, { withRef: true }));
