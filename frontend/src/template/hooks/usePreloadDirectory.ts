import { useCallback, useEffect, useRef, useState } from 'react';

import PreloaderService from 'template/services/preloader.service';

const usePreloadDirectory = (
  directories: string[],
  isDeviceSpecific = false
) => {
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const directoriesRef = useRef<string[]>([...directories]);

  const load = useCallback(async () => {
    const onLoadProgress = (progress: number) => {
      setLoadProgress(progress);
    };

    const onLoadComplete = () => {
      setLoadProgress(100);
    };

    PreloaderService.load({
      directories: directoriesRef.current,
      onProgress: onLoadProgress,
      onComplete: onLoadComplete,
      isDeviceSpecific,
    });
  }, [isDeviceSpecific]);

  useEffect(() => {
    if (
      directories.some(
        (value, index) => value !== directoriesRef.current[index]
      )
    ) {
      directoriesRef.current = [...directories];
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directories]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loadProgress;
};

export default usePreloadDirectory;
