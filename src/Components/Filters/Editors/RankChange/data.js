// @flow
import RankIcon from 'icons/rank.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { RankChangeFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import NumberChangeEditor from 'Components/Filters/Common/NumberChangeEditor';
import NoFilterIcon from 'icons/arrow-both-updown.svg?inline';

export const defaultValue = {
  attribute: FilterAttribute.RANK_CHANGE,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.LT,
  value: 0,
};

export const labelFunc = (filter: RankChangeFilter) => {
  if (filter.comparison === FilterComparison.EQ) {
    return t('Did not change');
  }

  const filterValue = filter.value === 0 ? 1 : filter.value;
  if (filter.comparison === FilterComparison.LT) {
    return t('Moved up by %s or more', filterValue);
  }
  return t('Moved down by %s or more', filterValue);
};

const getData = () => ({
  defaultValue,
  title: t('Rank change'),
  icon: RankIcon,
  editor: NumberChangeEditor,
  editorProps: {
    isReversed: true,
  },
  tableEditor: NumberChangeEditor,
  tableEditorProps: {
    iconDropdown: true,
    noFilterIcon: NoFilterIcon,
  },
  labelFunc,
});

export default getData;
