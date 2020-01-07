// @flow
import Icon from 'icons/rank.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { ShareOfVoiceFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import { numberLabelFunc } from 'Components/Filters/Common/labelFunc';
import NumberEditor from 'Components/Filters/Common/NumberEditor';
import NoFilterIcon from 'icons/no-filter.svg?inline';

export const defaultValue: ShareOfVoiceFilter = {
  attribute: FilterAttribute.SHARE_OF_VOICE,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.LT,
  value: 0,
};

const getData = () => ({
  defaultValue,
  title: t('Share of Voice'),
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
