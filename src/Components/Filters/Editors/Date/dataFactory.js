// @flow
import moment from 'moment';
import CalendarIcon from 'icons/calendar.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { DateFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';

import DateEditor from 'Components/Filters/Common/DateEditor';

export const defaultValue = attribute => ({
  attribute,
  type: FilterValueType.DATETIME,
  comparison: FilterComparison.EQ,
  value: moment().format('YYYY-MM-DD'),
});

const getComparisonLabels = () => ({
  [FilterComparison.EQ]: t('On'),
  [FilterComparison.BETWEEN]: t('Between'),
  [FilterComparison.GT]: t('After'),
  [FilterComparison.LT]: t('Before'),
});

const getDataFactory = ({
  title = () => t('Date'),
  attribute = FilterAttribute.DATE,
} = {}) => () => ({
  defaultValue: defaultValue(attribute),
  title: title(),
  icon: CalendarIcon,
  editor: DateEditor,
  labelFunc: (filter: DateFilter) => `${getComparisonLabels()[filter.comparison]} ${filter.value}`,
});

export default getDataFactory;
