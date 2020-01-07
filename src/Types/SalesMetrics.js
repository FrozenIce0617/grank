//@flow
export type MetricsRangeType = {
  from: Date,
  to: Date,
  compareFrom: Date,
  compareTo: Date,
};

export type SalesManagerType = {
  id: string | number,
  name: string,
  active?: boolean,
};
