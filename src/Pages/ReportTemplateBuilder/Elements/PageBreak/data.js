// @flow
import { PAGE_BREAK } from 'Types/ReportElement';
import type { PageBreak } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import PageBreakEditor from '.';

const defaultValue: PageBreak = {
  id: '',
  type: PAGE_BREAK,
};

const elementData = {
  defaultValue,
  editor: PageBreakEditor,
  getTitle: () => t('Page Break'),
  getDescription: () => t('Insert a page break.'),
};

export default elementData;
