import moment from 'moment';
import { formatDate, roundNumber } from '../../Utilities/format';

export const populateDataWithZeros = (data, startDate, endDate) => {
  data = data || [];
  const dateMap = data.reduce((acc, item) => {
    acc[item.date] = item;
    return acc;
  }, {});

  const days = Math.abs(moment(startDate).diff(moment(endDate), 'days')) + 1;
  return Array.from(Array(days).keys()).map(numDays => {
    const date = moment(startDate)
      .add(numDays, 'day')
      .toDate();
    const dateString = formatDate(date);
    return {
      date: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      amount: dateMap[dateString] ? roundNumber(dateMap[dateString].amount, 1) : 0,
    };
  });
};
