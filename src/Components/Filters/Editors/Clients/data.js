// @flow
import React from 'react';
import ClientsIcon from 'icons/mobile-devices.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { ClientsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import ClientsEditor from './';
import ClientsLabel from './ClientsLabel';

export const defaultValue: ClientsFilter = {
  attribute: FilterAttribute.CLIENTS,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getData = () => ({
  defaultValue,
  title: t('Groups'),
  icon: ClientsIcon,
  editor: ClientsEditor,
  labelFunc: (filter: ClientsFilter) => {
    const clientsIds = filter.value;
    return <ClientsLabel clientsIds={clientsIds} />;
  },
});

export default getData;
