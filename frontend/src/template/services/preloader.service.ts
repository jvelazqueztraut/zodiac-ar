import axios from 'axios';

import {
  isDesktop,
  isMobile,
  isStorybook,
  isTablet,
  isTouchDevice,
} from 'template/utils/platform';

const DEVICE_SPECIFIC_FLAGS = {
  tablet: '--tablet',
  mobile: '--mobile',
  touch: '--touch',
  desktop: '--desktop',
};

const getFullUrl = (fileUrl: string) =>
  isStorybook() ? fileUrl : `${process.env.PUBLIC_PATH}/${fileUrl}`;
const truncateUrl = (url: string) =>
  url && url.length > 100 ? `${url.slice(0, 100)}... (truncated)` : url;

const IS_DEBUG = process.env.IS_DEBUG && false;

class PreloaderService {
  private _manifest: Record<string, string>;
  private _files: Record<string, string>;
  private _hasLoadingStarted: Record<string, boolean>;
  private _totalLoaded: number;
  private _totalToLoad: number;
  private promises: Record<string, Promise<string>>;

  get manifest() {
    return this._manifest;
  }

  private set manifest(value: PreloaderService['_manifest']) {
    this._manifest = value;
  }

  get files() {
    return this._files;
  }

  private set files(value: PreloaderService['_files']) {
    this._files = value;
  }

  get hasLoadingStarted() {
    return this._hasLoadingStarted;
  }

  private set hasLoadingStarted(value: PreloaderService['_hasLoadingStarted']) {
    this._hasLoadingStarted = value;
  }

  get totalLoaded() {
    return this._totalLoaded;
  }

  private set totalLoaded(value: number) {
    this._totalLoaded = value;
  }

  get totalToLoad() {
    return this._totalToLoad;
  }

  private set totalToLoad(value: number) {
    this._totalToLoad = value;
  }

  get progress() {
    return (this.totalLoaded / this.totalToLoad) * 100;
  }

  get isDone() {
    return this.totalLoaded === this.totalToLoad;
  }

  constructor() {
    this.manifest = null;
    this.hasLoadingStarted = {};
    this.files = {};
    this.totalLoaded = 0;
    this.totalToLoad = 0;
    this.promises = {};
  }

  async load({
    directories,
    onProgress,
    onComplete,
    isDeviceSpecific = false,
  }: {
    directories: string[];
    onProgress: (progress: number) => void;
    onComplete: () => void;
    isDeviceSpecific?: boolean;
  }) {
    if (!this.manifest) {
      try {
        const manifestURL = getFullUrl(`asset-manifest.json?${Date.now()}`);
        const { data } = await axios.get(manifestURL);
        this.manifest = data;
      } catch (error) {
        if (IS_DEBUG) console.log('PreloaderService -- load -- Error:', error);
        return;
      }
    }

    if (IS_DEBUG)
      console.log(
        'PreloaderService -- load -- Loading manifest',
        this.manifest
      );

    const fileIds: string[] = [];
    directories.forEach(directory => {
      Object.keys(this.manifest)
        .filter(key => key.startsWith(directory) && !fileIds.includes(key))
        .forEach(id => {
          fileIds.push(id);
        });
    });

    if (!fileIds.length) {
      if (IS_DEBUG)
        console.log('PreloaderService -- load -- No files to load. Skipping');
      onComplete();
      return;
    }

    const filesToLoad: string[] = this.getFilesToLoad(
      fileIds,
      isDeviceSpecific
    );

    if (
      filesToLoad.every(fileUrl => {
        const fullUrl = getFullUrl(fileUrl);
        return this.files[fullUrl] || this.hasLoadingStarted[fullUrl];
      })
    ) {
      if (IS_DEBUG)
        console.log(
          'PreloaderService -- load -- No matching files to load (already loaded or wrong device type). Skipping.'
        );
      onComplete();
      return;
    }

    this.loadFiles(filesToLoad, onProgress, onComplete);
  }

