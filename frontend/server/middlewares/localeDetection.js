const geoip = require('geoip-lite');

const config = require('./../utils/config');

function getBrowserLocales(req) {
  const locales = req.headers['accept-language'];
  if (!locales) return [];

  return locales
    .split(/[;,]/)
    .filter(lng => !lng.includes('='))
    .map(lng => lng.toLowerCase());
}

function getIpLocale(req) {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0] ||
    req.headers['x-appengine-user-ip'] ||
    req.socket.remoteAddress;

  console.log('IP:', ip);

  const geo = geoip.lookup(ip);
  if (!geo) return null;

  const country = geo.country.toLowerCase();
  console.log('IP:', ip);
  console.log('Country:', country);

  const code = config.GEOIP_MAPPING[country];
  return code;
}

function selectLocale(
  locales,
  supportedLocales,
  fallbackLocale,
  matchSameLanguage = true
) {
  const getLocaleLanguage = locale => locale.split('-')[0];
  const getLocaleListLanguages = localeList =>
    localeList.map(getLocaleLanguage);

  // Include partial matches (eg. 'es-ES' or 'es' for 'es' / 'en', 'en-US' or 'en-GB' for 'en-US')
  let sameLanguageLocale;
  if (matchSameLanguage) {
    // Keep the user's language preference order
    const userPreferedLanguageMatch = locales.find(locale =>
      getLocaleListLanguages(supportedLocales).includes(
        getLocaleLanguage(locale)
      )
    );

    sameLanguageLocale =
      userPreferedLanguageMatch &&
      supportedLocales.find(
        locale =>
          getLocaleLanguage(userPreferedLanguageMatch) ===
          getLocaleLanguage(locale)
      );
  }

  // Find exact match only (eg. only 'es' for 'es' / only 'en-US' for 'en-US')
  const exactLocale = locales.find(locale => supportedLocales.includes(locale));
  return sameLanguageLocale || exactLocale || fallbackLocale;
}

function getInitialLocale(req) {
  const supportedLocales = config.LOCALES;
  const defaultLocale = config.DEFAULT_LOCALE;
  console.log('Default locale:', defaultLocale);
  console.log('Supported locales:', supportedLocales);
  let chosenLocale = defaultLocale;

  if (
    config.USE_GEOIP_LOCALE &&
    config.GEOIP_MAPPING &&
    Object.keys(config.GEOIP_MAPPING).length
  ) {
    const ipLocale = getIpLocale(req);
    console.log('GEOIP locale:', ipLocale);
    if (ipLocale)
      chosenLocale = selectLocale([ipLocale], supportedLocales, defaultLocale);
  } else if (config.USE_BROWSER_LOCALE) {
    const browserLocales = getBrowserLocales(req);
    console.log('Browser locales:', browserLocales);
    chosenLocale = selectLocale(
      browserLocales,
      supportedLocales,
      defaultLocale
    );
  }

  console.log('Chosen locale:', chosenLocale);
  return chosenLocale;
}

module.exports = (req, res, next) => {
  if (
    req._parsedUrl.pathname === '/' &&
    (config.USE_BROWSER_LOCALE || config.USE_GEOIP_LOCALE)
  ) {
    const initialLocale = getInitialLocale(req);
    const searchQuery = req._parsedUrl.search;
    const pathQuery =
      searchQuery && searchQuery.match(/^\?/) ? searchQuery : '';

    if (initialLocale === config.DEFAULT_LOCALE) next();
    else {
      res.writeHead(301, { Location: `/${initialLocale}${pathQuery}` });
      res.end();
    }
  } else {
    next();
  }
};
