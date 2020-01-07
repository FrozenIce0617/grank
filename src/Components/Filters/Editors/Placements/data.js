// @flow
import PlacementsIcon from 'icons/mobile-devices.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { PlacementsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import PlacementsEditor from './';

export const defaultValue: PlacementsFilter = {
  attribute: FilterAttribute.PLACEMENTS,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getData = () => ({
  defaultValue,
  title: t('Placements'),
  icon: PlacementsIcon,
  editor: PlacementsEditor,
  labelFunc: (filter: PlacementsFilter) =>
    filter.value.map(value => value || t('No placement')).join(', '),
});

export default getData;
