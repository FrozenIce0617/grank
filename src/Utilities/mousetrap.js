// @flow
import _Mousetrap from 'mousetrap';
const Mousetrap = _Mousetrap();

const bindings: { [string]: string } = {};
let isPaused = false;

const orgStopCallback = Mousetrap.stopCallback;

Mousetrap.stopCallback = (e, element, combo) => {
  if (isPaused) return true;

  return orgStopCallback(e, element, combo);
};

export const bind = (
  combination: string,
  description: string,
  callback: Function,
  action?: string,
) => {
  bindings[combination] = description;
  return Mousetrap.bind(combination, callback, action);
};

export const unbind = (combination: Array<string>) => Mousetrap.unbind(combination);

export const getBindings = () => ({ ...bindings });

export const pause = () => (isPaused = true);
export const unpause = () => (isPaused = false);

export default { bind, unbind, getBindings, pause, unpause };
