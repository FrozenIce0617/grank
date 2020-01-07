// @flow
import moment from 'moment';
import type { CompareToFilter, PeriodFilter } from 'Types/Filter';
import { FilterAttribute, FilterComparison, FilterValueType } from 'Types/Filter';
import { formatDate } from 'Utilities/format';

export const EARLIEST = 'earliest';
export const LATEST = 'latest';

export type FromDate = Date | typeof EARLIEST;
export type ToDate = Date | typeof LATEST;

export type DateRange = {
  from: FromDate,
  to: ToDate,
};

export type DateFilters = [PeriodFilter, CompareToFilter];

export const clampDate = (value: FromDate | ToDate, min: Date, max: Date) => {
  if (value === EARLIEST || value === LATEST) {
    return value;
  }
  const valueMoment = moment(value);
  return valueMoment.isAfter(max) ? max : valueMoment.isBefore(min) ? min : value;
};

export const clampRange = (range: DateRange, min: Date, max: Date) => ({
  from: clampDate(range.from, min, max),
  to: clampDate(range.to, min, max),
});

export const daysInPeriod = (periodFilter: PeriodFilter): number => {
  const date = JSON.parse(periodFilter.value);
  const firstMoment = moment(date[0]);
  const lastMoment = date[1] === LATEST ? moment() : moment(date[1]);
  return lastMoment.diff(firstMoment, 'days');
};

export const parsePeriodFilterValue = (periodFilter: PeriodFilter): DateRange => {
  const date = JSON.parse(periodFilter.value);
  return {
    from: date[0] === EARLIEST ? date[0] : moment(date[0]).toDate(),
    to: date[1] === LATEST ? date[1] : moment(date[1]).toDate(),
  };
};

export const compareRange = (rangeA: DateRange, rangeB: DateRange) => {
  const getDateVal = (value: string | Date) =>
    typeof value === 'string' ? value : formatDate(value);
  return (
    getDateVal(rangeA.from) === getDateVal(rangeB.from) &&
    getDateVal(rangeA.to) === getDateVal(rangeB.to)
  );
};

export const getDateRange = (range: DateRange, min: Date, max: Date) => {
  let dateFrom: Date = range.from === EARLIEST ? min : range.from;
  const dateTo: Date = range.to === LATEST ? max : range.to;
  // Handle yesterday case
  if (moment(dateFrom).isSame(max, 'day') && range.to === LATEST) {
    dateFrom = moment(max).subtract(1, 'day');
    dateFrom = dateFrom.isBefore(min) ? min : dateFrom.toDate();
  }
  return {
    from: dateFrom,
    to: dateTo,
  };
};

export const rangeToFilters = (range: DateRange, includeCompareTo: boolean = true): DateFilters => {
  const from = range.from === 'earliest' ? range.from : formatDate(range.from);
  const to = range.to === 'latest' ? range.to : formatDate(range.to);

  const filters = [
    {
      attribute: FilterAttribute.PERIOD,
      type: FilterValueType.DATETIME,
      comparison: FilterComparison.BETWEEN,
      value: JSON.stringify([from, to]),
    },
  ];

  if (includeCompareTo) {
    filters.push({
      attribute: FilterAttribute.COMPARE_TO,
      type: FilterValueType.DATETIME,
      comparison: FilterComparison.EQ,
      value: from,
    });
  }

  return filters;
};

export type ButtonConfig = {
  id: string,
  label: string,
  getRange: () => DateRange | null,
};

export const findButtonConfig = (
  buttonConfigs: ButtonConfig[],
  range: DateRange,
  min: Date,
  max: Date,
) => {
  const configs = buttonConfigs.filter(buttonConfig => {
    const buttonRange = buttonConfig.getRange(min, max);
    return buttonRange
      ? compareRange(
          getDateRange(range, min, max),
          getDateRange(
            {
              from: clampDate(buttonRange.from, min, max),
              to: clampDate(buttonRange.to, min, max),
            },
            min,
            max,
          ),
        )
      : false;
  });

  const initial = configs.find(({ id }) => id === 'initial');
  return initial || (configs.length ? configs[0] : null);
};
