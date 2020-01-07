// @flow
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { DomainFilter } from 'Types/Filter';
import KeywordsIcon from 'icons/keywords.svg?inline';
import { t } from 'Utilities/i18n/index';
import StringEditor from 'Components/Filters/Common/StringEditor';

export const defaultValue: DomainFilter = {
  attribute: FilterAttribute.DOMAIN,
  type: FilterValueType.STRING,
  comparison: FilterComparison.CONTAINS,
  value: '',
};

const getData = () => ({
  defaultValue,
  title: t('Domain'),
  icon: KeywordsIcon,
  editor: StringEditor,
  editorProps: {
    placeholder: t('Enter the domain name'),
  },
  labelFunc: (filter: DomainFilter) => t('contains %s', filter.value),
});

export default getData;
