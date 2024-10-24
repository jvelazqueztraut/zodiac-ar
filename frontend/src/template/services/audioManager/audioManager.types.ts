import { PannerAttributes } from 'howler';

import { SoundFile, SoundType } from './audioManager.data';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type ListenerOrientation = Vector3 & {
  xUp: number;
  yUp: number;
  zUp: number;
};

export interface SoundData {
  id: SoundFile;
  type: SoundType;
  file: string | string[];
  format?: string | string[];
  sprite?: Record<string, [number, number] | [number, number, boolean]>;
  loop?: boolean;
  volume?: number;
  pan?: number;
  pos?: Vector3;
  orientation?: Vector3;
  pannerAttr?: PannerAttributes;
}

export type SoundDataDictionary = Record<SoundFile, Readonly<SoundData>>;
export type SoundDataSettings = Readonly<
  Record<
    keyof SoundDataDictionary,
    Omit<SoundDataDictionary[keyof SoundDataDictionary], 'id'>
  >
>;

export interface SoundConfig {
  spriteName: string;
  fadeDuration: number;
  from: number;
  delay: number;
  onStart: () => void;
  onEnd: () => void;
  onProgress: (progress: number) => void;
  onStop: () => void;
  shouldSkipFade: boolean;
}

export interface RoundRobinConfig {
  startWith: number;
  delay: number;
  minWait: number;
  maxWait: number;
  pan: [number, number][] | [number];
  onStart: (soundData: SoundData) => void;
  onEnd: () => void;
}

export interface RoundRobin {
  id: string;
  dataArray: SoundData[];
  iterator: number;
  timeout: number;
  isPlaying: boolean;
  isLooping: boolean;
  config: RoundRobinConfig;
}
