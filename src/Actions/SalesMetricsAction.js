//@flow
import moment from 'moment';

import type { MetricsRangeType } from 'Types/SalesMetrics';
import type { SwitchEl } from 'Components/Switch/types';

export const SET_METRICS_RANGE = 'set_metrics_range';
export const SET_METRICS_INTERVAL = 'SET_METRICS_INTERVAL';
export const SET_ACTIVE_METRICS_RR = 'SET_ACTIVE_METRICS_RR';
export const SET_ACTIVE_METRICS_PLAN = 'SET_ACTIVE_METRICS_PLAN';
export const SET_METRICS_MANAGER = 'SET_METRICS_MANAGER';

type SetMetricsRange = {
  type: typeof SET_METRICS_RANGE,
  range: MetricsRangeType,
};

type SetMetricsInterval = {
  type: typeof SET_METRICS_INTERVAL,
  interval: string,
};

type SetActiveMetricsRR = {
  type: typeof SET_ACTIVE_METRICS_RR,
  el: SwitchEl,
};

type SetActiveMetricsPlan = {
  type: typeof SET_ACTIVE_METRICS_PLAN,
  el: SwitchEl,
};

type SetMetricsManager = {
  type: typeof SET_METRICS_MANAGER,
  id: number,
};

export type Action =
  | SetMetricsRange
  | SetMetricsInterval
  | SetActiveMetricsRR
  | SetActiveMetricsPlan
  | SetMetricsManager;

export function setMetricsRange(range: MetricsRangeType): SetMetricsRange {
  return {
    type: SET_METRICS_RANGE,
    range,
  };
}

export function setMetricsInterval(interval: string): SetMetricsInterval {
  return {
    type: SET_METRICS_INTERVAL,
    interval,
  };
}

export function setActiveMetricsRR(el: SwitchEl): SetActiveMetricsRR {
  return {
    type: SET_ACTIVE_METRICS_RR,
    el,
  };
}

export const setActiveMetricsPlan = (el: SwitchEl): SetActiveMetricsPlan => ({
  type: SET_ACTIVE_METRICS_PLAN,
  el,
});

export function setMetricsManager(id: number): SetMetricsManager {
  return {
    type: SET_METRICS_MANAGER,
    id,
  };
}
