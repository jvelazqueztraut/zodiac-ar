import create from 'zustand';

export interface GlobalStoreType {
  isWindowTooSmall: boolean;
  setWindowTooSmall: (state: boolean) => void;

  shouldRotateDevice: boolean;
  setRotateDevice: (state: boolean) => void;
}

const useGlobalStore = create<GlobalStoreType>(
  (
    set: (partial: (store: GlobalStoreType) => Partial<GlobalStoreType>) => void
  ) => {
    return {
      isWindowTooSmall: false,
      setWindowTooSmall: state => {
        set(() => ({
          isWindowTooSmall: state,
        }));
      },

      shouldRotateDevice: false,
      setRotateDevice: state => {
        set(() => ({
          shouldRotateDevice: state,
        }));
      },
    };
  }
);

export default useGlobalStore;
