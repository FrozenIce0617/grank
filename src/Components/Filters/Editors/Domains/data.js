// @flow
import React from 'react';
import DomainsIcon from 'icons/mobile-devices.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { DomainsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import DomainsEditor from './';
import DomainsLabel from './DomainsLabel';

export const defaultValue: DomainsFilter = {
  attribute: FilterAttribute.DOMAINS,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getData = () => ({
  defaultValue,
  title: t('Domains'),
  icon: DomainsIcon,
  editor: DomainsEditor,
  labelFunc: (filter: DomainsFilter) => <DomainsLabel domainIds={filter.value} />,
});

export default getData;
