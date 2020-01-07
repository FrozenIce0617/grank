// @flow
import { FilterComparison, FilterValueType } from 'Types/Filter';
import type { FilterBase, HighestRankingPageMatchFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';

type ValueLabel = {
  value: any,
  label: string,
};

export const oneOfOptions = (options: ValueLabel[]) => (filter: FilterBase) => {
  const item = options.find(option => option.value === filter.value);
  return item ? item.label : '';
};

export const someOfOptions = (options: ValueLabel[]) => {
  const optionsMap = options.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});
  return (filter: FilterBase) => {
    if (filter.type === FilterValueType.ARRAY) {
      return filter.value.map(item => optionsMap[item]).join(', ');
    }
    return '';
  };
};

const buildComparisonLabels = () => ({
  [FilterComparison.EQ]: t('Equals'),
  [FilterComparison.GT]: t('Greater than'),
  [FilterComparison.GTE]: t('Greater than or equal'),
  [FilterComparison.LT]: t('Less than'),
  [FilterComparison.LTE]: t('Less than or equal'),
  [FilterComparison.NE]: t('Not equals'),
  [FilterComparison.CONTAINS]: t('Contains'),
  [FilterComparison.NOT_CONTAINS]: t('Not contains'),
  [FilterComparison.STARTS_WITH]: t('Starts with'),
  [FilterComparison.ENDS_WITH]: t('Ends with'),
  [FilterComparison.ALL]: t('All'),
  [FilterComparison.ANY]: t('Any'),
  [FilterComparison.NONE]: t('None'),
});

const buildMatchingPageComparisonLabels = () => ({
  [FilterComparison.EQ]: t('Correct URL'),
  [FilterComparison.NE]: t('Incorrect URL'),
  [FilterComparison.NOT_CONTAINS]: t('Preferred URL not set'),
});

let comparisonLabelsMap;
let matchingPageComparsionLabelsMap;

export const getComparisonLabels = () => {
  if (!comparisonLabelsMap) {
    comparisonLabelsMap = buildComparisonLabels();
  }
  return comparisonLabelsMap;
};

export const getMatchingPageComparisonLabels = () => {
  if (!matchingPageComparsionLabelsMap) {
    matchingPageComparsionLabelsMap = buildMatchingPageComparisonLabels();
  }
  return matchingPageComparsionLabelsMap;
};

export const stringLabelFunc = (filter: FilterBase) => {
  if (filter.type === FilterValueType.STRING) {
    const comparisonLabels = getComparisonLabels();
    return `${comparisonLabels[filter.comparison]} ${filter.value}`;
  }
  return t('Not a string filter');
};

export const numberLabelFunc = (filter: FilterBase) => {
  if (filter.type === FilterValueType.NUMBER) {
    if (filter.comparison === FilterComparison.BETWEEN) {
      return t('Between %s and %s', filter.value[0], filter.value[1]);
    }
    const comparisonLabels = getComparisonLabels();
    return `${comparisonLabels[filter.comparison]} ${filter.value}`;
  }
  return t('Not numeric filter');
};

export const matchingPageComparisonLabelFunc = (filter: HighestRankingPageMatchFilter) => {
  if (filter.type === FilterValueType.STRING) {
    const comparisonLabels = getMatchingPageComparisonLabels();
    return comparisonLabels[filter.comparison];
  }
  return t('Not a string filter');
};
