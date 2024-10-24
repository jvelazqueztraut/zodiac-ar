import { useEffect } from 'react';

import { addEventListeners, removeEventListeners } from 'template/utils/dom';

interface HandlersProps {
  onStart(x: number, y: number): void;
  onMove(x: number, y: number): void;
  onEnd(x: number, y: number): void;
}

export default function useTouch(handlers: HandlersProps) {
  useEffect(() => {
    const callHandler = (
      eventName: keyof HandlersProps,
      event: MouseEvent | TouchEvent
    ) => {
      if (
        eventName &&
        handlers[eventName] &&
        typeof handlers[eventName] === 'function'
      ) {
        handlers[eventName](
          (event as TouchEvent).touches
            ? (event as TouchEvent).touches[0].clientX
            : (event as MouseEvent).clientX,
          (event as TouchEvent).touches
            ? (event as TouchEvent).touches[0].clientY
            : (event as MouseEvent).clientY
        );
      }
    };

    const onStart = (event: MouseEvent | TouchEvent) =>
      callHandler('onStart', event);
    const onMove = (event: MouseEvent | TouchEvent) =>
      callHandler('onMove', event);
    const onEnd = (event: MouseEvent | TouchEvent) =>
      callHandler('onEnd', event);

    addEventListeners(window, 'mousedown touchstart', onStart);
    addEventListeners(window, 'mousemove touchmove', onMove);
    addEventListeners(window, 'mouseup touchend', onEnd);

    return () => {
      removeEventListeners(window, 'mousedown touchstart', onStart);
      removeEventListeners(window, 'mousemove touchmove', onMove);
      removeEventListeners(window, 'mouseup touchend', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
