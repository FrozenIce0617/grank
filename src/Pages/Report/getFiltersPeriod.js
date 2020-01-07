//@flow
import type { FilterBase } from 'Types/Filter';
import moment from 'moment';
import { capitalizeFirstChar } from 'Utilities/underdash';
import { FilterAttribute } from 'Types/Filter';

const getFiltersPeriod = (filters: FilterBase[]) => {
  let from = '';
  let to = '';
  const periodFilter = filters.find(filter => filter.attribute === FilterAttribute.PERIOD);
  if (periodFilter && periodFilter.attribute === FilterAttribute.PERIOD) {
    const parts = JSON.parse(periodFilter.value);
    from = moment(parts[0]).format('MMM. D, YYYY');
    to = moment(parts[1]).format('MMM. D, YYYY');
    from = capitalizeFirstChar(from);
    to = capitalizeFirstChar(to);
  }
  return `${from} - ${to}`;
};

export default getFiltersPeriod;
