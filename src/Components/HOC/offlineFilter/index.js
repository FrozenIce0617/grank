// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { chain, every, get, orderBy, isString } from 'lodash';
import * as Sort from 'Types/Sort';

import compareWithFilter from 'Utilities/compare';

type Props = {
  filters: Object[],
  tableProps: Object,
};

type Options = {
  mappings?: {
    [columnName: string]: string,
  },
  transformData?: {
    [string]: Function,
  },
  skip?: string[],
  skipAll: boolean,
  sortTypes?: {
    [columnName: string]: string,
  },
  tableName: string,
  withoutPagination: boolean,
};

const sortMap = {
  [Sort.DATE]: (data, sortField, sortOrder) =>
    orderBy(data, o => new Date(get(o, sortField)), sortOrder),
  [Sort.NATURAL]: (data, sortField, sortOrder) =>
    orderBy(
      data,
      o => {
        const item = get(o, sortField);
        if (isString(item)) {
          return item != null ? item.toLowerCase() : '';
        }
        return item;
      },
      sortOrder,
    ),
};

export const withOfflineFilters = (options: Options | string) => (
  Component: React.ComponentType<*>,
) =>
  connect(
    state => ({
      filters: state.filter.filterGroup.filters,
      tableProps: state.table[`${typeof options === 'string' ? options : options.tableName}`],
    }),
    null,
    null,
    { withRef: true },
  )(
    class OfflineFilters extends React.Component<Props> {
      _component: any;

      getSorter = (byField: string) => {
        if (
          typeof options === 'object' &&
          options.sortTypes &&
          options.sortTypes[byField] &&
          sortMap[options.sortTypes[byField]]
        ) {
          return sortMap[options.sortTypes[byField]];
        }
        return sortMap[Sort.NATURAL];
      };

      getComponentRef = ref => {
        this._component = ref;
      };

      getWrappedInstance() {
        return this._component;
      }

      doMapping = from => {
        if (typeof options === 'object' && options.mappings) {
          return options.mappings[from] || from;
        }
        return from;
      };

      doSkip = ({ attribute }) => {
        if (options.skipAll) {
          return false;
        }

        if (typeof options === 'object' && options.skip) {
          return !~options.skip.indexOf(attribute);
        }
        return true;
      };

      doTransform = (attribute, value) => {
        if (typeof options === 'object' && options.transformData) {
          const f = options.transformData[attribute];
          return (f && f(value)) || value;
        }
        return value;
      };

      withoutPagination = () => typeof options === 'object' && options.withoutPagination;

      isFiltered = () => !!this.props.filters.length;

      filterData = (data: Object[]) => {
        const { filters } = this.props;
        const filterFuncs = filters.filter(this.doSkip).map(filter => input => {
          const attribute = this.doMapping(filter.attribute);
          const value = this.doTransform(attribute, get(input, attribute));
          return compareWithFilter(value, filter);
        });

        return chain(data)
          .filter(item => every(filterFuncs, filter => filter(item)))
          .value();
      };

      sortData = (data: Object[]) => {
        const { tableProps } = this.props;
        if (!tableProps) {
          return data;
        }

        const { sortField, sortOrder } = tableProps;
        const sortFieldMapped = this.doMapping(sortField);
        return this.getSorter(sortField)(data, sortFieldMapped, sortOrder);
      };

      prepareData = (data: Object[]) => {
        const newData = this.sortData(this.filterData(data));
        if (this.withoutPagination()) {
          return newData;
        }

        const { tableProps } = this.props;
        if (!tableProps) {
          return this.filterData(data);
        }
        const { numberOfRows, page } = tableProps;
        const start = (page - 1) * numberOfRows;
        const end = page * numberOfRows;
        return newData.slice(start, end);
      };

      render() {
        // eslint-disable-next-line no-unused-vars
        const { filters, ...restProps } = this.props;
        return (
          <Component
            {...restProps}
            filters={filters}
            ref={this.getComponentRef}
            filterData={this.filterData}
            prepareData={this.prepareData}
            isFiltered={this.isFiltered}
          />
        );
      }
    },
  );

export default withOfflineFilters;
