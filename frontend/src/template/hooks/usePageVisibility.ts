import { useEffect, useState } from 'react';

import { isBrowser } from 'template/utils/platform';

function usePageVisibility() {
  const [isVisible, setVisible] = useState<boolean>(
    !isBrowser() ? false : !document.hidden
  );

  useEffect(() => {
    const checkVisibility = (event: Event) => {
      if (event?.type === 'blur') {
        setVisible(false);
        return;
      }
      setVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', checkVisibility);
    window.addEventListener('focus', checkVisibility);
    window.addEventListener('blur', checkVisibility);

    return () => {
      document.removeEventListener('visibilitychange', checkVisibility);
      window.removeEventListener('focus', checkVisibility);
      window.removeEventListener('blur', checkVisibility);
    };
  }, []);

  return isVisible;
}

export default usePageVisibility;
