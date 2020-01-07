// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { UserNameFilter } from 'Types/Filter';
import NameIcon from 'icons/keywords.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';

export const defaultValue: UserNameFilter = {
  attribute: FilterAttribute.USER_NAME,
  type: FilterValueType.STRING,
  comparison: FilterComparison.EQ,
  value: '',
};

const comparisonOptions = [
  FilterComparison.EQ,
  FilterComparison.NE,
  FilterComparison.CONTAINS,
  FilterComparison.NOT_CONTAINS,
  FilterComparison.STARTS_WITH,
  FilterComparison.ENDS_WITH,
];

const getData = () => ({
  defaultValue,
  title: t('Name'),
  icon: NameIcon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter the users name'),
    comparisonOptions,
  },
  labelFunc: stringLabelFunc,
});

export default getData;
