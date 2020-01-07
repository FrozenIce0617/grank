// @flow
import { HEADLINE } from 'Types/ReportElement';
import type { Headline } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import HeadlineEditor from '.';

const defaultValue: Headline = {
  id: '',
  type: HEADLINE,
  text: '',
};

const elementData = {
  defaultValue,
  editor: HeadlineEditor,
  getTitle: () => t('Headline'),
  getDescription: () => t('Insert a custom headline'),
};

export default elementData;
