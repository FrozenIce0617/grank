// @flow
import RankIcon from 'icons/rank.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { RankFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import { numberLabelFunc } from 'Components/Filters/Common/labelFunc';
import NumberEditor from 'Components/Filters/Common/NumberEditor';
import NoFilterIcon from 'icons/less-than.svg?inline';

export const defaultValue: RankFilter = {
  attribute: FilterAttribute.RANK,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.LT,
  value: 0,
};

const getData = () => ({
  defaultValue,
  title: t('Rank'),
  icon: RankIcon,
  editor: NumberEditor,
  tableEditor: NumberEditor,
  tableEditorProps: {
    iconDropdown: true,
    noFilterIcon: NoFilterIcon,
  },
  labelFunc: numberLabelFunc,
});

export default getData;
