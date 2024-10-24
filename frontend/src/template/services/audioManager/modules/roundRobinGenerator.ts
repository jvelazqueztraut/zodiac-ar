import { DEFAULT_ROUND_ROBIN_CONFIG } from '../audioManager.data';
import AudioManager from '../audioManager.service';
import { RoundRobin, RoundRobinConfig } from '../audioManager.types';
import Sound from './sound';

import { isStorybook } from 'template/utils/platform';

const IS_DEBUG = isStorybook() || (process.env.IS_DEBUG && false);

class RoundRobinGenerator {
  private roundRobins: Record<string, RoundRobin>;

  get pool() {
    return this.audioManager.pool;
  }

  constructor(private audioManager: typeof AudioManager) {
    this.roundRobins = {};
  }

  create(
    id: RoundRobin['id'],
    dataArray: RoundRobin['dataArray'],
    config: Partial<RoundRobinConfig> = DEFAULT_ROUND_ROBIN_CONFIG
  ) {
    const roundRobinConfig = { ...DEFAULT_ROUND_ROBIN_CONFIG, ...config };

    const roundRobin: RoundRobin = {
      id,
      dataArray,
      iterator: -1,
      timeout: null,
      isPlaying: false,
      isLooping: false,
      config: roundRobinConfig,
    };

    if (this.roundRobins[id]) {
      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- createRoundRobin -- Round robin with id',
          id,
          'already exists'
        );
    } else {
      if (IS_DEBUG)
        console.log('RoundRobinGenerator -- createRoundRobin', roundRobin);
      this.roundRobins[id] = roundRobin;
    }

