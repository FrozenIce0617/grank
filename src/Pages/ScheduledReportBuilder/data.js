import { t } from 'Utilities/i18n';

export const PDF = 1;
export const EXCEL = 2;
export const CSV = 3;
export const PUBLIC_REPORT = 4;
export const GOOGLE_SHEETS = 5;

export const getReportTypeOptions = () => [
  { value: PDF, label: t('PDF') },
  { value: EXCEL, label: t('Excel') },
  { value: CSV, label: t('CSV') },
  { value: GOOGLE_SHEETS, label: t('Google Sheets') },
  { value: PUBLIC_REPORT, label: t('Public report') },
];

export const getScheduledReportTypeOptions = () => [
  { value: PDF, label: t('PDF') },
  { value: EXCEL, label: t('Excel') },
  { value: CSV, label: t('CSV') },
  { value: GOOGLE_SHEETS, label: t('Google Sheets') },
];

export const getLanguageOptions = () => [
  { value: 'da', label: t('Danish') },
  { value: 'en', label: t('English') },
];

export const getDefaultEmailSubject = () => t('Scheduled AccuRanker report');
export const getDefaultEmailBody = () => t('Hi,\n\nYour scheduled AccuRanker report is attached.');
