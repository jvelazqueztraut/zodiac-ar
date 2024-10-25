import create from 'zustand';

import { Pages } from 'utils/routes';

import { getCopy } from './copy.data';
import { CopyStoreType } from './copy.types';

const useCopyStore = create<CopyStoreType>(
  (
    set: (partial: (store: CopyStoreType) => Partial<CopyStoreType>) => void
  ) => {
    return {
      copy: getCopy(Pages.landing, process.env.DEFAULT_LOCALE),

      setCopy: patch => {
        set(({ copy }) => ({
          copy: {
            ...copy,
            ...patch,
          },
        }));
      },
    };
  }
);

export default useCopyStore;
