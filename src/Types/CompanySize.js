export const companySizesMap = {
  1: [1, 1],
  2: [2, 15],
  3: [16, 50],
  4: [51, 200],
  5: [201, 1000],
  6: [1000, Number.MAX_SAFE_INTEGER],
};

export const filterCompanySizesOptions = (options, filterString) => {
  if (!filterString) {
    return options;
  }

  const num = Number(filterString);
  const item = Object.entries(companySizesMap).find(([_, [from, to]]) => num >= from && num <= to);
  if (!~item) {
    return [];
  }

  const result = options.find(option => option.value === item[0]);
  if (!~result) {
    return [];
  }

  return [result];
};
