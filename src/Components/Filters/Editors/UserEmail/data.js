// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { UserEmailFilter } from 'Types/Filter';
import EmailIcon from 'icons/keywords.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';

export const defaultValue: UserEmailFilter = {
  attribute: FilterAttribute.USER_EMAIL,
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
  title: t('Email'),
  icon: EmailIcon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter the users email'),
    comparisonOptions,
  },
  labelFunc: stringLabelFunc,
});

export default getData;
