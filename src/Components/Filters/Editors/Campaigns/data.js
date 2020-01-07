// @flow
import CampaignsIcon from 'icons/mobile-devices.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { CampaignsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import CampaignsEditor from './';

export const defaultValue: CampaignsFilter = {
  attribute: FilterAttribute.CAMPAIGNS,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getData = () => ({
  defaultValue,
  title: t('Campaigns'),
  icon: CampaignsIcon,
  editor: CampaignsEditor,
  labelFunc: (filter: CampaignsFilter) =>
    filter.value.map(value => value || t('No placement')).join(', '),
});

export default getData;
