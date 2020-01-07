// @flow
import { every, some } from 'lodash';
import moment from 'moment';
import { FilterComparison, FilterValueType, type FilterBase } from 'Types/Filter';

export const compareDateTime = (val: string, filter: FilterBase) => {
  switch (filter.comparison) {
    case FilterComparison.BETWEEN:
      return moment(val).isBetween(filter.value[0], filter.value[1]);
    case FilterComparison.EQ:
      return moment(val).isSame(filter.value);
    case FilterComparison.LT:
      return moment(val).isSameOrBefore(filter.value);
    case FilterComparison.GT:
      return moment(val).isSameOrAfter(filter.value);
    default:
      return false;
  }
};

export const compareString = (val: string, filter: FilterBase) => {
  switch (filter.comparison) {
    case FilterComparison.EQ:
      return val === filter.value;
    case FilterComparison.NE:
      return val !== filter.value;
    case FilterComparison.CONTAINS:
      return !!~val.indexOf(filter.value);
    case FilterComparison.NOT_CONTAINS:
      return !~val.indexOf(filter.value);
    case FilterComparison.STARTS_WITH:
      return val.startsWith(filter.value);
    case FilterComparison.ENDS_WITH:
      return val.endsWith(filter.value);
    default:
      return false;
  }
};

export const compareBool = (val: boolean, filter: FilterBase) => {
  switch (filter.comparison) {
    case FilterComparison.EQ:
      return val === filter.value;
    default:
      return false;
  }
};

export const compareNumber = (val: number, filter: FilterBase) => {
  switch (filter.comparison) {
    case FilterComparison.BETWEEN:
      return filter.value[0] <= val && val <= filter.value[1];
    case FilterComparison.EQ:
      return val === filter.value;
    case FilterComparison.NE:
      return val !== filter.value;
    case FilterComparison.LT:
      return val < filter.value;
    case FilterComparison.LTE:
      return val <= filter.value;
    case FilterComparison.GT:
      return val > filter.value;
    case FilterComparison.GTE:
      return val >= filter.value;
    default:
      return false;
  }
};

export const compareArray = (val: string[], filter: FilterBase) => {
  switch (filter.comparison) {
    case FilterComparison.ANY:
      return some(filter.value, filterVal => ~val.indexOf(filterVal.value || filterVal));
    case FilterComparison.ALL:
      return every(filter.value, filterVal => ~val.indexOf(filterVal.value || filterVal));
    case FilterComparison.NONE:
      return every(filter.value, filterVal => !~val.indexOf(filterVal.value || filterVal));
    default:
      return false;
  }
};

export const compareList = (val: string[], filter: FilterBase) => {
  switch (filter.comparison) {
    case FilterComparison.CONTAINS:
      return some(filter.value, filterVal => val.includes(filterVal.value || filterVal));
    default:
      console.error('Unknown filter comparision:', filter.comparison); // eslint-disable-line
      console.log('val', val); // eslint-disable-line
      console.log('filter', filter); // eslint-disable-line
      return false;
  }
};

export const compareWithFilter = (val: any, filter: FilterBase) => {
  switch (filter.type) {
    case FilterValueType.DATETIME:
      return compareDateTime(val, filter);
    case FilterValueType.STRING:
      return compareString(val, filter);
    case FilterValueType.NUMBER:
      return compareNumber(val, filter);
    case FilterValueType.BOOL:
      return compareBool(val, filter);
    case FilterValueType.ARRAY:
      return compareArray(val, filter);
    case FilterValueType.LIST:
      return compareList(val, filter);
    default:
      console.error('Unknown filter type:', filter.type); // eslint-disable-line
      console.log('val', val); // eslint-disable-line
      console.log('filter', filter); // eslint-disable-line
      return false;
  }
};

export default compareWithFilter;
