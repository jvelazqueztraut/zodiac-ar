import gsap from 'gsap';
import { Howler } from 'howler';

import {
  DEFAULT_FADE_DURATION,
  DEFAULT_SOUND_CONFIG,
  SoundFile,
  SOUNDS_DATA,
  SoundType,
} from './audioManager.data';
import {
  SoundConfig,
  SoundData,
  SoundDataDictionary,
} from './audioManager.types';
import RoundRobinGenerator from './modules/roundRobinGenerator';
import Sound from './modules/sound';
import SpatialAudio from './modules/spatialAudio';

import EventManager from 'template/services/eventManager.service';
import { addEventListeners, removeEventListeners } from 'template/utils/dom';
import { isStorybook } from 'template/utils/platform';

export const clearTween = (tween: gsap.core.Tween) => {
  if (tween) {
    tween.kill();
    tween = null;
  }
};

const IS_DEBUG = isStorybook() || (process.env.IS_DEBUG && false);

class AudioManager {
  private roundRobinGenerator: RoundRobinGenerator;
  private spatialAudio: SpatialAudio;

  private _pool: Partial<Readonly<Record<SoundFile, Sound>>>;
  private _globalVolume: number;
  private _currentBGM: Sound;
  private _eventManager: EventManager;
  private _isReady: boolean;
  private _isUnlocked: boolean;
  private _isMuted: boolean;
  private _isUserMuted: boolean;
  private preMuteVolume: number;
  private soundsLoaded: number;
  private muteTween: gsap.core.Tween;

  private onLoadProgress: (progress: number) => void;
  private onLoadComplete: () => void;

  get pool() {
    return this._pool;
  }

  private set pool(value: AudioManager['_pool']) {
    this._pool = value;
  }

  get globalVolume() {
    return this._globalVolume;
  }

  private set globalVolume(value: number) {
    this._globalVolume = value;
    if (!this.isMuted) this.preMuteVolume = value;
    Howler.volume(this._globalVolume);
  }

  get currentBGM() {
    return this._currentBGM;
  }

  private set currentBGM(value: AudioManager['_currentBGM']) {
    this._currentBGM = value;
  }

  get eventManager() {
    return this._eventManager;
  }

  private set eventManager(value: AudioManager['_eventManager']) {
    this._eventManager = value;
  }

  get isReady() {
    return this._isReady;
  }

  private set isReady(value: boolean) {
    this._isReady = value;
  }

  get isUnlocked() {
    return this._isUnlocked;
  }

  private set isUnlocked(value: boolean) {
    this._isUnlocked = value;
  }

  get isMuted() {
    return this._isMuted;
  }

  private set isMuted(value: boolean) {
    this._isMuted = value;
  }

  get isUserMuted() {
    return this._isUserMuted;
  }

  private set isUserMuted(value: boolean) {
    this._isUserMuted = value;
  }

  private get soundsCount() {
    return Object.keys(SOUNDS_DATA).length;
  }

  get loadProgress() {
    return (this.soundsLoaded / this.soundsCount) * 100;
  }

  get Howler() {
    return Howler;
  }

  constructor() {
    this.initialize();
  }

  load(
    {
      data = SOUNDS_DATA,
      onLoadProgress,
      onLoadComplete,
    }: {
      data?: SoundDataDictionary;
      onLoadProgress?: (progress: number) => void;
      onLoadComplete?: () => void;
    } = { data: SOUNDS_DATA }
  ) {
    if (IS_DEBUG) console.log('AudioManager -- load', data);

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;

    Object.entries(data).forEach(([id, sound]) => {
      SOUNDS_DATA[id] = sound;
    });

    if (this.isReady) {
      if (this.loadProgress !== 100) {
        this.isReady = false;
      } else {
        this.onLoadAllComplete();
        return;
      }
    }

    this.loadSounds();
  }

  unload() {
    if (!this.isUnlocked) return;
    if (IS_DEBUG) console.log('AudioManager -- unload');

    this.roundRobinGenerator.dispose();
    this.spatialAudio.dispose();

    this.stopAll();
    Object.values(this.pool).forEach(poolSound => {
      poolSound.unload();
    });

    this.clearTweens();

    Howler.unload();
    this.eventManager.disconnect();
    removeEventListeners(window, 'click touchend', this.unlockAudio);

    if (IS_DEBUG) console.log('AudioManager -- unload -- Finished');

    // Reinitialise the audio manager for further use
    this.initialize();
  }

