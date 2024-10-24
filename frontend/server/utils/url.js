module.exports = {
  isRouteUrl: function (url) {
    return (
      url.indexOf('.') === -1 &&
      !url.startsWith('/_next/') &&
      !url.startsWith('/build/')
    );
  },

  isDataUrl: function (url) {
    return !!url.match(/^\/_next\/data\/[a-z]+\/.+\.json/);
  },

  prefixRouteUrl: function (url, langCode) {
    const newUrl = `/${langCode}${url}`;
    if (newUrl !== '/' && newUrl.endsWith('/')) {
      return newUrl.substring(0, newUrl.length - 1);
    }
    return newUrl;
  },

  prefixDataUrl: function (url, langCode) {
    const index = url.lastIndexOf('/');
    const part1 = url.substring(0, index);
    const part2 = url.substring(index);
    return `${part1}/${langCode}${part2}`;
  },
};
