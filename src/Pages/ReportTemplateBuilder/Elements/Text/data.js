// @flow
import { TEXT } from 'Types/ReportElement';
import type { Text } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import TextEditor from '.';

const defaultValue: Text = {
  id: '',
  type: TEXT,
  text: '',
};

const elementData = {
  defaultValue,
  editor: TextEditor,
  getTitle: () => t('Text'),
  getDescription: () => t('Insert a custom text'),
};

export default elementData;
