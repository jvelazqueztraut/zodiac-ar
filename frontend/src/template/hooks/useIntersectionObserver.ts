import { findLast } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

import IntersectionService from 'template/services/intersection.service';

export type IntersectionResult = [
  (ref: HTMLElement) => void,
  boolean,
  IntersectionObserverEntry?
];

const useIntersectionObserver = (
  { threshold = 0, triggerOnce = false } = { threshold: 0, triggerOnce: false }
) => {
  const [ref, setRef] = useState<HTMLElement>();
  const [intersectionState, setIntersectionState] = useState<{
    isVisible: boolean;
    entry: IntersectionObserverEntry;
  }>({ isVisible: false, entry: null });
  const isVisibleRef = useRef<boolean>(intersectionState.isVisible);
  const prevThreshold = useRef<number>(threshold);
  const listener = useRef<(entries: IntersectionObserverEntry[]) => any>();

  const connect = useCallback(() => {
    listener.current = entries => {
      // Find the latest entry for this target
      const targetEntry: IntersectionObserverEntry = findLast(
        entries,
        entry => entry.target === ref
      );

      if (targetEntry) {
        const isVisible =
          targetEntry.isIntersecting &&
          !!targetEntry.intersectionRatio &&
          targetEntry.intersectionRatio >= threshold;

        setIntersectionState({
          isVisible: isVisibleRef.current,
          // If the triggerOnce flag is on, only update the visibility
          // if the target has never been visible yet
          ...(!triggerOnce || !isVisibleRef.current ? { isVisible } : {}),
          entry: targetEntry,
        });
      }
    };

    IntersectionService.addTarget(ref);
    IntersectionService.addListener(listener.current);
  }, [ref, threshold, triggerOnce]);

  const disconnect = useCallback(() => {
    if (ref) IntersectionService.removeTarget(ref);
    if (listener.current) {
      IntersectionService.removeListener(listener.current);
      listener.current = null;
    }

    isVisibleRef.current = false;
  }, [ref]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => disconnect, []);

  useEffect(() => {
    if (!ref) return;
    if (!listener.current) {
      connect();
      return;
    }

    const hasThresholdChanged = prevThreshold.current !== threshold;

    // If the threshold has been updated, reset the observer listener
    if (hasThresholdChanged) {
      disconnect();
      connect();
      prevThreshold.current = threshold;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, threshold]);

  useEffect(() => {
    isVisibleRef.current = intersectionState.isVisible;
  }, [intersectionState.isVisible]);

  const result: IntersectionResult = [
    setRef,
    intersectionState.isVisible,
    intersectionState.entry,
  ];

  return result;
};

export default useIntersectionObserver;
