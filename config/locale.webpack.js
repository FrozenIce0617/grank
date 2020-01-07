const path = require('path');
const fs = require('fs');

let localePath = '../../../';
if (
  process.env.NODE_ENV === 'fakeapi' ||
  process.env.NODE_ENV === 'dev-staging' ||
  process.env.NODE_ENV === 'dev-local' ||
  process.env.NODE_ENV === 'illia-dev'
) {
  localePath = '../fake';
}

const resolveLocale = entry => {
  const localEntry = entry;
  const localeCatalogPath = path.join(__dirname, localePath, 'locale', 'catalogs.json');
  const localeCatalog = JSON.parse(fs.readFileSync(localeCatalogPath, 'utf8'));
  const localeEntries = [];
  localeCatalog.supported_locales.forEach(locale => {
    if (locale === 'en') return;

    // Django locale names are "zh_CN", moment's are "zh-cn"
    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    localEntry[`locale/${normalizedLocale}`] = [
      `moment/locale/${normalizedLocale}`,
      `grank-locale/${locale}/LC_MESSAGES/djangojs.po`, // relative to static/sentry
    ];
    localeEntries.push(`locale/${normalizedLocale}`);
  });

  return { localeEntries, localeCatalog };
};

module.exports = {
  resolveLocale,
};
