// @flow
import Icon from 'icons/devices.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType, DESKTOP, MOBILE } from 'Types/Filter';
import type { SearchTypeFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import { oneOfOptions } from 'Components/Filters/Common/labelFunc';
import { Monitor, Mobile } from 'Pages/Keywords/Table/Icon/Icons';

export const defaultValue: SearchTypeFilter = {
  attribute: FilterAttribute.SEARCH_TYPE,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.EQ,
  value: DESKTOP,
};

const getData = () => {
  const items = [
    { value: DESKTOP, label: t('Desktop'), icon: Monitor },
    { value: MOBILE, label: t('Mobile'), icon: Mobile },
  ];
  return {
    defaultValue,
    title: t('Device type'),
    icon: Icon,
    editor: OptionEditor,
    editorProps: { items },
    tableEditor: OptionEditor,
    tableEditorProps: {
      items,
      iconDropdown: true,
      noFilterIcon: Icon,
    },
    labelFunc: oneOfOptions(items),
  };
};

export default getData;