  get(fileUrl: string, fallbackToFileUrl = true) {
    if (fallbackToFileUrl) {
      const isDataUrl = fileUrl.startsWith('data:');
      if (!this.files[fileUrl] || isDataUrl) {
        if (IS_DEBUG)
          console.log(
            'PreloaderService -- get',
            truncateUrl(fileUrl),
            `-- ${
              isDataUrl ? 'Data URL' : 'Not preloaded'
            }. Returning the file's URL`
          );
        return fileUrl;
      }
    }

    if (!this.files[fileUrl] && IS_DEBUG)
      console.log(
        'PreloaderService -- get',
        truncateUrl(fileUrl),
        '-- Not preloaded'
      );
    return this.files[fileUrl];
  }

  private getFilesToLoad(fileIds: string[], isDeviceSpecific = false) {
    let skipFlagsRegex: RegExp;
    if (isDeviceSpecific) {
      const nonApplicableDeviceFlags: string[] = [];
      if (!isTouchDevice())
        nonApplicableDeviceFlags.push(DEVICE_SPECIFIC_FLAGS.touch);

      if (!isMobile())
        nonApplicableDeviceFlags.push(DEVICE_SPECIFIC_FLAGS.mobile);

      if (!isTablet())
        nonApplicableDeviceFlags.push(DEVICE_SPECIFIC_FLAGS.tablet);

      if (!isDesktop())
        nonApplicableDeviceFlags.push(DEVICE_SPECIFIC_FLAGS.desktop);

      skipFlagsRegex = new RegExp(`${nonApplicableDeviceFlags.join('|')}$`);

      if (IS_DEBUG)
        console.log(
          'PreloaderService -- getFilesToLoad -- Device-specific loading. Skipping file names ending with:',
          nonApplicableDeviceFlags.join(' ')
        );
    }

    const filesToLoad: string[] = fileIds.reduce((array, id) => {
      const shouldSkip =
        isDeviceSpecific && id.replace(/(\.[^.]*)$/, '').match(skipFlagsRegex);

      const url = this.manifest[id];
      if (!this.files[url] && !shouldSkip) array.push(url);
      return array;
    }, []);

    return filesToLoad;
  }

  private loadFiles(
    filesToLoad: string[],
    onProgress: (progress: number) => void,
    onComplete: () => void
  ) {
    this.totalLoaded = 0;
    this.totalToLoad = filesToLoad.length;

    if (IS_DEBUG)
      console.log(
        'PreloaderService -- loadFiles -- Loading',
        this.totalToLoad,
        'file(s):',
        filesToLoad
      );

    filesToLoad.forEach(async file => {
      const url = getFullUrl(file);
      await this.loadFile(url);
      this.totalLoaded++;

      if (IS_DEBUG)
        console.log(
          'PreloaderService -- loadFiles -- Progress:',
          this.progress
        );

      onProgress(this.progress);

      if (this.isDone) {
        if (IS_DEBUG)
          console.log('PreloaderService -- loadFiles -- Finished', this.files);
        onComplete();
      }
    });
  }

  private readonly loadFile = async (url: string) => {
    if (this.files[url]) {
      if (IS_DEBUG)
        console.log(
          'PreloaderService -- loadFile',
          truncateUrl(url),
          '-- Already loaded. Returning loaded file.'
        );
      return this.files[url];
    }

    if (this.hasLoadingStarted[url]) {
      if (IS_DEBUG)
        console.log(
          'PreloaderService -- loadFile',
          truncateUrl(url),
          '-- Already started loading. Returning loading promise.'
        );
      return await this.promises[url];
    }

    if (IS_DEBUG)
      console.log(
        'PreloaderService -- loadFile',
        truncateUrl(url),
        '-- Loading'
      );
    this.promises[url] = new Promise<string>(resolve => {
      this.hasLoadingStarted[url] = true;

      axios.get(url, { responseType: 'blob' }).then(response => {
        const reader = new FileReader();
        const isText = url.endsWith('.txt');
        const isJSON = url.endsWith('.json');

        if (isText || isJSON) reader.readAsText(response.data);
        else reader.readAsDataURL(response.data);

        reader.onloadend = () => {
          if (IS_DEBUG)
            console.log(
              'PreloaderService -- loadFile',
              truncateUrl(url),
              '-- Done'
            );
          const file = reader.result as string;
          resolve(file);
        };
      });
    });

    this.files[url] = await this.promises[url];
    return this.files[url];
  };
}

export default new PreloaderService();
