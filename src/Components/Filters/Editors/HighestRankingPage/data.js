// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { HighestRankingPageFilter } from 'Types/Filter';
import Icon from 'icons/highest-rankings.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';
import NoFilterIcon from 'icons/no-filter.svg?inline';

export const defaultValue: HighestRankingPageFilter = {
  attribute: FilterAttribute.HIGHEST_RANKING_PAGE,
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
  title: t('URL'),
  icon: Icon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter URL'),
    comparisonOptions,
  },
  tableEditor: StringEditor,
  tableEditorProps: {
    placeholder: t('URL'),
    comparisonOptions,
    showComparisonOptions: false,
    noFilterIcon: NoFilterIcon,
  },
  labelFunc: stringLabelFunc,
});

export default getData;
