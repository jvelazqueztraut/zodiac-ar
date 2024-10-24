import gsap from 'gsap';
import { Howl, PannerAttributes, SpatialPosition } from 'howler';

import PreloaderService from 'template/services/preloader.service';
import { isStorybook } from 'template/utils/platform';

import { DEFAULT_SOUND_CONFIG } from '../audioManager.data';
import { clearTween } from '../audioManager.service';
import { SoundConfig, SoundData, Vector3 } from '../audioManager.types';

const IS_DEBUG = isStorybook() || (process.env.IS_DEBUG && false);

const truncateUrl = (url: string) =>
  url && url.length > 100 ? `${url.slice(0, 100)}... (truncated)` : url;

interface TweenConfig {
  tween: gsap.core.Tween;
  duration?: number;
  delay?: number;
  onEnd?: () => void;
  onStart?: () => void;
}

type TweenValueConfig = {
  valueName: 'volume' | 'rate' | 'stereo';
  value: number;
  from?: number;
} & TweenConfig;

type TweenVectorConfig = {
  vectorName: 'pos' | 'orientation' | 'pannerAttr';
  vector: Vector3;
  from?: Partial<Vector3>;
} & TweenConfig;

export default class Sound {
  readonly id: SoundData['id'];
  readonly sound: Howl;
  readonly data: Readonly<SoundData>;
  private volumeTween: gsap.core.Tween;
  private rateTween: gsap.core.Tween;
  private panTween: gsap.core.Tween;
  private posTween: gsap.core.Tween;
  private orientationTween: gsap.core.Tween;
  private pannerAttrTween: gsap.core.Tween;
  private rAF: number;
  private previousPosition: number;
  private onProgress: (position: number) => void;
  private _isLoaded: boolean;
  private _isPaused: boolean;

  get isLoaded() {
    return this._isLoaded;
  }

  private set isLoaded(value: boolean) {
    this._isLoaded = value;
  }

  get isPaused() {
    return this._isPaused;
  }

  private set isPaused(value: boolean) {
    this._isPaused = value;
  }

  get state() {
    const { isLoaded, isPaused } = this;
    return { isLoaded, isPaused, isPlaying: !!this.sound?.playing() };
  }

  constructor(data: SoundData, onLoaded: () => void = null) {
    this.id = data.id;
    this.data = data;
    this.volumeTween = null;
    this.rateTween = null;
    this.panTween = null;
    this.posTween = null;
    this.rAF = null;
    this.previousPosition = null;
    this.onProgress = null;
    this.isLoaded = false;
    this.isPaused = false;

    const dataFile = this.data.file;
    const urlArray = (Array.isArray(dataFile) ? dataFile : [dataFile]).map(
      file => {
        // Use the preloaded file, if it exists
        const preloadedUrl = PreloaderService.get(file);

        // Force uncaching
        const url = preloadedUrl.startsWith('data:')
          ? preloadedUrl
          : `${preloadedUrl}${
              preloadedUrl.includes('?') ? '&' : '?'
            }timestamp=${Date.now()}`;

        return url;
      }
    );

    if (IS_DEBUG)
      console.log(
        'Sound-- Creating',
        this.id,
        urlArray.map(truncateUrl).join(' ')
      );

    this.sound = new Howl({
      src: urlArray,
      format: data.format,
      volume: this.data.volume,
      loop: this.data.loop,
      preload: true,
      ...(this.data.sprite ? { sprite: this.data.sprite } : {}),
      onloaderror: (id, errorMessage) => {
        if (IS_DEBUG)
          console.log(
            'Sound -- Unrecognized sound:',
            this.id,
            id,
            errorMessage
          );
      },
      onpause: () => {
        this.isPaused = true;
      },
    });

    if (this.data.pannerAttr) {
      this.setPannerAttr({
        pannerAttr: this.data.pannerAttr,
      });
    }

    const proceed = () => {
      this.isLoaded = true;
      onLoaded();
    };

    if (this.sound.state() === 'loaded') {
      if (IS_DEBUG) console.log('Sound -- Already loaded', this.id, this);
      proceed();
    } else {
      this.sound.once('load', () => {
        if (IS_DEBUG) console.log('Sound -- Loaded', this.id, this);
        proceed();
      });
    }
  }

