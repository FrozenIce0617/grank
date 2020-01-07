// @flow
import Icon from 'icons/users.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { VisitorsFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import { numberLabelFunc } from 'Components/Filters/Common/labelFunc';
import NumberEditor from 'Components/Filters/Common/NumberEditor';
import NoFilterIcon from 'icons/no-filter.svg?inline';

export const defaultValue: VisitorsFilter = {
  attribute: FilterAttribute.VISITORS,
  type: FilterValueType.NUMBER,
  comparison: FilterComparison.LT,
  value: 0,
};

const getData = () => ({
  defaultValue,
  title: t('Estimated Monthly Visitors'),
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
