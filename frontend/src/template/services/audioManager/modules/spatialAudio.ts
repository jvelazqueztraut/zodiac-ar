import gsap from 'gsap';
import { PannerAttributes } from 'howler';

import AudioManager, { clearTween } from '../audioManager.service';
import { ListenerOrientation, SoundData, Vector3 } from '../audioManager.types';
import Sound from './sound';

import { isStorybook } from 'template/utils/platform';

const IS_DEBUG = isStorybook() || (process.env.IS_DEBUG && false);

class SpatialAudio {
  private initialSpatialAudio: {
    pos: SpatialAudio['listenerPos'];
    orientation: SpatialAudio['listenerOrientation'];
  };

  private posTween: gsap.core.Tween;
  private orientationTween: gsap.core.Tween;

  get listenerPos() {
    const [x, y, z] = Array.from(Howler.pos());
    return { x, y, z };
  }

  private set listenerPos({ x, y, z }: Vector3) {
    Howler.pos(x, y, z);
  }

  get listenerOrientation() {
    // Appears to be a TypeScript definition overlook
    // The three last items are indeed returned
    const [x, y, z, xUp, yUp, zUp] = Array.from(
      Howler.orientation()
    ) as number[];
    return { x, y, z, xUp, yUp, zUp };
  }

  private set listenerOrientation({
    x,
    y,
    z,
    xUp,
    yUp,
    zUp,
  }: ListenerOrientation) {
    Howler.orientation(x, y, z, xUp, yUp, zUp);
  }

  get pool() {
    return this.audioManager.pool;
  }

  get isUnlocked() {
    return this.audioManager.isUnlocked;
  }

  constructor(private audioManager: typeof AudioManager) {
    this.initialSpatialAudio = {
      pos: this.listenerPos,
      orientation: this.listenerOrientation,
    };
  }

  dispose() {
    if (IS_DEBUG) console.log('SpatialAudio -- dispose');
    [this.posTween, this.orientationTween].forEach(clearTween);
    this.listenerPos = this.initialSpatialAudio.pos;
    this.listenerOrientation = this.initialSpatialAudio.orientation;
  }

  // Sounds
  setPan(
    soundData: SoundData,
    pan: number,
    transitionDuration?: number,
    callback?: () => void
  ) {
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'SpatialAudio -- setPan',
          soundData.id,
          pan,
          'in',
          transitionDuration,
          'seconds'
        );

      poolSound.setPan(pan, transitionDuration, () => {
        if (IS_DEBUG)
          console.log('SpatialAudio -- setPan', soundData.id, '-- Finished');
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log('SpatialAudio -- setPan -- Unregistered sound:', soundData);
    }
  }

  setPos(
    soundData: SoundData,
    pos: Vector3,
    transitionDuration?: number,
    callback?: () => void
  ) {
    if (!this.isUnlocked) return;
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'SpatialAudio -- setPos',
          soundData.id,
          pos,
          'in',
          transitionDuration,
          'seconds'
        );

      poolSound.setPos(pos, transitionDuration, () => {
        if (IS_DEBUG)
          console.log('SpatialAudio -- setPos', soundData.id, '-- Finished');
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log('SpatialAudio -- setPos -- Unregistered sound:', soundData);
    }
  }

  setOrientation(
    soundData: SoundData,
    orientation: Vector3,
    transitionDuration?: number,
    callback?: () => void
  ) {
    if (!this.isUnlocked) return;
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'SpatialAudio -- setOrientation',
          soundData.id,
          orientation,
          'in',
          transitionDuration,
          'seconds'
        );

      poolSound.setOrientation(orientation, transitionDuration, () => {
        if (IS_DEBUG)
          console.log(
            'SpatialAudio -- setOrientation',
            soundData.id,
            '-- Finished'
          );
        if (callback) callback();
      });
    } else {
      if (IS_DEBUG)
        console.log(
          'SpatialAudio -- setRate -- Unregistered sound:',
          soundData
        );
    }
  }

  setPannerAttr(
    soundData: SoundData,
    pannerAttr: Partial<PannerAttributes>,
    transitionDuration?: number,
    callback?: () => void,
    shouldSetNTPAtEnd = false
  ) {
    if (!this.isUnlocked) return;
    const poolSound: Sound = this.pool[soundData.id];

    if (poolSound) {
      if (IS_DEBUG)
        console.log(
          'SpatialAudio -- setPannerAttr',
          soundData.id,
          pannerAttr,
          'in',
          transitionDuration,
          'seconds'
        );

      poolSound.setPannerAttr({
        pannerAttr,
        transitionDuration,
        callback: () => {
          if (IS_DEBUG)
            console.log(
              'SpatialAudio -- setPannerAttr',
              soundData.id,
              '-- Finished'
            );
          if (callback) callback();
        },
        shouldSetNTPAtEnd,
      });
    } else {
      if (IS_DEBUG)
        console.log(
          'SpatialAudio -- setRate -- Unregistered sound:',
          soundData
        );
    }
  }

  // Global
  setListenerPos(pos: Vector3, transitionDuration = 0, callback?: () => void) {
    if (!this.isUnlocked) return;
    if (IS_DEBUG)
      console.log(
        'SpatialAudio -- setListenerPos',
        pos,
        'in',
        transitionDuration,
        'seconds'
      );

    clearTween(this.posTween);

    if (transitionDuration) {
      this.posTween = gsap.to(this.listenerPos, {
        duration: transitionDuration,
        ...pos,
        onComplete: () => {
          this.posTween = null;

          if (IS_DEBUG)
            console.log('SpatialAudio -- setListenerPos -- Finished');
          if (callback) callback();
        },
      });
    }

    if (IS_DEBUG) console.log('SpatialAudio -- setListenerPos -- Finished');
    this.listenerPos = pos;
  }

  setListenerOrientation(
    orientation: ListenerOrientation,
    transitionDuration = 0,
    callback?: () => void
  ) {
    if (!this.isUnlocked) return;
    if (IS_DEBUG)
      console.log(
        'SpatialAudio -- setListenerPos',
        orientation,
        'in',
        transitionDuration,
        'seconds'
      );

    clearTween(this.orientationTween);

    if (transitionDuration) {
      this.orientationTween = gsap.to(this.listenerOrientation, {
        duration: transitionDuration,
        ...orientation,
        onComplete: () => {
          this.orientationTween = null;

          if (IS_DEBUG)
            console.log('SpatialAudio -- setListenerOrientation -- Finished');
          if (callback) callback();
        },
      });
    }

    this.listenerOrientation = orientation;
    if (IS_DEBUG)
      console.log('SpatialAudio -- setListenerOrientation -- Finished');
  }
}

export default SpatialAudio;
