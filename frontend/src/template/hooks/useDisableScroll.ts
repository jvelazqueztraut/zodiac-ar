import { useEffect } from 'react';

export default function useDisableScroll() {
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
    };
  });
}
