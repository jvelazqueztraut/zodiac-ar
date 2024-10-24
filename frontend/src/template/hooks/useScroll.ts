import { useEffect, useRef, useState } from 'react';

import { debounce } from 'template/utils/debounce';
import { isBrowser } from 'template/utils/platform';

interface SSRRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

const EmptySSRRect: SSRRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
};

export default function useScroll() {
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  const bodyOffset = useRef<DOMRect | SSRRect>(
    !isBrowser() ? EmptySSRRect : document.body.getBoundingClientRect()
  );
  const [scrollY, setScrollY] = useState<number>(bodyOffset.current.top);
  const [scrollX, setScrollX] = useState<number>(bodyOffset.current.left);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>();

  useEffect(() => {
    const onScroll = debounce(() => {
      bodyOffset.current = document.body.getBoundingClientRect();
      setScrollY(-bodyOffset.current.top);
      setScrollX(bodyOffset.current.left);
      setScrollDirection(
        lastScrollTop > -bodyOffset.current.top ? 'down' : 'up'
      );
      setLastScrollTop(-bodyOffset.current.top);
    }, 50);

    window.addEventListener('scroll', onScroll);

    return () => {
      onScroll.cancel();
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    scrollY,
    scrollX,
    scrollDirection,
  };
}
