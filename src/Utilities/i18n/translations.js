/* eslint-disable global-require,import/no-dynamic-require */
// zh-cn => zh_CN
function convertToDjangoLocaleFormat(language) {
  const [left, right] = language.split('-');
  return `${left}${right ? `_${right.toUpperCase()}` : ''}`;
}

export function translationsExist(language) {
  const convertedLanguage = convertToDjangoLocaleFormat(language);
  try {
    require(`grank-locale/${convertedLanguage}/LC_MESSAGES/djangojs.po`);
  } catch (e) {
    return false;
  }
  return true;
}

export function getTranslations(language) {
  const convertedLanguage = convertToDjangoLocaleFormat(language);

  if (translationsExist(language)) {
    return require(`grank-locale/${convertedLanguage}/LC_MESSAGES/djangojs.po`);
  }

  return {};
}
