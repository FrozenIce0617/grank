// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { HighestRankingPageMatchFilter } from 'Types/Filter';
import Icon from 'icons/link.svg?inline';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import { matchingPageComparisonLabelFunc } from 'Components/Filters/Common/labelFunc';
import CircleIcon from 'icons/circle.svg?inline';

export const defaultValue: HighestRankingPageMatchFilter = {
  attribute: FilterAttribute.HIGHEST_RANKING_PAGE_MATCH,
  type: FilterValueType.STRING,
  comparison: FilterComparison.EQ,
  value: '',
};

const getData = () => {
  const items = [
    {
      value: FilterComparison.EQ,
      label: t('Correct URL'),
      icon: CircleIcon,
      iconClassName: 'url-status-correct',
    },
    {
      value: FilterComparison.NE,
      label: t('Incorrect URL'),
      icon: CircleIcon,
      iconClassName: 'url-status-incorrect',
    },
    {
      value: FilterComparison.NOT_CONTAINS,
      label: t('Preferred URL not set'),
      icon: CircleIcon,
      iconClassName: 'url-status-not-set',
    },
  ];
  return {
    defaultValue,
    title: t('Preferred URL match'),
    icon: Icon,
    editor: OptionEditor,
    editorProps: {
      items,
      name: 'comparison',
    },
    tableEditor: OptionEditor,
    tableEditorProps: {
      items,
      name: 'comparison',
      iconDropdown: true,
      noFilterIcon: CircleIcon,
    },
    labelFunc: matchingPageComparisonLabelFunc,
  };
};

export default getData;
