//@flow
import moment from 'moment';
import { isString } from 'lodash';

type Domain = {
  id: string,
  domain: string,
  displayName?: string,
};

export const formatDomain = ({ domain, displayName }: Domain) =>
  displayName ? `${displayName} (${domain})` : domain;

export const formatDomainOption = (domain: Domain) => ({
  label: formatDomain(domain),
  value: domain.id,
});

/**
 * [roundNumber]
 * @param  {Number} n
 * @param  {Number?} decimals
 * @return {Number}
 *
 * @example 67.4568958649596 -> 67.5
 */
export const roundNumber = (n: number, decimals: number = 0) =>
  // $FlowFixMe
  isNaN(n) ? n : Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);

/**
 * [evolution]
 * @param  {Number} pre
 * @param  {Number} cur
 * @return {Number}
 */
export const evolution = (pre: number, cur: number) =>
  pre !== 0 ? ((cur - pre) / pre) * 100 : cur === 0 ? 0 : 100;

/**
 * [renamePropKey]
 * @param  {String} oldKey
 * @param  {String} newKey
 * @param  {Object} obj
 * @return {Object}
 *
 * @example ('a', 'b', { a: 5 }) -> { b: 5 }
 */
// prettier-ignore
export const renamePropKey = (oldKey: string, newKey: string, { [oldKey]: old, ...obj }: Object) => ({
  [newKey]: old,
  ...obj,
});

/**
 * [formatDate]
 * @param  {Date} date
 * @return {String}
 *
 * @example Tue Jun 12 2018 13:44:18 GMT+0200 -> '2018-06-12'
 */
export const formatDate = (date?: Date | string | null): string => {
  if (date == null) {
    return '';
  }

  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    if (date === 'latest' || date === 'earliest') {
      return date;
    }

    console.error(`The date (${date.toString()}) is not valid`);
    return '';
  }

  return momentDate.format('YYYY-MM-DD');
};

export const toggleElInArr = (arr: Array<string>, val: string, keepIfExists: boolean = false) =>
  arr.includes(val) ? arr.filter(el => (keepIfExists ? el : el !== val)) : [...arr, val];