    return this.get(id);
  }

  dispose() {
    if (IS_DEBUG) console.log('RoundRobinGenerator -- dispose');
    this.stopAll();
    this.roundRobins = {};
  }

  // Play a random sound effect within a given bucket
  play(
    id: RoundRobin['id'],
    shouldResumeLooping = true,
    configUpdate: Partial<RoundRobinConfig> = {},
    onEnd?: () => void
  ) {
    const roundRobin = this.roundRobins[id];

    if (roundRobin) {
      // Update the config if necessary
      if (configUpdate && Object.keys(configUpdate).length) {
        const roundRobinConfig = {
          ...DEFAULT_ROUND_ROBIN_CONFIG,
          ...configUpdate,
        };
        roundRobin.config = {
          ...roundRobin.config,
          ...roundRobinConfig,
        };
      }

      const shouldResume = shouldResumeLooping && roundRobin.isLooping;
      if (roundRobin.isPlaying) {
        if (IS_DEBUG)
          console.log(
            'RoundRobinGenerator -- play -- Pause looping interval and play a sound immediately'
          );
        this.stop(roundRobin.id, true, false);
      }

      // We pick the next sound
      const { iterator, pan } = this.setupRandomSound(roundRobin);
      roundRobin.iterator = iterator;

      const data = roundRobin.dataArray[roundRobin.iterator];
      roundRobin.isPlaying = true;

      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- play',
          roundRobin.id,
          '-- Play sound',
          data,
          '-- config update:',
          configUpdate
        );

      const poolSound: Sound = this.pool[data.id];
      poolSound.setPan(pan);
      this.audioManager.play(data, {
        onStart: () => {
          if (roundRobin.config.onStart) roundRobin.config.onStart(data);
        },
        onEnd: () => {
          roundRobin.isPlaying = false;

          if (shouldResume) {
            if (IS_DEBUG)
              console.log('RoundRobinGenerator -- play -- Resume looping');

            const delay = this.getRandomDelay(
              roundRobin.config.minWait,
              roundRobin.config.maxWait
            );
            this.start(roundRobin.id, roundRobin.dataArray, {
              delay,
            });
          }

          if (roundRobin.config.onEnd) roundRobin.config.onEnd();
          if (onEnd) onEnd();
        },
      });
    } else {
      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- play -- Unregistered round robin:',
          id
        );
    }
  }

  // Loop random sound effects from a bucket playing at random intervals
  start(
    id: RoundRobin['id'],
    dataArray?: RoundRobin['dataArray'],
    config: Partial<RoundRobinConfig> = DEFAULT_ROUND_ROBIN_CONFIG
  ) {
    const roundRobinConfig = { ...DEFAULT_ROUND_ROBIN_CONFIG, ...config };
    const { delay } = roundRobinConfig;

    // Update the config if necessary
    if (this.roundRobins[id]) {
      this.roundRobins[id].config = {
        ...this.roundRobins[id].config,
        ...roundRobinConfig,
      };
    }

    const roundRobin =
      !dataArray || this.roundRobins[id]
        ? this.roundRobins[id]
        : (this.create(id, dataArray, roundRobinConfig) as RoundRobin);

    if (roundRobin.timeout) {
      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- start',
          roundRobin.id,
          '-- Timeout already present. Clearing.'
        );
      this.stop(roundRobin.id, true);
    }

    if (IS_DEBUG)
      console.log(
        'RoundRobinGenerator -- start',
        roundRobin,
        '-- Start in',
        delay,
        'seconds'
      );

    roundRobin.isLooping = true;
    roundRobin.timeout = window.setTimeout(() => {
      this.loopPlay(roundRobin);
    }, delay * 1000);

    return this.get(id);
  }

  stop(id: RoundRobin['id'], shouldCutTrail = false, shouldCleanUp = true) {
    const roundRobin = this.roundRobins[id];

    if (roundRobin) {
      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- stop',
          id,
          shouldCutTrail,
          shouldCleanUp
        );

      this.clearEvents(id);

      if (shouldCutTrail && roundRobin.isPlaying) {
        const playedData = roundRobin.dataArray[roundRobin.iterator];
        const poolSound: Sound = this.pool[playedData.id];
        poolSound.stop();
      }
      roundRobin.isPlaying = false;
      roundRobin.isLooping = false;
      if (shouldCleanUp) roundRobin.iterator = -1;
    } else {
      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- stop -- Unregistered round robin:',
          id
        );
    }
  }

  stopAll() {
    if (IS_DEBUG) console.log('RoundRobinGenerator -- stopAll');
    Object.values(this.roundRobins).forEach(roundRobin => {
      this.stop(roundRobin.id, true);
    });
  }

  get(id: RoundRobin['id']) {
    return this.roundRobins[id] as Readonly<RoundRobin>;
  }

  getAll() {
    return Object.values(this.roundRobins) as Readonly<RoundRobin[]>;
  }

  // Choose a random sound, randomise the panning if enabled
  private setupRandomSound(roundRobin: RoundRobin) {
    let iterator: number;

    // Start with a given index, if specified
    if (
      roundRobin.dataArray[roundRobin.config.startWith] &&
      roundRobin.iterator === -1
    ) {
      iterator = roundRobin.config.startWith;
    } else {
      // If not, we can pick any sound but the one just played
      const potentialNextIndexes = roundRobin.dataArray
        .map((_, index) => index)
        .filter(index => index !== roundRobin.iterator);

      // Unless there's only one sound available,
      // In which case we make it selectable anyway
      if (potentialNextIndexes.length === 0)
        potentialNextIndexes.push(roundRobin.iterator);

      // Finally, we pick an index at random
      iterator =
        potentialNextIndexes[
          Math.floor(Math.random() * potentialNextIndexes.length)
        ];
    }

    // We also randomise the pan, if the config demands it
    let pan: number;
    if (
      Array.isArray(roundRobin.config.pan) &&
      Array.isArray(roundRobin.config.pan[roundRobin.iterator])
    ) {
      if ((roundRobin.config.pan[iterator] as [number, number]).length === 2) {
        const minPan =
          Math.min(...(roundRobin.config.pan[iterator] as [number, number])) ??
          0;
        const maxPan =
          Math.max(...(roundRobin.config.pan[iterator] as [number, number])) ??
          0;
        pan = minPan + Math.random() * (maxPan - minPan);
        pan = parseFloat(pan.toFixed(2));
      } else {
        pan = roundRobin.config.pan[iterator][0] ?? 0;
      }
    }

    return { pan, iterator };
  }

  private readonly loopPlay = (roundRobin: RoundRobin) => {
    if (roundRobin.timeout) {
      window.clearTimeout(roundRobin.timeout);
      roundRobin.timeout = null;
    }

    this.play(roundRobin.id, false, null, () => {
      const delay = this.getRandomDelay(
        roundRobin.config.minWait,
        roundRobin.config.maxWait
      );

      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- start',
          roundRobin.id,
          '-- Wait',
          delay,
          'seconds'
        );

      // Once the sound is done playing, play another sound at a randomised interval
      roundRobin.timeout = window.setTimeout(() => {
        this.loopPlay(roundRobin);
      }, delay * 1000);
    });
  };

  private clearEvents(id: RoundRobin['id']) {
    const roundRobin = this.roundRobins[id];

    if (roundRobin) {
      if (IS_DEBUG) console.log('RoundRobinGenerator -- clearEvents', id);

      if (roundRobin.timeout) {
        window.clearTimeout(roundRobin.timeout);
        roundRobin.timeout = null;
      }

      roundRobin.dataArray.forEach(data => {
        const poolSound: Sound = this.pool[data.id];
        poolSound.sound.off('end');
      });
    } else {
      if (IS_DEBUG)
        console.log(
          'RoundRobinGenerator -- clearEvents -- Unregistered round robin:',
          id
        );
    }
  }

  private getRandomDelay(min: number, max: number) {
    let delay = min + Math.random() * (max - min);
    delay = parseFloat(delay.toFixed(2));
    return delay;
  }
}

export default RoundRobinGenerator;
