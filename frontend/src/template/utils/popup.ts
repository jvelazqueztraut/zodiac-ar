export function openPopup(url: string, width = 940, height = 585) {
  const left = window.innerWidth / 2 - width / 2;
  const top = window.innerHeight / 2 - height / 2;

  const params = `
    menuBar=0,location=0,status=0,scrollbars=0,resizable=0,directories=0,toolbar=0,titlebar=0,
    width=${width},height=${height},top=${top},left=${left}
  `;

  return window.open(url, null, params);
}
