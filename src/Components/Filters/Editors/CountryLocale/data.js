// @flow
import React from 'react';
import Icon from 'icons/message-bubble.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { CountryLocaleFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import CountryLocaleEditor from '.';
import CountryLocaleLabel from './CountryLocaleLabel';

export const defaultValue: CountryLocaleFilter = {
  attribute: FilterAttribute.COUNTRY_LOCALE,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.EQ,
  value: NaN,
};

const getData = () => ({
  defaultValue,
  title: t('Locale'),
  icon: Icon,
  editor: CountryLocaleEditor,
  labelFunc: (filter: CountryLocaleFilter) => {
    const localeId = filter.value;
    return <CountryLocaleLabel localeId={localeId} />;
  },
});

export default getData;
