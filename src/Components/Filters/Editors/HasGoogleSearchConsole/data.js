// @flow
import SearchIcon from 'icons/search.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { HasGoogleSearchConsoleFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import { oneOfOptions } from 'Components/Filters/Common/labelFunc';

export const defaultValue: HasGoogleSearchConsoleFilter = {
  attribute: FilterAttribute.HAS_GOOGLE_SEARCH_CONSOLE,
  type: FilterValueType.BOOL,
  comparison: FilterComparison.EQ,
  value: false,
};

const getData = () => {
  const items = [
    { value: true, label: t('Has Google Search Console') },
    { value: false, label: t('Does not have Google Search Console') },
  ];
  return {
    defaultValue,
    title: t('Google Search Console'),
    icon: SearchIcon,
    editor: OptionEditor,
    editorProps: { items },
    labelFunc: oneOfOptions(items),
  };
};

export default getData;
