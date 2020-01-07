// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { NoteFilter } from 'Types/Filter';
import NoteIcon from 'icons/notes.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';

export const defaultValue: NoteFilter = {
  attribute: FilterAttribute.NOTE,
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
  title: t('Note'),
  icon: NoteIcon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter note'),
    comparisonOptions,
  },
  labelFunc: stringLabelFunc,
});

export default getData;