  unload() {
    this.clearTweens();
    this.stop();

    this.sound.unload();
    this.isLoaded = false;
  }

  play(config: Partial<SoundConfig> = DEFAULT_SOUND_CONFIG) {
    if (!this.sound) return;

    const soundConfig = { ...DEFAULT_SOUND_CONFIG, ...config };
    const {
      fadeDuration,
      from,
      onEnd,
      onStart,
      onProgress,
      onStop,
      delay,
      spriteName,
    } = soundConfig;

    const proceed = () => {
      if (onEnd) this.sound.once('end', onEnd);
      if (onStop) this.sound.once('stop', onStop);
      if (onStart || onProgress)
        this.sound.once('play', () => {
          this.isPaused = false;
          if (onStart) onStart();
          if (onProgress) this.setProgressLoop(onProgress);
        });

      if (spriteName) this.sound.play(spriteName);
      else {
        if (Number.isFinite(from)) this.sound.seek(from);
        this.sound.play();
      }
    };

    return this.tweenValue({
      valueName: 'volume',
      value: this.sound.volume() ?? this.data.volume,
      tween: this.volumeTween,
      duration: fadeDuration,
      delay,
      from: 0,
      onStart: proceed,
    });
  }

  pause(fadeDuration = 0, callback?: () => void) {
    if (!this.sound) return;

    const proceed = () => {
      this.sound.pause();
      if (callback) callback();
    };

    if (fadeDuration) return this.setVolume(0, fadeDuration, proceed);
    proceed();
  }

  stop(fadeDuration = 0, callback?: () => void) {
    if (!this.sound) return;
    this.sound.off('end');

    const currentVolume = this.sound.volume();
    const proceed = () => {
      this.sound.stop();
      this.clearRAF();
      this.isPaused = false;
      this.setVolume(currentVolume);
      if (callback) callback();
    };

    if (fadeDuration) return this.setVolume(0, fadeDuration, proceed);
    proceed();
  }

  setVolume(volume: number, transitionDuration = 0, callback?: () => void) {
    if (!this.sound) return;

    return this.tweenValue({
      valueName: 'volume',
      value: volume,
      tween: this.volumeTween,
      duration: transitionDuration,
      onEnd: callback,
    });
  }

  setRate(rate: number, transitionDuration = 0, callback?: () => void) {
    if (!this.sound) return;
    return this.tweenValue({
      valueName: 'rate',
      value: rate,
      tween: this.rateTween,
      duration: transitionDuration,
      onEnd: callback,
    });
  }

  setPan(pan: number, transitionDuration = 0, callback?: () => void) {
    if (!this.sound) return;
    return this.tweenValue({
      valueName: 'stereo',
      value: pan,
      tween: this.panTween,
      duration: transitionDuration,
      onEnd: callback,
    });
  }

  setPos(pos: Vector3, transitionDuration = 0, callback?: () => void) {
    if (!this.sound) return;
    return this.tweenVector({
      vectorName: 'pos',
      vector: pos,
      tween: this.posTween,
      duration: transitionDuration,
      onEnd: callback,
    });
  }

  setOrientation(
    orientation: Vector3,
    transitionDuration = 0,
    callback?: () => void
  ) {
    if (!this.sound) return;
    return this.tweenVector({
      vectorName: 'orientation',
      vector: orientation,
      tween: this.orientationTween,
      duration: transitionDuration,
      onEnd: callback,
    });
  }

