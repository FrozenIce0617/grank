import { createSelector } from 'reselect';

const languageSelector = state => state.user.language;

const convertLanguageToLocale = language => {
  switch (language) {
    case 'da':
      return 'da_DK';
    case 'en':
      return 'en_US';
    default:
      return language;
  }
};

export default createSelector(languageSelector, convertLanguageToLocale);
