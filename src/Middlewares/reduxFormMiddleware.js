import { actionTypes } from 'redux-form';

const state = {};

// the case when React 16 breaks redux-form init-register-destroy order (as it relies on the lifecycle methods order)
// solution came from https://github.com/erikras/redux-form/issues/3435#issuecomment-359371803
// probably it will be fixed in the next versions of redux-form
export default () => next => action => {
  switch (action.type) {
    case actionTypes.DESTROY:
      state[action.meta.form] = (state[action.meta.form] || 0) - 1;
      if (state[action.meta.form] <= 0) {
        return next(action);
      }
      // Drop the action
      return false;
    case actionTypes.INITIALIZE:
      // bypass reinitialization
      if ('lastInitialValues' in action.meta) {
        return next(action);
      }

      state[action.meta.form] = (state[action.meta.form] || 0) + 1;
      return next(action);
    default:
      return next(action);
  }
};
