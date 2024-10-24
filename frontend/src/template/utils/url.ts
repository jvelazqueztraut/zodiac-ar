import { fromPairs } from 'lodash';

export const parseUrlQuery = (
  url = window.location.search
): Record<string, string> =>
  fromPairs(
    url
      .replace('?', '')
      .split('&')
      .filter(Boolean)
      .map(parameter => parameter.split('='))
  );

export const toUrlQuery = (data: Record<string, any>) =>
  Object.entries(data).reduce(
    (acc, [key, value], index) =>
      `${acc}${index !== 0 ? '&' : ''}${key}=${String(value)}`,
    ''
  );

export const checkQuery = (query: string) => {
  const url = window.location.href;
  if (url.indexOf('?' + query + '=') !== -1) return true;
  else if (url.indexOf('&' + query + '=') !== -1) return true;
  return false;
};

export const openInNewWindow = (link: string) => {
  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const toDataURL = async (url: string) => {
  const response = await fetch(url);
  const data = await response.blob();

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });

  return dataUrl;
};

export const getUrlParams = () => new URLSearchParams(window.location.search);
