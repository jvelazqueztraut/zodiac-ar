export const checkThirdParty = (
  scriptName: string,
  interval: number,
  callback: (...params: any[]) => any
) => {
  const checkScript = () => {
    if (window[scriptName]) {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }

      callback();
    }

    return !!window[scriptName];
  };

  if (!checkScript()) interval = window.setInterval(checkScript, 250);
};
