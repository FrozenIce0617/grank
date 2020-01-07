import {
  CHANGE_LANGUAGE,
  DISABLE_LOCALE_DEBUG,
  ENABLE_LOCALE_DEBUG,
  CHANGE_IS_PARTNER,
  UPDATE_USER_SETTINGS,
  UPDATE_USER_NEWS,
  UPDATE_USER_GOOGLE_CONNECTIONS,
  UPDATE_USER_FEEDBACK,
} from '../Actions/UserAction';

const initialState = {
  email: null,
  fullName: null,
  isOrgAdmin: false,
  language: null,
  organization: {
    isPartner: false,
  },
};

export default function(state = initialState, action) {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return { ...state, language: action.language };
    case ENABLE_LOCALE_DEBUG:
      return { ...state, debug: true };
    case DISABLE_LOCALE_DEBUG:
      return { ...state, debug: false };
    case CHANGE_IS_PARTNER:
      return { ...state, organization: { ...state.organization, isPartner: action.isPartner } };
    case UPDATE_USER_SETTINGS:
      return { ...state, ...action.userSettings };
    case UPDATE_USER_GOOGLE_CONNECTIONS:
      return { ...state, googleConnections: action.googleConnections };
    case UPDATE_USER_NEWS:
      return {
        ...state,
        news: {
          ...state.news,
          ...action.news,
        },
      };
    case UPDATE_USER_FEEDBACK:
      return {
        ...state,
        unansweredFeedback: null,
      };
    default:
      return state;
  }
}
