// @flow
import TagsIcon from 'icons/tags.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { TagsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import TagsEditor from '.';
import { isArray } from 'lodash';

export const defaultValue: TagsFilter = {
  attribute: FilterAttribute.TAGS,
  type: FilterValueType.ARRAY,
  comparison: FilterComparison.ANY,
  value: [],
};

const getData = () => {
  const comparisonLabels = {
    [FilterComparison.ALL]: t('All have'),
    [FilterComparison.ANY]: t('Some have'),
    [FilterComparison.NONE]: t('None has'),
    [FilterComparison.EMPTY]: t('No tags'),
  };

  return {
    defaultValue,
    title: t('Tags'),
    icon: TagsIcon,
    editor: TagsEditor,
    labelFunc: (filter: TagsFilter) =>
      `${comparisonLabels[filter.comparison]} ${
        isArray(filter.value) ? filter.value.join(', ') : ''
      }`,
  };
};

export default getData;
