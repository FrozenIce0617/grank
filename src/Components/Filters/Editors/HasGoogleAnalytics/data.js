// @flow
import SearchEngineIcon from 'icons/search.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { HasGoogleAnalyticsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import { oneOfOptions } from 'Components/Filters/Common/labelFunc';

export const defaultValue: HasGoogleAnalyticsFilter = {
  attribute: FilterAttribute.HAS_GOOGLE_ANALYTICS,
  type: FilterValueType.BOOL,
  comparison: FilterComparison.EQ,
  value: false,
};

const getData = () => {
  const items = [
    { value: true, label: 'Has Google Analytics' },
    { value: false, label: 'Does not have Google Analytics' },
  ];
  return {
    defaultValue,
    title: t('Google Analytics'),
    icon: SearchEngineIcon,
    editor: OptionEditor,
    editorProps: { items },
    labelFunc: oneOfOptions(items),
  };
};

export default getData;
