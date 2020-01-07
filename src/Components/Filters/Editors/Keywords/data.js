// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { KeywordFilter } from 'Types/Filter';
import KeywordsIcon from 'icons/keywords.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';
import NoFilterIcon from 'icons/no-filter.svg?inline';

export const defaultValue: KeywordFilter = {
  attribute: FilterAttribute.KEYWORD,
  type: FilterValueType.STRING,
  comparison: FilterComparison.CONTAINS,
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
  title: t('Keywords'),
  icon: KeywordsIcon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter the keyword'),
    comparisonOptions,
  },
  tableEditor: StringEditor,
  tableEditorProps: {
    placeholder: t('Keyword'),
    comparisonOptions,
    showComparisonOptions: false,
    noFilterIcon: NoFilterIcon,
  },
  labelFunc: stringLabelFunc,
});

export default getData;
