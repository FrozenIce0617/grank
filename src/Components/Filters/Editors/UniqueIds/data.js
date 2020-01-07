// @flow
import UniqueIdsIcon from 'icons/mobile-devices.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { UniqueIdsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import UniqueIdsEditor from './';

export const defaultValue: UniqueIdsFilter = {
  attribute: FilterAttribute.UNIQUE_IDS,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getData = () => ({
  defaultValue,
  title: t('Unique IDs'),
  icon: UniqueIdsIcon,
  editor: UniqueIdsEditor,
  labelFunc: (filter: UniqueIdsFilter) =>
    filter.value.map(value => value || t('No unique ID')).join(', '),
});

export default getData;
