import { isBrowser } from './platform';

export const debounce = (
  fn: (...args: any[]) => void,
  delay = 250,
  hasLeadingCall = false,
  hasTrailingCall = false
) => {
  let timeout: number;

  const cancel = () => {
    if (isBrowser()) window.clearTimeout(timeout);
    timeout = null;
  };

  const debounced = (...args: any[]) => {
    const shouldCallNow = hasLeadingCall && !timeout;
    const doLater = () => {
      timeout = null;

      if (!hasLeadingCall) fn(...args);
      if (hasTrailingCall) {
        timeout = !isBrowser()
          ? 0
          : window.setTimeout(() => {
              timeout = null;
              fn(...args);
            }, delay);
      }
    };

    if (isBrowser()) window.clearTimeout(timeout);
    timeout = !isBrowser() ? 0 : window.setTimeout(doLater, delay);

    if (shouldCallNow) fn(...args);
  };

  debounced.cancel = cancel;
  return debounced;
};
