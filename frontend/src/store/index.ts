import { mountStoreDevtool } from 'simple-zustand-devtools';
import { StoreApi, UseBoundStore } from 'zustand';

import { isBrowser } from 'template/utils/platform';
import { getUrlParams } from 'template/utils/url';

import useCopyStore from './copy';
import useGlobalStore from './global';

const addStoreDevtool = (
  name: string,
  store: UseBoundStore<StoreApi<Record<string, any>>>
) => {
  const separateRoot = document.createElement('div');
  separateRoot.id = `devtools-${name}`;
  document.body.appendChild(separateRoot);
  mountStoreDevtool(name, store, separateRoot);
};

const setupStoreDevTools = () => {
  if (
    isBrowser() &&
    (process.env.IS_DEBUG || getUrlParams().get('debugStore'))
  ) {
    addStoreDevtool('CopyStore', useCopyStore);
    addStoreDevtool('GlobalStore', useGlobalStore);
  }
};

export { setupStoreDevTools, useCopyStore, useGlobalStore };
