// @flow
import Icon from 'icons/progress-checked.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { SerpFeaturesFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import ChecklistEditor from 'Components/Filters/Common/ChecklistEditor';
import { someOfOptions } from 'Components/Filters/Common/labelFunc';

export const defaultValue: SerpFeaturesFilter = {
  attribute: FilterAttribute.SERP_FEATURES,
  type: FilterValueType.ARRAY,
  comparison: FilterComparison.ALL,
  value: [],
};

const getData = () => {
  const items = [
    { value: 'is_local_result', label: t('Is local result') },
    { value: 'is_featured_snippet', label: t('Is featured snippet') },
    { value: 'has_sitelinks', label: t('Has sitelinks') },
    { value: 'has_video', label: t('Has video') },
    { value: 'has_reviews', label: t('Has reviews') },
    { value: 'has_extra_ranks', label: t('Has extra ranks') },
  ];
  return {
    defaultValue,
    title: t('SERP Features'),
    icon: Icon,
    editor: ChecklistEditor,
    editorProps: {
      items,
    },
    labelFunc: someOfOptions(items),
  };
};

export default getData;
