//@flow
import { isEmpty, get, set, clone } from 'lodash';

export const toNestedReducer = (reducer: Function, getStatePath: Function) => (
  state: Object,
  action: Object,
) => {
  const statePath = getStatePath(action);
  const hasPath = !isEmpty(statePath);
  const stateByPath = hasPath ? get(state, statePath) : state;
  const reducerResult = reducer(stateByPath, action);
  return hasPath ? set(clone(state), statePath || [], reducerResult) : reducerResult;
};
