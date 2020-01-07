// @flow
import SearchEngineIcon from 'icons/window-search.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { SearchEngineFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import { oneOfOptions } from 'Components/Filters/Common/labelFunc';
import { Bing, Google } from 'Pages/Keywords/Table/Icon/Icons';

export const defaultValue: SearchEngineFilter = {
  attribute: FilterAttribute.SEARCH_ENGINE,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.EQ,
  value: 1,
};

const getData = () => {
  const items = [
    { value: 1, label: t('Google'), icon: Google },
    { value: 2, label: t('Bing'), icon: Bing },
    // { value: 3, label: t('Yahoo') },
  ];
  return {
    defaultValue,
    title: t('Search engine'),
    icon: SearchEngineIcon,
    editor: OptionEditor,
    editorProps: { items },
    tableEditor: OptionEditor,
    tableEditorProps: {
      items,
      iconDropdown: true,
      noFilterIcon: SearchEngineIcon,
    },
    labelFunc: oneOfOptions(items),
  };
};

export default getData;
