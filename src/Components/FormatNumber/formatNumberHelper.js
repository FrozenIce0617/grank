// @flow
const ONE_MILLION = 1000000;
const ONE_THOUSAND = 1000;
const ONE_HUNDRED = 100;

const removeTrailingZeroes = (value: string) => value.replace(/\.?0+$/, '');

const formatNumberHelper = ({
  value,
  precision,
  percentage,
  thousandsSettings,
  millionsSettings,
  hasSpaceBetweenNumberAndLabel,
  intlFormatNumber = v => v,
}) => {
  const spaceBetweenNumberAndLabel = hasSpaceBetweenNumberAndLabel ? ' ' : '';

  if (millionsSettings && value >= millionsSettings.millionsCutoff) {
    const millions = Math.round((value / ONE_MILLION) * ONE_HUNDRED) / ONE_HUNDRED;
    const val = removeTrailingZeroes(millions.toFixed(precision));
    return `${val}${spaceBetweenNumberAndLabel}${millionsSettings.millionsLabel}`;
  }
  if (thousandsSettings && value >= thousandsSettings.thousandsCutoff) {
    const thousands = Math.round((value / ONE_THOUSAND) * ONE_HUNDRED) / ONE_HUNDRED;
    const val = removeTrailingZeroes(thousands.toFixed(precision));
    return `${val}${spaceBetweenNumberAndLabel}${thousandsSettings.thousandsLabel}`;
  }
  if (percentage) {
    return intlFormatNumber(value / 100, {
      style: 'percent',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  }
  return intlFormatNumber(value.toFixed(precision));
};

export default formatNumberHelper;