  setPannerAttr({
    pannerAttr,
    transitionDuration = 0,
    from = {},
    callback,
    shouldSetNTPAtEnd = false,
  }: {
    pannerAttr: Partial<PannerAttributes>;
    transitionDuration?: number;
    from?: Partial<PannerAttributes>;
    callback?: () => void;
    shouldSetNTPAtEnd?: boolean;
  }) {
    if (!this.sound) return;

    clearTween(this.pannerAttrTween);

    if (transitionDuration) {
      const currentAttr = this.sound.pannerAttr();
      const { distanceModel, panningModel, ...tweenableProps } = pannerAttr;
      const dummy = { ...currentAttr, ...from };

      const setNonTweenableProps = () => {
        this.sound.pannerAttr({
          ...(distanceModel ? { distanceModel } : {}),
          ...(panningModel ? { panningModel } : {}),
        });
      };

      if (!shouldSetNTPAtEnd) setNonTweenableProps();
      this.pannerAttrTween = gsap.to(dummy, {
        duration: transitionDuration,
        ...tweenableProps,
        onUpdate: () => {
          this.sound.pannerAttr(dummy);
        },
        onComplete: () => {
          this.pannerAttrTween = null;
          if (shouldSetNTPAtEnd) setNonTweenableProps();
          if (callback) callback();
        },
      });

      return this.pannerAttrTween;
    }

    this.sound.pannerAttr(pannerAttr);
    if (callback) callback();
  }

  private tweenValue({
    valueName,
    value,
    tween,
    duration = 0,
    delay = 0,
    from = null,
    onStart,
    onEnd,
  }: TweenValueConfig) {
    if (!this.sound) return;

    const updateMethod: (value?: number) => number = this.sound[valueName].bind(
      this.sound
    );

    clearTween(tween);

    if (duration || delay) {
      const dummy = { value: from ?? updateMethod() };

      tween = gsap.to(dummy, {
        duration,
        delay,
        value,
        onStart: () => {
          if (onStart) onStart();
        },
        onUpdate: () => {
          updateMethod(dummy.value);
        },
        onComplete: () => {
          tween = null;
          if (onStart && !duration) onStart();
          if (onEnd) onEnd();
        },
      });

      return tween;
    }

    if (onStart) onStart();
    updateMethod(value);
    if (onEnd) onEnd();
  }

  private tweenVector({
    vectorName,
    vector,
    tween,
    duration = 0,
    delay = 0,
    from = {},
    onStart,
    onEnd,
  }: TweenVectorConfig) {
    if (!this.sound) return;

    const updateMethod: (
      x?: number,
      y?: number,
      z?: number
    ) => SpatialPosition | Howl = this.sound[vectorName].bind(this.sound);

    clearTween(tween);

    if (duration) {
      const [currentX, currentY, currentZ] =
        (updateMethod() as SpatialPosition) || [0, 0, 0];
      const currentVector = { x: currentX, y: currentY, z: currentZ };
      const dummy = { ...currentVector, ...from };

      tween = gsap.to(dummy, {
        duration,
        delay,
        ...vector,
        onStart: () => {
          if (onStart) onStart();
        },
        onUpdate: () => {
          const { x, y, z } = dummy;
          updateMethod(x, y, z);
        },
        onComplete: () => {
          tween = null;
          if (onEnd) onEnd();
        },
      });

      return tween;
    }

    if (onStart) onStart();
    const { x, y, z } = vector;
    updateMethod(x, y, z);
    if (onEnd) onEnd();
  }

  private clearTweens() {
    [
      this.volumeTween,
      this.rateTween,
      this.posTween,
      this.orientationTween,
      this.pannerAttrTween,
    ].forEach(clearTween);
  }

  private setProgressLoop(onProgress: (position: number) => void) {
    this.sound.once('end', this.clearRAF);

    if (this.rAF) this.clearRAF();
    let rAF: number;

    const onRAF = () => {
      const position = this.sound.seek();
      if (this.state.isPlaying && position !== this.previousPosition) {
        onProgress(position);
        this.previousPosition = position;
      }

      // Check whether the progress callback has been updated since
      if (this.onProgress !== onRAF) {
        window.cancelAnimationFrame(rAF);
        rAF = null;
      } else this.rAF = window.requestAnimationFrame(onRAF);
    };

    this.onProgress = onRAF;
    rAF = window.requestAnimationFrame(onRAF);
    this.rAF = rAF;
  }

  private clearRAF() {
    if (this.rAF) {
      window.cancelAnimationFrame(this.rAF);
      this.rAF = null;
    }

    if (this.onProgress) this.onProgress = null;
  }
}
