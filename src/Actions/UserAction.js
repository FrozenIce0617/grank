export const CHANGE_LANGUAGE = 'change_language';
export const ENABLE_LOCALE_DEBUG = 'enable_locale_debug';
export const DISABLE_LOCALE_DEBUG = 'disable_locale_debug';
export const CHANGE_IS_PARTNER = 'change_is_partner';

export const UPDATE_USER_SETTINGS = 'update_user_setting';
export const UPDATE_USER_NEWS = 'update_user_news';
export const UPDATE_USER_FEEDBACK = 'update_user_feedback';
export const UPDATE_USER_GOOGLE_CONNECTIONS = 'update_user_google_connections';

export function updateUserSettings(userSettings) {
  return {
    type: UPDATE_USER_SETTINGS,
    userSettings,
  };
}

export function updateNews(news) {
  return {
    type: UPDATE_USER_NEWS,
    news,
  };
}

export function changeIsPartner(isPartner) {
  return {
    type: CHANGE_IS_PARTNER,
    isPartner,
  };
}

export function setLocaleDebug(enable = true) {
  return {
    type: enable ? ENABLE_LOCALE_DEBUG : DISABLE_LOCALE_DEBUG,
  };
}

export function changeLanguage(language) {
  return {
    type: CHANGE_LANGUAGE,
    language,
  };
}

export function updateUserGoogleConnections(googleConnections) {
  return {
    type: UPDATE_USER_GOOGLE_CONNECTIONS,
    googleConnections,
  };
}

export function updateUserFeedback() {
  return {
    type: UPDATE_USER_FEEDBACK,
  };
}
