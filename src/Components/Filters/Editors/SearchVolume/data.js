// @flow
import Icon from 'icons/search-volume.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { SearchVolumeFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import { numberLabelFunc } from 'Components/Filters/Common/labelFunc';
import NumberEditor from 'Components/Filters/Common/NumberEditor';
import NoFilterIcon from 'icons/greater-than.svg?inline';

export const defaultValue: SearchVolumeFilter = {
  attribute: FilterAttribute.SEARCH_VOLUME,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.GT,
  value: 0,
};

const getData = () => ({
  defaultValue,
  title: t('Search volume'),
  icon: Icon,
  editor: NumberEditor,
  tableEditor: NumberEditor,
  tableEditorProps: {
    iconDropdown: true,
    noFilterIcon: NoFilterIcon,
  },
  labelFunc: numberLabelFunc,
});

export default getData;
