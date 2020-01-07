// @flow
import React from 'react';
import Icon from 'icons/question-rounded-filled.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { LandingPagesFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import LandingPagesEditor from '.';
import LandingPagesLabel from './LandingPagesLabel';

export const defaultValue: LandingPagesFilter = {
  attribute: FilterAttribute.LANDING_PAGES,
  type: FilterValueType.LIST,
  comparison: FilterComparison.CONTAINS,
  value: [],
};

const getData = () => ({
  defaultValue,
  title: t('Preferred URL'),
  icon: Icon,
  editor: LandingPagesEditor,
  labelFunc: (filter: LandingPagesFilter) => {
    const pagesIds = filter.value;
    return <LandingPagesLabel pagesIds={pagesIds} />;
  },
});

export default getData;
