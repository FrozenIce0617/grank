/* eslint-disable no-unused-vars,import/prefer-default-export,arrow-parens,no-console */
import { setLocale, setLocaleDebug } from 'Utilities/i18n';
import { CHANGE_LANGUAGE, DISABLE_LOCALE_DEBUG, ENABLE_LOCALE_DEBUG } from 'Actions/UserAction';

export default store => next => action => {
  if (action.type === CHANGE_LANGUAGE) {
    setLocale(action.language);
  } else if (action.type === ENABLE_LOCALE_DEBUG) {
    setLocaleDebug(true);
  } else if (action.type === DISABLE_LOCALE_DEBUG) {
    setLocaleDebug(false);
  }
  next(action);
};
