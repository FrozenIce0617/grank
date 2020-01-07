// @flow
import StarIcon from 'icons/star.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { StarredFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import OptionEditor from 'Components/Filters/Common/OptionEditor';
import { oneOfOptions } from 'Components/Filters/Common/labelFunc';

export const defaultValue: StarredFilter = {
  attribute: FilterAttribute.STARRED,
  type: FilterValueType.BOOL,
  comparison: FilterComparison.EQ,
  value: false,
};

const getData = () => {
  const items = [
    { value: true, label: t('Is starred'), icon: StarIcon, iconClassName: 'star-filled' },
    { value: false, label: t('Is not starred'), icon: StarIcon },
  ];

  return {
    defaultValue,
    title: t('Starred'),
    icon: StarIcon,
    editor: OptionEditor,
    editorProps: { items },
    tableEditor: OptionEditor,
    tableEditorProps: {
      items,
      iconDropdown: true,
      noFilterIcon: StarIcon,
    },
    labelFunc: oneOfOptions(items),
  };
};

export default getData;
