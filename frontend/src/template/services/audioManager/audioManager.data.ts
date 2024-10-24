import BgmWinterHasCome from 'assets/sounds/bgm/winterHasComeEdit.mp3';
import BgsWolfWind from 'assets/sounds/bgs/wolfWindLoop.mp3';
import SfxWolfGrowl1 from 'assets/sounds/sfx/wolfGrowl1.mp3';
import SfxWolfGrowl2 from 'assets/sounds/sfx/wolfGrowl2.mp3';
import SfxWolfGrowl3 from 'assets/sounds/sfx/wolfGrowl3.mp3';
import SfxWolfGrowl4 from 'assets/sounds/sfx/wolfGrowl4.mp3';
import SfxWolfGrowl5 from 'assets/sounds/sfx/wolfGrowl5.mp3';
import SfxWolfGrowl6 from 'assets/sounds/sfx/wolfGrowl6.mp3';
import SfxWolfHowls from 'assets/sounds/sfx/wolfHowls.mp3';
import { timecodeToMilliseconds } from 'template/utils/time';

import {
  RoundRobinConfig,
  SoundConfig,
  SoundData,
  SoundDataDictionary,
  SoundDataSettings,
} from './audioManager.types';

export const getSpriteTimes = (
  [start, end]: [string, string],
  shouldUseFrames?: boolean,
  fps?: number
): [number, number] => [
  timecodeToMilliseconds(start, shouldUseFrames, fps),
  timecodeToMilliseconds(end, shouldUseFrames, fps) -
    timecodeToMilliseconds(start, shouldUseFrames, fps),
];

export enum SoundType {
  BGM = 'BGM',
  BGS = 'BGS',
  SFX = 'SFX',
}

export enum SoundFile {
  winterHasCome = 'winterHasCome',
  winterHasComeLoop = 'winterHasComeLoop',
  wolfWind = 'wolfWind',
  wolfGrowl1 = 'wolfGrowl1',
  wolfGrowl2 = 'wolfGrowl2',
  wolfGrowl3 = 'wolfGrowl3',
  wolfGrowl4 = 'wolfGrowl4',
  wolfGrowl5 = 'wolfGrowl5',
  wolfGrowl6 = 'wolfGrowl6',
  wolfHowls = 'wolfHowls',
}

const initialData: SoundDataSettings = {
  // BGM
  winterHasCome: {
    loop: true,
    volume: 0.3,
    type: SoundType.BGM,
    file: BgmWinterHasCome,
  },

  winterHasComeLoop: {
    volume: 0.3,
    type: SoundType.BGM,
    sprite: {
      __default: getSpriteTimes(['00:00:00.000', '00:01:25.839']),
      intro: getSpriteTimes(['00:00:00.000', '00:00:14.502']),
      loop: [...getSpriteTimes(['00:00:14.502', '00:00:37.002']), true],
      end: getSpriteTimes(['00:01:01.090', '00:01:25.839']),
    } as SoundData['sprite'],
    file: BgmWinterHasCome,
  },

  // BGS
  wolfWind: {
    loop: true,
    volume: 0.25,
    type: SoundType.BGS,
    file: BgsWolfWind,
  },

  // SFX
  wolfGrowl1: {
    loop: false,
    volume: 0.9,
    type: SoundType.SFX,
    file: SfxWolfGrowl1,
  },
  wolfGrowl2: {
    loop: false,
    volume: 0.8,
    type: SoundType.SFX,
    file: SfxWolfGrowl2,
  },
  wolfGrowl3: {
    loop: false,
    volume: 0.9,
    type: SoundType.SFX,
    file: SfxWolfGrowl3,
  },
  wolfGrowl4: {
    loop: false,
    type: SoundType.SFX,
    file: SfxWolfGrowl4,
  },
  wolfGrowl5: {
    loop: false,
    type: SoundType.SFX,
    file: SfxWolfGrowl5,
  },
  wolfGrowl6: {
    loop: false,
    volume: 0.6,
    type: SoundType.SFX,
    file: SfxWolfGrowl6,
  },
  wolfHowls: {
    loop: false,
    type: SoundType.SFX,
    file: SfxWolfHowls,
  },
} as const;

export const DEFAULT_FADE_DURATION = 0.4 as const;

export const DEFAULT_SOUND_DATA: Omit<SoundData, 'id'> = {
  type: SoundType.SFX,
  file: '',
  format: 'mp3',
  sprite: null,
  loop: false,
  volume: 1,
  pan: 0,
  pos: null,
  orientation: null,
  pannerAttr: null,
} as const;

export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  spriteName: '',
  fadeDuration: null,
  from: null,
  delay: 0,
  onStart: null,
  onEnd: null,
  onProgress: null,
  onStop: null,
  shouldSkipFade: false,
} as const;

export const DEFAULT_ROUND_ROBIN_CONFIG: RoundRobinConfig = {
  startWith: null,
  delay: 0,
  minWait: 3,
  maxWait: 6,
  pan: null,
  onStart: null,
  onEnd: null,
} as const;

export const SOUNDS_DATA: SoundDataDictionary = Object.keys(initialData).reduce(
  (acc, id) => ({
    ...acc,
    [id]: {
      id,
      ...DEFAULT_SOUND_DATA,
      ...initialData[id],
    },
  }),
  {} as SoundDataDictionary
);
