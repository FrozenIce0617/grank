// @flow
import Icon from 'icons/rank.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { ShareOfVoiceChangeFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import NumberChangeEditor from 'Components/Filters/Common/NumberChangeEditor';
import NoFilterIcon from 'icons/no-filter.svg?inline';

export const defaultValue: ShareOfVoiceChangeFilter = {
  attribute: FilterAttribute.SHARE_OF_VOICE_CHANGE,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.LT,
  value: 0,
};

export const labelFunc = (filter: ShareOfVoiceChangeFilter) => {
  if (filter.comparison === FilterComparison.EQ) {
    return t('Did not change');
  }
  const filterValue = filter.value === 0 ? 1 : filter.value;
  if (filter.comparison === FilterComparison.GT) {
    return t('Moved up by %s or more', filterValue);
  }
  return t('Moved down by %s or more', filterValue);
};

const getData = () => ({
  defaultValue,
  title: t('Share of Voice change'),
  icon: Icon,
  editor: NumberChangeEditor,
  editorProps: {
    isReversed: false,
  },
  tableEditor: NumberChangeEditor,
  tableEditorProps: {
    iconDropdown: true,
    isReversed: false,
    noFilterIcon: NoFilterIcon,
  },
  labelFunc,
});

export default getData;
