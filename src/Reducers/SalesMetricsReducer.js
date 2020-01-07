// @flow
import {
  SET_METRICS_RANGE,
  SET_METRICS_INTERVAL,
  SET_ACTIVE_METRICS_RR,
  SET_METRICS_MANAGER,
  SET_ACTIVE_METRICS_PLAN,
} from 'Actions/SalesMetricsAction';
import type { Action } from 'Actions/SalesMetricsAction';

import type { MetricsRangeType, SalesManagerType } from 'Types/SalesMetrics';
import type { SwitchEl } from 'Components/Switch/types';

export type State = {
  +interval: string,
  +metricsRange: MetricsRangeType,
  +recurringRevenueMetrics: Array<SwitchEl>,
  +plansMetrics: Array<SwitchEl>,
  +manager: boolean | SalesManagerType,
};

const initialState: State = {
  interval: 'Month',
  metricsRange: {
    // todo revert this when the range works again.
    // from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    from: new Date('2013-05-01'),
    to: new Date(),
    compareFrom: new Date('2018-02-01'),
    compareTo: new Date('2018-03-01'),
  },
  recurringRevenueMetrics: [
    { id: 1, name: 'MRR', active: true },
    { id: 12, name: 'ARR', active: false },
  ],
  plansMetrics: [
    { id: 'count', name: 'Count', active: true },
    { id: 'mrr', name: 'MRR', active: false },
    { id: 'mrr_percent', name: 'MRR in %', active: false },
  ],
  manager: false,
};

export default function(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SET_METRICS_RANGE: {
      return {
        ...state,
        metricsRange: action.range,
      };
    }

    case SET_METRICS_INTERVAL: {
      return {
        ...state,
        interval: action.interval,
      };
    }

    case SET_ACTIVE_METRICS_RR: {
      return {
        ...state,
        recurringRevenueMetrics: state.recurringRevenueMetrics.map(el => ({
          ...el,
          active: el.id === action.el.id,
        })),
      };
    }

    case SET_ACTIVE_METRICS_PLAN: {
      return {
        ...state,
        plansMetrics: state.plansMetrics.map(el => ({
          ...el,
          active: el.id === action.el.id,
        })),
      };
    }

    case SET_METRICS_MANAGER:
      return {
        ...state,
        manager: action.id,
      };

    default:
      return state;
  }
}
