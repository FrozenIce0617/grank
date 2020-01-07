/* eslint-disable react/no-find-dom-node */
// @flow
import React, { Component, Fragment } from 'react';
import { findDOMNode } from 'react-dom';
import { isEmpty, upperFirst, assign, uniqueId, cloneDeep, remove } from 'lodash';
import { ScrollSyncPane, ScrollSync } from 'react-scroll-sync';
import {
  InfiniteLoader,
  WindowScroller,
  AutoSizer,
  Table,
  Column,
  defaultCellRangeRenderer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import { resetTable } from 'Actions/TableAction';
import type { TableProps } from 'Types/Table';
import LocalStorage from 'Utilities/storage';
import { connect } from 'react-redux';
import { StickyIDs } from 'Types/Sticky';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import StickyContainer from 'Components/Sticky/Container';
import { t } from 'Utilities/i18n';
import TableEmptyState from 'Components/TableEmptyState';
import { showModal } from 'Actions/ModalAction';
import { compose, withApollo } from 'react-apollo';
import User from 'Queries/user';
import { singleQuotesStringsToArray } from 'Utilities/underdash';
import { updateUserSettings } from 'Actions/UserAction';
import './infinite-table.scss';
import type {
  CellRendererParams,
  RowRendererParams,
  HeaderRowRendererParams,
} from 'react-virtualized';
import UpsellRow from './UpsellRow';
import HeaderRow from './HeaderRow';
import Loader from 'Components/Loader';
import Sheetclip from 'sheetclip';

const sheetclip = new Sheetclip();

// Cells
import HeaderCell from 'Components/InfiniteTable/Cells/HeaderCell';
import SkeletonCell from 'Components/InfiniteTable/Cells/SkeletonCell';

type ColumnType = {
  id: string,
  name: string,
  width: number,

  // optional
  cellRenderer?: Function,
  headerRenderer?: Function,
  className?: string,
  headerClassName?: string,
  requiresAdvancedMetrics?: boolean,
  parentId?: string,
  requiresAnalytics?: boolean, // default false
  className?: string,
  minWidth?: number,
  settingsLabel?: string,
  responsive?: boolean,
  required?: boolean,
  hasDynamicHeight?: boolean,
  dataToCopy?: Function,
};

// OptimisticUpdate is just a descriptor of the
// update (see optimisticUpdate() method for more details)
type OptimisticUpdate = {
  item: Object,
  ids: string[],
  isExcluded?: boolean,
  merger?: (oldItem: Object, newItem: Object) => Object,
};

// OptimisticUpdateGroup represents one optimistic update
// that will be changed by the real ones in process of mutation
type OptimisticUpdateGroup = {
  isFinished?: boolean, // true if real one is applied
  updates: OptimisticUpdate[], // queue of the updates for the particular group
};

// OptimisticUpdates is queue of all updates
// that we have on current moment, we reset them on every full update
// and apply on cached list on every real update
type OptimisticUpdates = Map<number, OptimisticUpdateGroup>;

type OptimisticUpdateArgs = {
  ids: string | string[],
  item: Object,
  isExcluded?: boolean,
  merger?: (oldItem: Object, newItem: Object) => Object,
  shouldResize?: boolean,
};

type RealUpdateHandle = ({ items: Object[] }) => void;

type Props = {
  tableName: string,
  defaultColumns: string[],
  columns: ColumnType[],
  stickyId: string,
  query: Function, // A method like loadMoreRows that accepts { startIndex, stopIndex } and returns the query
  queryDataFormatter: Function, // A method like queryDataFormatter that returns { startIndex, stopIndex, sortOrder, sortField, }
  isResponsive: boolean,
  resetIndicator: number, // Change of this prop indicates that table data should be reset
  silentUpdateIndicator: number, // Change of this prop indicates that table data should be updated without skeleton or loader
  onUpdate: Function, // Hook to update parent component that's depends on list. Temp fix. See KeywordsTable.
  itemsName: string,
  loaderText?: string,
  tables: Object, // Tables for table props

  // optionals
  scrollElement: any,
  defaultSortField?: string,
  disableSort?: boolean,
  className?: string,
  defaultHeaderHeight?: number,
  defaultRowHeight?: number,
  defaultSortOrder?: string,
  noRowsRenderer?: Function,
  hasAnalytics?: boolean,
  idField?: string,
  batchSize: number,
  minRowHeight?: number,
  rowHeightFunc?: Function, // should return number (40 default, will get send a query[x] object as parameter)
  backToTopOnReset: boolean,
  showPaginationInfo: boolean,
  onReset?: Function,

  // automatic
  tableProps: TableProps,
  resetTable: typeof resetTable,
  showModal: Function,
  updateUserSettings: Function,
  client: Function,
  user: Object,
};

type State = {
  list: Object[],
  numResults: number,
  fakeNumResults: number,
  loading: boolean,
  columns: string[],
  firstRender: boolean, // Used to skip first render operation
  firstLoad: boolean,
  isHeaderSticky: boolean,
};

class InfiniteTable extends Component<Props, State> {
  _table: any;
  _loaderRef: InfiniteLoader = React.createRef();
  scrollContainer: any;
  stickyContainer: any;
  windowScroller: WindowScroller;
  _cache: CellMeasurerCache;
  _mostRecentWidth: number = 0;
  _shouldNotSendQuery: boolean = false;
  _horizontalScrollPositionBeforeUpdate: number | null = null;
  _optimisticUpdates: OptimisticUpdates = new Map();
  _cachedList = []; // list that we have before the next full update to apply updates on it

  lastStopIndex: number;
  threshold: number;

  static defaultProps = {
    batchSize: 250,
    defaultHeaderHeight: 40,
    defaultRowHeight: 40,
    defaultSortOrder: 'desc',
    isResponsive: false,
    hasAnalytics: false,
    idField: 'id',
    scrollElement: window,
    backToTopOnReset: true,
    showPaginationInfo: true,
  };

  constructor(props) {
    super(props);

    const { batchSize } = props;
    this.lastStopIndex = batchSize;
    this.threshold = batchSize / 5;
    this.state = {
      list: [],
      numResults: batchSize,
      fakeNumResults: batchSize,
      expandedNumResults: 0,
      loading: false,
      columns: this.getCustomColumns(props),
      firstRender: true,
      firstLoad: true,
      isHeaderSticky: false,
      cellsWidths: {},
    };

    this._cache =
      !props.rowHeightFunc && props.minRowHeight
        ? new CellMeasurerCache({
            minHeight: props.minRowHeight,
            defaultHeight: props.minRowHeight,
            fixedWidth: true,
          })
        : null;

    const { tableName, defaultSortField, defaultSortOrder } = props;
    const tableProps = this.getTableProps();
    if (!tableProps) {
      const tablePropsData = LocalStorage.get(this.getStoragePropName(tableName));
      const loadedTableProps = tablePropsData
        ? (JSON.parse(tablePropsData): TableProps)
        : {
            sortField: defaultSortField || '',
            sortOrder: defaultSortOrder,
          };
      this.props.resetTable(
        loadedTableProps.sortField,
        loadedTableProps.sortOrder === 'desc',
        1,
        0,
        50,
        this.props.tableName,
      );
    }
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      firstRender: false,
    });
  }

  UNSAFE_componentWillUpdate(nextProps: Props) {
    const nextTableProps = nextProps.tables[this.props.tableName];

    if (
      nextProps.columns !== this.props.columns ||
      nextProps.defaultColumns !== this.props.defaultColumns
    ) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({
        columns: this.getCustomColumns(nextProps),
      });
    }

    if (nextTableProps && this.getTableProps() && nextTableProps !== this.getTableProps()) {
      LocalStorage.save(this.getStoragePropName(this.props.tableName), nextTableProps);
      this.reset(nextProps);
    }

    if (nextProps.resetIndicator !== this.props.resetIndicator) {
      this.reset(nextProps);
    }

    if (nextProps.silentUpdateIndicator !== this.props.silentUpdateIndicator) {
      this.update(nextProps);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.loading !== this.state.loading) {
      this.stickyContainer && this.stickyContainer.updateListeners();
    }
  }

  getScrollContainerRef = ref => {
    this.scrollContainer = ref;
  };

  getScrollPosition = () => {
    return this.windowScroller ? this.windowScroller.state : {};
  };

  // Public methods
  handleStickyHeader = isSticky => {
    this.setState({ isHeaderSticky: isSticky });
  };

  handleBackToTop = () => {
    if (this.props.scrollElement === window) {
      this.props.scrollElement.scrollTo(0, 0);
    } else {
      this.props.scrollElement.scrollTop = 0;
    }
  };

  handleWidthChange = cellsWidths => {
    this.setState({ cellsWidths });
  };

  reset = (props: Props) => {
    const { batchSize, backToTopOnReset, onReset } = props;
    this.lastStopIndex = batchSize;
    this._cachedList = [];
    this._optimisticUpdates = new Map();
    this._shouldNotSendQuery = false;
    this.setState(
      {
        loading: false,
        list: [],
        columns: this.getCustomColumns(props),
        numResults: batchSize,
        fakeNumResults: batchSize,
        expandedNumResults: 0,
        endIsReached: false,
      },
      () =>
        // load new rows even we already do that because of fast filters or sorting changes
        this.loadMoreRows({
          startIndex: 0,
          stopIndex: batchSize,
          reload: true,
        }),
    );
    this._loaderRef && this._loaderRef.current && this._loaderRef.current.resetLoadMoreRowsCache();
    this.resizeAll();
    backToTopOnReset && this.handleBackToTop();
    onReset && onReset();
  };

  update = (props: Props) => {
    const { onUpdate } = props;

    const { sortOrder, sortField } = this.getTableProps();
    return this.props
      .query({
        startIndex: 0,
        stopIndex: this.lastStopIndex,
        sortOrder,
        sortField,
        customColumns: this.getCustomColumns(props),
      })
      .then(({ data }) => {
        const newState = this.queryDataFormatter({ data, isFullUpdate: true });
        this.setState(
          {
            list: newState.list,
            numResults: newState.numResults,
            endIsReached: newState.endIsReached,
            fakeNumResults: this.getScrollNumResults(
              newState.numResults,
              this.state.numResults,
              newState.list.length,
            ),
          },
          () => {
            this._horizontalScrollPositionBeforeUpdate = this.stickyContainer
              ? findDOMNode(this.stickyContainer).scrollLeft
              : null;
            onUpdate && onUpdate();
          },
        );

        this.resizeAll();
      });
  };

  getColumns = () => this.props.columns.filter(column => this.state.columns.includes(column.id));

  getList = () => this.state.list;

  isLoading = () => this.state.loading;

  getNumResults = () => this.state.numResults;

  insertItems = ({ rowId, idx, items, descriptor }) => {
    const { list, expandedNumResults } = this.state;
    const newList = [...list.slice(0, idx), ...items, ...list.slice(idx)];

    this.setState(
      {
        list: newList,
        fakeNumResults: newList.length,
        expandedNumResults: expandedNumResults + items.length,
      },
      () => this.resizeAllAfterToggle(rowId, descriptor),
    );
  };

  removeItems = ({ rowId, idx, amount, descriptor }) => {
    const { list, expandedNumResults } = this.state;

    const newList = [...list];
    newList.splice(idx, amount);

    this.setState(
      {
        list: newList,
        fakeNumResults: newList.length,
        expandedNumResults: expandedNumResults - amount,
      },
      () => this.resizeAllAfterToggle(rowId, descriptor),
    );
  };

  listToMap = list =>
    list.reduce((acc, listItem) => acc.set(this.getItemId(listItem), listItem), new Map());

  /**
   * Apply all optimistic updates and returns the updated list
   *
   * NOTE: it doesn't not change the input list
   */
  mergeWithAllPendingUpdates = (list: Object[]) => {
    this._optimisticUpdates.forEach(({ updates }) => {
      list = updates.reduce((acc, update) => this.mergeWithOptimisticUpdate(update, acc), list);
    });
    return list;
  };

  /**
   * Merge list with optimistic update passed in
   *
   * NOTE: it doesn't not change the input list
   * @param item - can have `starred` or `deleted` value to update list.
   * if deleted is true, it doesn't push the item to new list.
   */
  mergeWithOptimisticUpdate = ({ ids, item, isExcluded, merger = assign }, list: Object[]) => {
    return list.reduce((acc, listItem) => {
      const id = this.getItemId(listItem);
      if (ids.includes(id) === !isExcluded) {
        if (item && item.deleted) {
          return acc;
        }
        listItem = merger(cloneDeep(listItem), { ...item, [this.props.idField]: id });
      }
      acc.push(listItem);
      return acc;
    }, []);
  };

  /**
   * Change the optimistic update on real one and
   * applies it
   */
  applyRealUpdate = ({ updateId, items, doUpdate }) => {
    const { list } = this.state;

    // Mark that optimistic update can be reset as it's not pending anymore
    const updateGroup = this._optimisticUpdates.get(updateId);
    if (!updateGroup) {
      return;
    }

    updateGroup.isFinished = true;

    // Reset optimistic updates to apply only real ones (
    updateGroup.updates = [];

    // Add updates for the real update and apply them all
    const resultMap = this.listToMap(list);
    items &&
      items.forEach(newItem => {
        const id = this.getItemId(newItem);
        if (resultMap.get(id)) {
          updateGroup.updates.push({
            item: newItem,
            ids: [id],
            isExcluded: false,
          });
        }
      });

    this.setState(
      {
        list: this.mergeWithAllPendingUpdates(this._cachedList),
      },
      doUpdate,
    );
  };

  /**
   * Updates the current list with optimistic update and return func to apply real update after that
   *
   * Basically optimistic updates just change the list immediately before the real update comes
   * to fully reset optimistic one and apply. So no matter if we have errors or not - we must reset
   * optimistic ones and apply real ones.
   *
   * So to make optimistic update:
   * 1. Before mutation that intended to change the list we should call this method to make optimistic update.
   *
   *    Internally we save this update in the updates group (see OptimisticUpdateGroup) that is the
   *    part of the updates queue (see OptimisticUpdates) to apply them to the cached list.
   *    So cached list is just a copy of the list on the moment of the last full re-fetch and is needed to apply
   *    that updates queue multiple times (on every real update or optimistic one) to get the list that we shows.
   *
   *    So the cached list is:
   *      - fully replaced on full re-fetch (see mergeLists() method)
   *      - updated on every new page received (see mergeLists() method)
   *      - resets on table reset (see reset() method)
   *
   * 2. When the mutation succeed or not we need to reset optimistic update and apply the real one.
   *    We apply whole queue including the real update on the last cached list to get the list that we see.
   *
   *    So current method returns onRealUpdate handle and we must(!) call it after mutation in any case to do that.
   *
   * @param ids - the ids of the items that intended to be changed (or not changed in case if isExcluded is true)
   * @param isExcluded - see 'ids'
   * @param item - change that should be done, 'starred' or 'deleted' field can be existed.
   * @param merger - need to make merge of list items with item if default 'assign' method doesn't fit
   * @param shouldResize - should we call resize on list state update (for ex. if the height of the cell changes)
   * @return function to apply the real update that takes:
   *          items - in the same(!) format as passed item when making optimistic update
   */
  optimisticUpdate = ({
    ids,
    item,
    isExcluded,
    merger,
    shouldResize,
  }: OptimisticUpdateArgs): RealUpdateHandle => {
    const { onUpdate } = this.props;

    const updateId = uniqueId();
    const idsArr = Array.isArray(ids) ? ids : [ids];

    const newList = this.mergeWithOptimisticUpdate(
      { ids: idsArr, item, isExcluded, merger },
      this.state.list,
    );

    // Add update to the optimistic updates queue
    this._optimisticUpdates.set(updateId, {
      updates: [
        {
          item,
          ids: idsArr,
          isExcluded,
          merger,
        },
      ],
    });

    const doUpdate = () => {
      onUpdate && onUpdate();
      shouldResize && this.resizeAll();
    };

    // Apply optimistic update for the current list
    // In case of item.deleted is true, the numResults, fakeNumResults should be re-calculated.
    const newState = {
      list: newList,
    };
    if (item && item.deleted) {
      const numResults = isExcluded
        ? 0
        : this.state.numResults - (this.state.list.length - newList.length);
      item.numResults = numResults;
      item.fakeNumResults = this.getScrollNumResults(
        numResults,
        this.state.numResults,
        newList.length,
      );
    }
    this.setState(newState, doUpdate);

    return ({ items } = {}) => this.applyRealUpdate({ updateId, items, doUpdate });
  };

  getStoragePropName = tableName => `table_props:${tableName}`;
  getStorageColumnsName = tableName => `default${upperFirst(tableName)}Columns`;

  getTableProps = () => this.props.tables[this.props.tableName];

  isRowLoaded = ({ index }) => !!this.state.list[index];

  getItemId = item => {
    const field = this.props.idField;
    const id = item[field];
    if (id === undefined) {
      const errorMessage =
        'It appears elements of data array do not have id field. Make sure idField property value is correct.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return id;
  };

  loadMoreRows = ({ startIndex, stopIndex, reload }) => {
    if (this.state.endIsReached) {
      return;
    }

    if (!this._shouldNotSendQuery && !reload) {
      this._shouldNotSendQuery = true;
    } else if (this._shouldNotSendQuery) {
      if (reload) {
        this._shouldNotSendQuery = false;
      }
      return;
    }

    // Send query only when it's comes with reload and with no flag or flag is just set
    const { onUpdate } = this.props;
    this.setState({
      loading: true,
    });

    stopIndex = stopIndex + 1; // would never load the last item.

    if (this.lastStopIndex < stopIndex) {
      this.lastStopIndex = stopIndex;
    }

    const { sortOrder, sortField } = this.getTableProps();
    return this.props
      .query({
        startIndex,
        stopIndex,
        sortOrder,
        sortField,
        customColumns: this.getCustomColumns(this.props),
      })
      .then(({ data }) => {
        this._shouldNotSendQuery = false;
        this.setState(
          {
            loading: false,
            firstLoad: false,
            ...this.queryDataFormatter({ data, isFullUpdate: false }),
          },
          () => {
            this._horizontalScrollPositionBeforeUpdate = this.stickyContainer
              ? findDOMNode(this.stickyContainer).scrollLeft
              : null;
            onUpdate && onUpdate();
          },
        );

        this.resizeAll();
      })
      .catch(() => {
        this._shouldNotSendQuery = false;
      });
  };

  /**
   * Merge the lists and apply all pending optimistic updates
   *
   * @param oldArr - list that we had before
   * @param newArr - update list
   * @param isFullUpdate - define if we partly update the list or have full update (needed for optimistic updates)
   * @returns new updated list
   */
  mergeLists = (oldArr: Object[], newArr: Object[], isFullUpdate: boolean) => {
    const resultMap = this.listToMap(oldArr);
    const prevListResultMap = this.listToMap(this._cachedList);

    // Update list cache
    if (!isFullUpdate || isEmpty(this._cachedList)) {
      newArr.forEach(item => prevListResultMap.set(this.getItemId(item), item));
      this._cachedList = Array.from(prevListResultMap.values());
    }

    // Set unique values and apply optimistic updates
    (!isFullUpdate ? this.mergeWithAllPendingUpdates(newArr) : newArr).forEach(item =>
      resultMap.set(this.getItemId(item), item),
    );

    const newList = Array.from(resultMap.values());

    // Reset pending updates only when we get full update and update is not pending anymore
    if (isFullUpdate) {
      this._cachedList = newList;
      this._optimisticUpdates.forEach((updateGroup, updateId) => {
        updateGroup.isFinished && this._optimisticUpdates.delete(updateId);
      });
    }
    return newList;
  };

  getScrollNumResults = (numResults, fakeNumResults, itemsLength) => {
    // Set table to be longer then it is so we get better scrolling experience
    if (numResults > itemsLength) {
      fakeNumResults = itemsLength + this.threshold / 2;

      // make sure its not bigger then the actual limit
      if (fakeNumResults > numResults) {
        fakeNumResults = numResults;
      }
    } else {
      fakeNumResults = itemsLength;
    }

    return fakeNumResults;
  };

  /*
   * this.props.queryDataFormatter should return an object like:
   * {
   *   list: Object[],
   *   numResults: number,
   * }
   *
   * This method then takes the list and state.list and makes sure there are no duplicates.
   */
  queryDataFormatter = ({ data, isFullUpdate }: { data: Object[], isFullUpdate: boolean }) => {
    const oldState = this.state;
    const newState = this.props.queryDataFormatter(data);

    if (!newState.list.length) {
      return {
        list: oldState.list,
        numResults: oldState.list.length,
        fakeNumResults: oldState.list.length,
        endIsReached: true,
      };
    }

    const list = this.mergeLists(oldState.list, newState.list, isFullUpdate);

    const numResults = newState.numResults;
    return {
      list,
      numResults,
      fakeNumResults: this.getScrollNumResults(numResults, oldState.numResults, list.length),
    };
  };

  rowHeightFunc = ({ index }) => {
    const obj = this.state.list[index];
    return obj && this.props.rowHeightFunc
      ? this.props.rowHeightFunc(obj)
      : this.props.defaultRowHeight;
  };

  // https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultHeaderRowRenderer.js
  headerRowRenderer = (width: number, { className, columns, style }: HeaderRowRendererParams) => {
    const { user } = this.props;
    const { featureAdvancedMetrics, isTrial } =
      (user.organization && user.organization.activePlan) || {};
    const showUpsell = this.shouldShowUpsellRow();

    const newColumns = this.updateFixedColumns({ columns, style, isHeader: true });
    return (
      <Sticky
        className={cn({ 'has-upsell-row': showUpsell })}
        containerName={this.props.stickyId}
        name={StickyIDs.items.TABLE_HEADER}
        onToggle={this.handleStickyHeader}
        showPlaceholder
      >
        {props => (
          <div
            className={cn('infinite-table-header-container', { sticky: props.isSticky })}
            ref={props.getRef}
            style={{ ...props.style, ...style, width }}
          >
            <ScrollSyncPane>
              <HeaderRow className={className} width={width} onResize={this.handleWidthChange}>
                {newColumns.reduce((acc, column) => {
                  if (!Array.isArray(column.props.children) || column.props.children.length === 1) {
                    acc.push(this.headerColumnMapper(column));
                    return acc;
                  }

                  column.props.children.forEach(col => {
                    acc.push(this.headerColumnMapper(col));
                  });
                  return acc;
                }, [])}
              </HeaderRow>
            </ScrollSyncPane>
            {showUpsell && (
              <UpsellRow
                hasAdvancedMetricsFeature={featureAdvancedMetrics}
                isTrial={isTrial}
                style={{ width }}
                columns={this.getColumns()
                  .filter(column => column.requiresAdvancedMetrics && !column.parentId)
                  .map(column => column.name)}
              />
            )}
          </div>
        )}
      </Sticky>
    );
  };

  headerColumnMapper = col => (
    <div
      {...col.props}
      key={col.props.id} // re-define the key here as it actually uses index one and prevent to re-render
    >
      {col.props.children}
    </div>
  );

  noRowsRenderer = width => {
    const { stickyId } = this.props;
    if (this.props.noRowsRenderer) return this.props.noRowsRenderer();
    return (
      <StickyContainer
        ref={this.setStickyContainerRef}
        scrollElement={this.props.scrollElement}
        className="infinite-table-body"
        name={stickyId}
        style={{ width }}
      >
        <TableEmptyState
          style={{ width }}
          list={[]}
          title={t('No data')}
          subTitle={t('There is currently no data in this table.')}
          filtersPossible
        />
      </StickyContainer>
    );
  };

  cellDataGetter = () => 0;

  getCustomColumns = props => {
    const { user, defaultColumns, tableName, columns } = props;
    const columnsSettingsName = this.getStorageColumnsName(tableName);
    const customColumnsStr = user[columnsSettingsName];

    const columnNames = columns.map(item => item.id);
    const customColumns = new Set(
      (customColumnsStr ? singleQuotesStringsToArray(customColumnsStr) : defaultColumns).filter(
        column => columnNames.includes(column),
      ),
    );

    const requiredColumns = columns.filter(item => item.required).map(item => item.id);
    return Array.from(new Set([...customColumns, ...requiredColumns]));
  };

  showSettings = () => {
    this.showTableSettings();
  };

  shouldShowUpsellRow = () => {
    const { list } = this.state;
    const { user } = this.props;
    const { featureAdvancedMetrics, isTrial } =
      (user.organization && user.organization.activePlan) || {};
    return (
      !isEmpty(list) &&
      (this.getColumns().some(column => column.requiresAdvancedMetrics) &&
        (!featureAdvancedMetrics || isTrial))
    );
  };

  showTableSettings = () => {
    this.props.showModal({
      modalType: 'TableSettings',
      modalTheme: 'light',
      modalProps: {
        allColumns: this.props.columns,
        defaultColumns: this.props.defaultColumns, // actual default not the user specific ones (so dont use getCustomColumns)
        columns: this.state.columns,
        saveSettings: this.handleSaveSettings,
        hasAnalytics: this.props.hasAnalytics,
      },
    });
  };

  cellRangeRenderer = (width, props) => {
    const { stickyId, itemsName, loaderText } = this.props;
    if (this.state.firstLoad) {
      return [
        <Loader
          key="table-loader"
          className="infinite-table-loader"
          style={{ width }}
          loadingText={loaderText || t('Loading %s from server...', itemsName)}
        />,
      ];
    }
    const children = defaultCellRangeRenderer(props);
    return !isEmpty(children)
      ? [
          <ScrollSyncPane key="table-body-scroll-pane">
            <StickyContainer
              memoHorizontalScrollPosition={this._horizontalScrollPositionBeforeUpdate}
              scrollElement={this.props.scrollElement}
              ref={this.setStickyContainerRef}
              className="infinite-table-body"
              name={stickyId}
              style={{ width }}
            >
              {children}
            </StickyContainer>
          </ScrollSyncPane>,
        ]
      : [];
  };

  rowRenderer = ({
    className,
    columns,
    index,
    key,
    onRowClick,
    onRowDoubleClick,
    onRowMouseOut,
    onRowMouseOver,
    onRowRightClick,
    rowData,
    style,
  }: RowRendererParams) => {
    const a11yProps = { 'aria-rowindex': index + 1 };

    if (onRowClick || onRowDoubleClick || onRowMouseOut || onRowMouseOver || onRowRightClick) {
      a11yProps['aria-label'] = 'row';
      a11yProps.tabIndex = 0;

      if (onRowClick) {
        a11yProps.onClick = event => onRowClick({ event, index, rowData });
      }
      if (onRowDoubleClick) {
        a11yProps.onDoubleClick = event => onRowDoubleClick({ event, index, rowData });
      }
      if (onRowMouseOut) {
        a11yProps.onMouseOut = event => onRowMouseOut({ event, index, rowData });
      }
      if (onRowMouseOver) {
        a11yProps.onMouseOver = event => onRowMouseOver({ event, index, rowData });
      }
      if (onRowRightClick) {
        a11yProps.onContextMenu = event => onRowRightClick({ event, index, rowData });
      }
    }

    if (rowData && rowData.hasOwnProperty('className')) {
      className = `${className} ${rowData.className}`;
    }

    return (
      <div {...a11yProps} className={className} key={key} role="row" style={style}>
        {this.updateFixedColumns({ columns, style })}
      </div>
    );
  };

  updateFixedColumns = ({ columns, style, isHeader }) => {
    const { cellsWidths } = this.state;
    let nameGetter = column => column.props['aria-describedby'];
    let position = 'fixed';
    if (isHeader) {
      nameGetter = column => column.props.id;
      position = 'absolute';
    }

    const columnsToRender = this.getColumns();
    const fixedColumns = columnsToRender.filter(column => column.fixedLeft);
    let fixedColumnsLength = fixedColumns.length + 1;

    let leftOffset = 0;

    return columns.map(column => {
      const columnName = nameGetter(column);
      const columnDescriptor = columnsToRender.find(item => item.id === columnName);

      if (columnDescriptor.fixedLeft) {
        const oldOffset = leftOffset;
        leftOffset += cellsWidths[columnName] || columnDescriptor.width;

        fixedColumnsLength -= 1;
        return (
          <Fragment>
            {React.cloneElement(column, {
              style: {
                ...column.props.style,
                height: style.height - (!isHeader ? 2 : 1),
                position,
                background: 'white',
                zIndex: fixedColumnsLength,
                width: cellsWidths[columnName] || columnDescriptor.width,
                left: oldOffset,
                ...(!isHeader ? { marginTop: '1px' } : {}),
                ...(fixedColumns[fixedColumns.length - 1].id === columnName
                  ? { borderRight: '2px solid #e4e8ee' }
                  : {}),
              },
            })}
            <div
              key={`${column.props.id}-placeholder`}
              data-fixed={columnName}
              className={column.props.className}
              style={column.props.style}
            />
          </Fragment>
        );
      }

      return column;
    });
  };

  // eslint-disable-next-line no-unused-vars
  makeCellSkeletonRenderer = column => () => (
    <SkeletonCell responsive={column.responsive} width={column.width} />
  );

  makeCellRenderer = column => (props: CellRendererParams) => {
    const { expandableDescriptors } = this.props;
    const { rowData } = props;

    let descriptor;
    if (expandableDescriptors) {
      descriptor = expandableDescriptors.find(desc => desc.isDescriptorRow(rowData));
    }

    let cellRenderer;
    if (rowData) {
      if (descriptor) {
        const descriptorCellRenderer = descriptor.columns[column.id];
        cellRenderer = descriptorCellRenderer
          ? () => descriptorCellRenderer(props)
          : () => <span />;
      } else {
        cellRenderer = column.cellRenderer
          ? () => column.cellRenderer(props)
          : () => props.rowData[column.id] || null;
      }
    } else {
      cellRenderer = this.makeCellSkeletonRenderer(column);
    }

    return column.hasDynamicHeight ? this.dynamicCellRenderer(cellRenderer, props) : cellRenderer();
  };

  dynamicCellRenderer = (cellRenderer, props: CellRendererParams) => {
    if (!this._cache) {
      return cellRenderer();
    }

    const { dataKey, parent, rowIndex } = props;
    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}
      >
        {cellRenderer()}
      </CellMeasurer>
    );
  };

  /**
   * Method to copy all the list that we have in format to paste to Excel as a table
   */
  getCopy = () => {
    const { columns } = this.props;
    const { list } = this.state;
    return sheetclip.stringify(
      [columns.map(({ name }) => name)].concat(
        list.reduce((tableAcc, item) => {
          tableAcc.push(
            columns.reduce((rowAcc, column) => {
              const dataCopy = column.dataToCopy ? column.dataToCopy(item) : '-';
              rowAcc.push(String(dataCopy != null ? dataCopy : '-'));
              return rowAcc;
            }, []),
          );
          return tableAcc;
        }, []),
      ),
    );
  };

  handleSaveSettings = columns => {
    const { client, tableName } = this.props;
    const columnsSettingsName = this.getStorageColumnsName(tableName);

    return client
      .mutate({
        mutation: User.mutations.updateUserSettings,
        variables: {
          input: {
            [columnsSettingsName]: JSON.stringify(columns),
          },
        },
        refetchQueries: [
          {
            query: User.queries.getUser,
          },
        ],
      })
      .then(({ data: { updateUserSettings: { user } } }) => {
        this.props.updateUserSettings({
          [columnsSettingsName]: user[columnsSettingsName],
        });
        this.reset(this.props);
      });
  };

  resizeAllAfterToggle = (rowId, descriptor) => {
    this.resizeAll();
    this.setState({}, () => {
      descriptor.onToggleEnd && descriptor.onToggleEnd(rowId);
    });
  };

  resizeAll = () => {
    this._cache && this._cache.clearAll();
    this._table && this._table.recomputeRowHeights();
    this.windowScroller && this.windowScroller.updatePosition();
  };

  setStickyContainerRef = ref => {
    this.stickyContainer = ref;
  };

  setWindowScrollerRef = ref => {
    this.windowScroller = ref;
  };

  renderFallbackHeaderCell = ({ column, props, scrollXContainer, fixedOffset, fixed }) => {
    const { disableSort } = this.props;
    return (
      <HeaderCell
        id={column.id}
        tableName={this.props.tableName}
        hideFilter
        label={props.label}
        fixed={fixed}
        fixedOffset={fixedOffset}
        sortField={!disableSort ? column.id : false}
        scrollXContainer={scrollXContainer}
      />
    );
  };

  render() {
    const {
      numResults,
      list,
      fakeNumResults,
      firstRender,
      isHeaderSticky,
      loading,
      expandedNumResults,
    } = this.state;
    const { className, isResponsive, itemsName, batchSize, showPaginationInfo } = this.props;
    if (firstRender) {
      return null;
    }

    const columns = this.getColumns();
    const columnsWidth = columns.reduce((acc, column) => acc + column.width, 0);

    let leftFixedOffset = 0;

    return (
      <InfiniteLoader
        ref={this._loaderRef}
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.loadMoreRows}
        rowCount={numResults}
        minimumBatchSize={batchSize}
        threshold={this.threshold}
      >
        {({ onRowsRendered, registerChild }) => (
          <WindowScroller
            ref={this.setWindowScrollerRef}
            scrollElement={this.props.scrollElement}
            scrollingResetTimeInterval={250}
          >
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <AutoSizer disableHeight={true}>
                {({ width }) => {
                  const tableWidth = isResponsive || columnsWidth < width ? width : columnsWidth;

                  const rowCount = this.state.firstLoad ? 1 : fakeNumResults;

                  if (this._mostRecentWidth !== width) {
                    this._mostRecentWidth = width;
                    this.resizeAll();
                  }
                  return (
                    <ScrollSync>
                      <Fragment>
                        <Table
                          deferredMeasurementCache={this._cache}
                          onRowsRendered={onRowsRendered}
                          ref={ref => {
                            this._table = ref;
                            registerChild(ref);
                          }}
                          autoHeight={!this.state.firstLoad}
                          height={this.state.firstLoad ? 300 : height}
                          width={tableWidth}
                          isScrolling={isScrolling}
                          onScroll={onChildScroll}
                          scrollTop={scrollTop}
                          rowGetter={({ index }) => this.state.list[index]}
                          rowCount={rowCount}
                          rowHeight={
                            // In case of first load force proper size calculation to hide scrollbar
                            this.state.firstLoad
                              ? 200
                              : (this._cache && this._cache.rowHeight) || this.rowHeightFunc
                          }
                          headerHeight={this.props.defaultHeaderHeight}
                          scrollingResetTimeInterval={250}
                          rowRenderer={this.rowRenderer}
                          headerRowRenderer={props => this.headerRowRenderer(width, props)}
                          cellRangeRenderer={props => this.cellRangeRenderer(width, props)}
                          noRowsRenderer={() => this.noRowsRenderer(width)}
                          overscanRowCount={2} // https://github.com/bvaughn/react-virtualized/blob/master/docs/overscanUsage.md
                          className={cn(
                            'infinite-table',
                            {
                              'first-load': this.state.firstLoad,
                              'no-data': isEmpty(this.state.list),
                            },
                            className,
                          )}
                          children={columns.map(column => {
                            const fixedOffset = leftFixedOffset;
                            if (column.fixedLeft) {
                              leftFixedOffset += column.width;
                            }

                            return (
                              <Column
                                id={column.id}
                                key={column.id}
                                label={column.name}
                                dataKey={column.id}
                                width={column.width}
                                headerRenderer={props =>
                                  column.headerRenderer
                                    ? column.headerRenderer({
                                        ...props,
                                        id: column.id,
                                        fixedOffset,
                                        scrollXContainer: this.scrollContainer,
                                      })
                                    : this.renderFallbackHeaderCell({
                                        column,
                                        props,
                                        fixed: column.fixedLeft,
                                        fixedOffset,
                                        scrollXContainer: this.scrollContainer,
                                      })
                                }
                                headerClassName={cn(column.headerClassName, {
                                  'column-responsive': column.responsive,
                                })}
                                className={cn(column.className, {
                                  'column-responsive': column.responsive,
                                })}
                                cellRenderer={this.makeCellRenderer(column)}
                                cellDataGetter={this.cellDataGetter}
                              />
                            );
                          })}
                        />
                        <Sticky
                          showPlaceholder
                          containerName={this.props.stickyId}
                          name={StickyIDs.items.TABLE_FOOTER}
                          position="bottom"
                        >
                          {props => (
                            <div
                              className={cn('infinite-table-footer-container', {
                                sticky: props.isSticky,
                              })}
                              ref={props.getRef}
                              style={{ ...props.style, ...{ width } }}
                            >
                              <ScrollSyncPane>
                                <div
                                  ref={this.getScrollContainerRef}
                                  className="fake-horizontal-scroll"
                                  style={{ width }}
                                >
                                  <div style={{ height: '1px', width: tableWidth }} />
                                </div>
                              </ScrollSyncPane>
                              <div className="infinite-table-footer">
                                <span>
                                  {loading
                                    ? t('Loading %s from server...', itemsName)
                                    : showPaginationInfo
                                      ? t(
                                          '%s of %s %s loaded',
                                          list.length - expandedNumResults,
                                          numResults,
                                          itemsName,
                                        )
                                      : null}
                                </span>
                                {isHeaderSticky && (
                                  <span
                                    onClick={this.handleBackToTop}
                                    className="custom-link back-to-top"
                                  >
                                    {t('Back to top')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Sticky>
                      </Fragment>
                    </ScrollSync>
                  );
                }}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  tables: state.table, // TODO get table props for particular table
});

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { resetTable, showModal, updateUserSettings },
    null,
    { withRef: true },
  ),
)(withApollo(InfiniteTable, { withRef: true }));
