// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { DisplayNameFilter } from 'Types/Filter';
import KeywordsIcon from 'icons/keywords.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';

export const defaultValue: DisplayNameFilter = {
  attribute: FilterAttribute.DISPLAY_NAME,
  type: FilterValueType.STRING,
  comparison: FilterComparison.CONTAINS,
  value: '',
};

const getData = () => ({
  defaultValue,
  title: t('Display name'),
  icon: KeywordsIcon,
  editor: StringEditor,
  editorProps: { placeholder: t('Enter the display name') },
  labelFunc: stringLabelFunc,
});

export default getData;
