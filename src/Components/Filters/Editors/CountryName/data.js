// @flow
import CountryIcon from 'icons/location.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { CountryNameFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';
import { stringLabelFunc } from 'Components/Filters/Common/labelFunc';

export const defaultValue: CountryNameFilter = {
  attribute: FilterAttribute.COUNTRY_NAME,
  type: FilterValueType.STRING,
  comparison: FilterComparison.CONTAINS,
  value: '',
};

const getData = () => ({
  defaultValue,
  title: t('Country'),
  icon: CountryIcon,
  editor: StringEditor,
  editorProps: { placeholder: t('Enter the country') },
  labelFunc: stringLabelFunc,
});

export default getData;
