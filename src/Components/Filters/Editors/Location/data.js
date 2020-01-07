// @flow
import LocationIcon from 'icons/location.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { LocationFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';
import NoFilterIcon from 'icons/no-filter.svg?inline';

export const defaultValue: LocationFilter = {
  attribute: FilterAttribute.LOCATION,
  type: FilterValueType.STRING,
  comparison: FilterComparison.CONTAINS,
  value: '',
};

const getData = () => ({
  defaultValue,
  title: t('Location'),
  icon: LocationIcon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter the location'),
  },
  tableEditor: StringEditor,
  tableEditorProps: {
    placeholder: t('Location'),
    noFilterIcon: NoFilterIcon,
  },
  labelFunc: stringLabelFunc,
});

export default getData;
