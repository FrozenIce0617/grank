// @flow
import moment from 'moment';
import { t } from 'Utilities/i18n';
import { LATEST, EARLIEST } from './model';

export const getButtonsConfigs = (withoutLabels: boolean = false) => [
  {
    id: 'yesterday',
    label: !withoutLabels ? t('Yesterday') : '',
    getRange: () => {
      const yesterday = moment(new Date())
        .subtract(1, 'days')
        .toDate();
      return { from: yesterday, to: LATEST };
    },
  },
  {
    id: 'last-week',
    label: !withoutLabels ? t('One week ago') : '',
    getRange: () => {
      const weekAgo = moment(new Date())
        .subtract(1, 'week')
        .toDate();
      return { from: weekAgo, to: LATEST };
    },
  },
  {
    id: 'last-two-weeks',
    label: !withoutLabels ? t('Two weeks ago') : '',
    getRange: () => {
      const twoWeeksAgo = moment(new Date())
        .subtract(2, 'week')
        .toDate();
      return { from: twoWeeksAgo, to: LATEST };
    },
  },
  {
    id: 'last-month',
    label: !withoutLabels ? t('One month ago') : '',
    getRange: () => {
      const lastMonth = moment(new Date())
        .subtract(1, 'month')
        .toDate();
      return { from: lastMonth, to: LATEST };
    },
  },
  {
    id: 'last-year',
    label: !withoutLabels ? t('One year ago') : '',
    getRange: () => {
      const lastYear = moment(new Date())
        .subtract(1, 'year')
        .toDate();
      return { from: lastYear, to: LATEST };
    },
  },
  {
    id: 'initial',
    label: !withoutLabels ? t('Initial') : '',
    getRange: () => ({ from: EARLIEST, to: LATEST }),
  },
];
