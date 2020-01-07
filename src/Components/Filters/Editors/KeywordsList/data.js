// @flow
import TagsIcon from 'icons/tags.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { KeywordsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import KeywordsEditor from '.';
import { isArray } from 'lodash';

export const defaultValue: KeywordsFilter = {
  attribute: FilterAttribute.KEYWORDS,
  type: FilterValueType.ARRAY,
  comparison: FilterComparison.ANY,
  value: [],
};

const comparisonLabels = {
  [FilterComparison.ALL]: 'All have',
  [FilterComparison.ANY]: 'Some have',
  [FilterComparison.NONE]: 'None has',
};

const getData = () => ({
  defaultValue,
  title: t('Keywords'),
  icon: TagsIcon,
  editor: KeywordsEditor,
  labelFunc: (filter: KeywordsFilter) =>
    `${comparisonLabels[filter.comparison]} ${
      isArray(filter.value) ? filter.value.join(', ') : ''
    }`,
});

export default getData;