  play(
    soundData: SoundData,
    config: Partial<SoundConfig> = DEFAULT_SOUND_CONFIG
  ) {
    if (!this.isUnlocked) return;

    const playConfig = { ...DEFAULT_SOUND_CONFIG, ...config };
    const { shouldSkipFade } = playConfig;

    if (IS_DEBUG) console.log('AudioManager -- play', soundData.id, playConfig);

    const poolSound = this.pool[soundData.id];
    if (poolSound) {
      const isBGM = poolSound.data.type === SoundType.BGM;
      const isBGS = poolSound.data.type === SoundType.BGS;
      const isBGMUpdate = isBGM && this.currentBGM;
      const isRestartingBGS = isBGS && poolSound.state.isPlaying;
      const currentVolume = poolSound.sound.volume();

      const proceed = () => {
        // Restore the volume after any fade out and play
        poolSound.setVolume(currentVolume);
        poolSound.play(playConfig);

        if (isBGM) this.currentBGM = poolSound;
      };

      if (isBGMUpdate || isRestartingBGS) {
        const fadeDuration = shouldSkipFade
          ? 0
          : playConfig.fadeDuration ?? DEFAULT_FADE_DURATION;

        // If we're playing a BGM and there already is one playing
        if (isBGMUpdate) {
          // If we're resuming the current one, go ahead
          if (poolSound.id === this.currentBGM.id && poolSound.isPaused) {
            proceed();
          } else {
            // Otherwise, fade out the current BGM first
            this.currentBGM.stop(fadeDuration, proceed);
          }
        } else {
          // If we're restarting an already playing BGS, fade it out first
          poolSound.stop(fadeDuration, proceed);
        }
      } else {
        proceed();
      }
    } else {
      if (IS_DEBUG)
        console.log('AudioManager -- play -- Unregistered sound:', soundData);
    }
  }

