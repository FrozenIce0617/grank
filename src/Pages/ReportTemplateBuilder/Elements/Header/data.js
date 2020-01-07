// @flow
import { HEADER } from 'Types/ReportElement';
import type { Header } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import HeaderEditor from '.';

const defaultValue: Header = {
  id: '',
  type: HEADER,
  showLogotype: false,
};

const elementData = {
  defaultValue,
  editor: HeaderEditor,
  getTitle: () => t('Header'),
  getDescription: () => t('Show the report header. Can include your logo'),
};

export default elementData;