  pause(soundData: SoundData, fadeDuration?: number, callback?: () => void) {
    if (!this.isUnlocked) return;
    if (IS_DEBUG) console.log('AudioManager -- pause', soundData.id);

    const poolSound: Sound = this.pool[soundData.id];
    if (poolSound) {
      poolSound.pause(fadeDuration, () => {
        if (IS_DEBUG)
          console.log('AudioManager -- pause', soundData.id, '-- Finished');
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log('AudioManager -- pause -- Unregistered sound:', soundData);
    }
  }

  stop(soundData: SoundData, fadeDuration?: number, callback?: () => void) {
    if (!this.isUnlocked) return;
    if (IS_DEBUG) console.log('AudioManager -- stop', soundData.id);

    const poolSound: Sound = this.pool[soundData.id];
    if (poolSound) {
      poolSound.stop(fadeDuration, () => {
        if (IS_DEBUG)
          console.log('AudioManager -- stop', soundData.id, '-- Finished');

        if (poolSound.data.type === SoundType.BGM) this.currentBGM = null;
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log('AudioManager -- stop -- Unregistered sound:', soundData);
    }
  }

  stopType(soundType: SoundType, fadeDuration?: number, callback?: () => void) {
    if (!this.isUnlocked) return;
    if (IS_DEBUG) console.log('AudioManager -- stopType', soundType);

    const sounds = this.getType(soundType);

    let stoppedCount = 0;
    sounds.forEach(poolSound => {
      const soundData = SOUNDS_DATA[poolSound.id];
      this.stop(soundData, fadeDuration, () => {
        if (++stoppedCount === sounds.length) {
          if (IS_DEBUG)
            console.log('AudioManager -- stopType', soundType, '-- Finished');
          if (callback) callback();
        }
      });
    });
  }

  stopAll(fadeDuration?: number, callback?: () => void) {
    if (!this.isUnlocked) return;
    if (IS_DEBUG) console.log('AudioManager -- stopAll');

    const globalVolume = this.globalVolume;

    const proceed = () => {
      const soundTypes = Object.keys(SoundType) as SoundType[];
      let stoppedTypes = 0;
      const checkFinished = () => {
        if (++stoppedTypes === soundTypes.length) {
          if (fadeDuration) {
            // Restore global volume
            this.setGlobalVolume(globalVolume);
          }

          if (IS_DEBUG) console.log('AudioManager -- stopAll -- Finished');
          if (callback) callback();
        }
      };

      soundTypes.forEach(soundType => {
        this.stopType(soundType, 0, checkFinished);
      });
    };

    if (fadeDuration) this.setGlobalVolume(0, fadeDuration, proceed);
    else proceed();
  }

  setVolume(
    soundData: SoundData,
    volume: number,
    transitionDuration?: number,
    callback?: () => void
  ) {
    const poolSound: Sound = this.pool[soundData.id];
    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'AudioManager -- setVolume',
          soundData.id,
          volume,
          'in',
          transitionDuration,
          'seconds'
        );

      poolSound.setVolume(volume, transitionDuration, () => {
        if (IS_DEBUG)
          console.log('AudioManager -- setVolume', soundData.id, '-- Finished');
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log(
          'AudioManager -- setVolume -- Unregistered sound:',
          soundData
        );
    }
  }

  setGlobalVolume(
    volume: number,
    transitionDuration?: number,
    callback?: () => void
  ) {
    const duration = transitionDuration ?? DEFAULT_FADE_DURATION;

    if (IS_DEBUG)
      console.log(
        'AudioManager -- setGlobalVolume',
        volume,
        'in',
        transitionDuration,
        'seconds'
      );

    clearTween(this.muteTween);

    if (duration) {
      this.muteTween = gsap.to(this, {
        duration,
        globalVolume: volume,
        onComplete: () => {
          this.muteTween = null;

          if (IS_DEBUG)
            console.log('AudioManager -- setGlobalVolume -- Finished');
          if (callback) callback();
        },
      });
    } else {
      if (IS_DEBUG) console.log('AudioManager -- setGlobalVolume -- Finished');
      this.globalVolume = volume;
    }
  }

  mute(fadeDuration?: number, isFromUser = false) {
    if (this.isMuted) return;

    if (isFromUser) this.isUserMuted = true;
    this.isMuted = true;

    this.setGlobalVolume(0, fadeDuration);
  }

  unmute(fadeDuration?: number, isFromUser = false) {
    if (!this.isMuted) return;
    if (isFromUser) this.isUserMuted = false;

    // Don't unmute if the user chose to mute
    if (this.isUserMuted && this.isMuted) return;
    this.isMuted = false;

    this.setGlobalVolume(this.preMuteVolume, fadeDuration);
  }

  toggleMute(fadeDuration?: number, isFromUser = true) {
    if (this.isMuted) this.unmute(fadeDuration, isFromUser);
    else this.mute(fadeDuration, isFromUser);

    return this.isMuted;
  }

  setRate(
    soundData: SoundData,
    rate: number,
    transitionDuration?: number,
    callback?: () => void
  ) {
    if (!this.isUnlocked) return;
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'AudioManager -- setRate',
          soundData.id,
          rate,
          'in',
          transitionDuration,
          'seconds'
        );

      poolSound.setRate(rate, transitionDuration, () => {
        if (IS_DEBUG)
          console.log('AudioManager -- setRate', soundData.id, '-- Finished');
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log(
          'AudioManager -- setRate -- Unregistered sound:',
          soundData
        );
    }
  }

  getHowl(soundData: SoundData) {
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log('AudioManager -- getHowl', soundData.id, poolSound.sound);
      return poolSound.sound;
    }

    if (IS_DEBUG)
      console.log('AudioManager -- getHowl -- Unregistered sound:', soundData);
  }

  getSoundState(soundData: SoundData) {
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'AudioManager -- getSoundState',
          soundData.id,
          poolSound.state
        );
      return poolSound.state;
    }

    if (IS_DEBUG)
      console.log(
        'AudioManager -- getSoundState -- Unregistered sound:',
        soundData
      );
  }

  getType(soundType: SoundType) {
    const typeSounds = Object.values(SOUNDS_DATA).filter(
      soundData => soundData.type === soundType
    );

    if (IS_DEBUG) console.log('AudioManager -- getType', soundType, typeSounds);
    return typeSounds;
  }

  getTypes(soundTypes: SoundType[]) {
    if (IS_DEBUG) console.log('AudioManager -- getTypes', soundTypes.join(' '));
    const typesSounds = soundTypes.flatMap(this.getType);

    if (IS_DEBUG)
      console.log(
        'AudioManager -- getTypes',
        soundTypes.join(' '),
        '-- Found:',
        typesSounds
      );
    return typesSounds;
  }

  private initialize() {
    if (IS_DEBUG) console.log('AudioManager -- initialize');

    this.pool = {};
    this.globalVolume = 1;
    this.soundsLoaded = 0;
    this.currentBGM = null;

    this.clearTweens();

    this.onLoadProgress = null;
    this.onLoadComplete = null;

    this.isReady = false;
    this.isMuted = false;
    this.isUserMuted = false;
    this.isUnlocked = false;

    if (this.eventManager) this.eventManager.disconnect();
    this.eventManager = new EventManager();
    this.eventManager.registerEvent('loadProgress');
    this.eventManager.registerEvent('loadComplete');
    this.eventManager.registerEvent('unlock');

    this.roundRobinGenerator = new RoundRobinGenerator(this);
    this.spatialAudio = new SpatialAudio(this);

    if (IS_DEBUG) console.log('AudioManager -- initialize - Finished', this);
  }

  private loadSounds() {
    if (this.isReady) return;

    // Only load sounds that aren't in the pool yet
    Object.keys(SOUNDS_DATA)
      .filter(key => !this.pool[key])
      .forEach(key => {
        this.pool[key] = new Sound(SOUNDS_DATA[key], this.onSoundLoaded);
      });
  }

  private clearTweens() {
    [this.muteTween].forEach(clearTween);
  }

  private readonly unlockAudio = () => {
    if (!this.isReady) return;
    this.isUnlocked = true;

    if (IS_DEBUG) console.log('AudioManager -- unlockAudio');
    this.eventManager.trigger('unlock');
    removeEventListeners(window, 'click touchend', this.unlockAudio);
  };

  private readonly onSoundLoaded = () => {
    if (this.isReady) return;
    this.soundsLoaded++;

    this.eventManager.trigger('loadProgress', this.loadProgress);
    if (this.onLoadProgress) this.onLoadProgress(this.loadProgress);

    if (this.loadProgress === 100) {
      this.onLoadAllComplete();

      if (!this.isUnlocked)
        addEventListeners(window, 'click touchend', this.unlockAudio);
    }
  };

  private readonly onLoadAllComplete = () => {
    this.isReady = true;
    if (IS_DEBUG) console.log('AudioManager -- onLoadAllComplete');

    this.eventManager.trigger('loadComplete');
    if (this.onLoadComplete) this.onLoadComplete();

    this.onLoadProgress = null;
    this.onLoadComplete = null;
  };

  // ---------
  // SpatialAudio module
  // ---------
  get listenerPos() {
    return this.spatialAudio?.listenerPos;
  }

  get listenerOrientation() {
    return this.spatialAudio.listenerOrientation;
  }

  setPan(...parameters: Parameters<typeof SpatialAudio.prototype.setPan>) {
    return this.spatialAudio.setPan(...parameters);
  }

  setPos(...parameters: Parameters<typeof SpatialAudio.prototype.setPos>) {
    return this.spatialAudio.setPos(...parameters);
  }

  setOrientation(
    ...parameters: Parameters<typeof SpatialAudio.prototype.setOrientation>
  ) {
    return this.spatialAudio.setOrientation(...parameters);
  }

  setPannerAttr(
    ...parameters: Parameters<typeof SpatialAudio.prototype.setPannerAttr>
  ) {
    return this.spatialAudio.setPannerAttr(...parameters);
  }

  setListenerPos(
    ...parameters: Parameters<typeof SpatialAudio.prototype.setListenerPos>
  ) {
    return this.spatialAudio.setListenerPos(...parameters);
  }

  setListenerOrientation(
    ...parameters: Parameters<
      typeof SpatialAudio.prototype.setListenerOrientation
    >
  ) {
    return this.spatialAudio.setListenerOrientation(...parameters);
  }

  // ---------
  // RoundRobinGenerator module
  // ---------
  createRoundRobin(
    ...parameters: Parameters<typeof RoundRobinGenerator.prototype.create>
  ) {
    return this.roundRobinGenerator.create(...parameters);
  }

  playRoundRobin(
    ...parameters: [
      id: Parameters<typeof RoundRobinGenerator.prototype.play>[0],
      shouldResumeLooping?: Parameters<
        typeof RoundRobinGenerator.prototype.play
      >[1],
      configUpdate?: Parameters<typeof RoundRobinGenerator.prototype.play>[2]
    ]
  ) {
    // The onEnd parameter is only used internally
    return this.roundRobinGenerator.play(...parameters);
  }

  startRoundRobin(
    ...parameters: Parameters<typeof RoundRobinGenerator.prototype.start>
  ) {
    return this.roundRobinGenerator.start(...parameters);
  }

  stopRoundRobin(
    ...parameters: [
      id: Parameters<typeof RoundRobinGenerator.prototype.stop>[0],
      shouldCutTrail?: Parameters<typeof RoundRobinGenerator.prototype.stop>[1]
    ]
  ) {
    // Cleanup should always be enabled from the public API
    const overridenParameters: [
      typeof parameters[0],
      typeof parameters[1],
      Parameters<typeof RoundRobinGenerator.prototype.stop>[2]
    ] = [parameters[0], parameters[1], true];

    return this.roundRobinGenerator.stop(...overridenParameters);
  }

  getRoundRobin(
    ...parameters: Parameters<typeof RoundRobinGenerator.prototype.get>
  ) {
    return this.roundRobinGenerator.get(...parameters);
  }

  getAllRoundRobins(
    ...parameters: Parameters<typeof RoundRobinGenerator.prototype.getAll>
  ) {
    return this.roundRobinGenerator.getAll(...parameters);
  }
}

export default new AudioManager();
