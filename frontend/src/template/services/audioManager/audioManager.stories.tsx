import React, { useEffect, useRef, useState } from 'react';

import { SOUNDS_DATA, SoundType } from './audioManager.data';
import AudioManager from './audioManager.service';
import { RoundRobin, SoundData, Vector3 } from './audioManager.types';

import { useTouch } from 'template/hooks';

export default {
  title: 'Audio',
  parameters: {
    layout: 'centered',
  },
};

// Random value between -1 and 1
const getRandomValue = () => +(-1 + Math.random() * 2).toFixed(2);
const roundDec = (num: number, dec: number) => {
  const pow = Math.pow(10, dec);
  return Math.round(num * pow) / pow;
};

export const Normal = () => {
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoadComplete, setLoadComplete] = useState<boolean>(false);
  const roundRobin = useRef<RoundRobin>(null);
  const isPointerDown = useRef<boolean>(false);
  const spatializedSounds = useRef<SoundData[]>([]);
  const spatialPosition = useRef<Vector3>({ x: 0, y: 0, z: 0 });
  const loopLastPosition = useRef<number>(0);
  const loopCount = useRef<number>(0);

  const onPointerDown = () => {
    isPointerDown.current = true;
  };

  const onPointerUp = () => {
    isPointerDown.current = false;
  };

  const onPointerMove = (x: number, y: number) => {
    if (!AudioManager.isReady || !isPointerDown.current) return;

    // Simulate moving around a sphere
    const hlookat = (x / window.innerWidth) * 360 - 180;
    const vlookat = (y / window.innerHeight) * 180 - 90;
    const theta = ((hlookat % 360) + 90) * (Math.PI / 180);
    const phi = ((vlookat % 180) - 90) * (Math.PI / 180);
    const r = 1;
    spatialPosition.current = {
      x: roundDec(r * Math.sin(phi) * Math.cos(theta), 2),
      y: roundDec(r * Math.cos(phi), 2),
      z: roundDec(r * Math.sin(phi) * Math.sin(theta), 2),
    };

    moveWolfSounds();
  };

  const moveWolfSounds = () => {
    spatializedSounds.current.forEach(soundData => {
      // Only apply changes to the active sounds for performance
      if (AudioManager.getSoundState(soundData)?.isPlaying) {
        AudioManager.setPos(soundData, spatialPosition.current);
      }
    });
  };

  useTouch({
    onStart: onPointerDown,
    onMove: onPointerMove,
    onEnd: onPointerUp,
  });

  useEffect(() => {
    AudioManager.load({
      onLoadProgress: setLoadProgress,
      onLoadComplete: () => {
        setLoadProgress(100);

        roundRobin.current = AudioManager.createRoundRobin('wolfGrowl', [
          SOUNDS_DATA.wolfGrowl1,
          SOUNDS_DATA.wolfGrowl2,
          SOUNDS_DATA.wolfGrowl3,
          SOUNDS_DATA.wolfGrowl4,
          SOUNDS_DATA.wolfGrowl5,
          SOUNDS_DATA.wolfGrowl6,
        ]);

        spatializedSounds.current = AudioManager.getType(SoundType.SFX);
        spatializedSounds.current.forEach(soundData => {
          AudioManager.setPannerAttr(soundData, {
            rolloffFactor: 1,
            distanceModel: 'linear',
            maxDistance: 100000,
            refDistance: 100,
          });
        });

        setLoadComplete(true);
      },
    });

    return () => {
      AudioManager.unload();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '120rem',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '60rem',
        }}
      >
        Load progress: {Math.floor(loadProgress)}%<br />
        State: {isLoadComplete ? 'Loaded' : 'Loading'}
        <br />
        <br />
        Start the round robin and move your mouse around
        <br />
        while pressing down to move the wolf along with it!
      </div>

      {Object.values(SOUNDS_DATA).map(soundData => (
        <div
          key={soundData.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '30rem',
          }}
        >
          <button
            onClick={() => {
              if (soundData.id !== SOUNDS_DATA.winterHasComeLoop.id) {
                AudioManager.play(soundData);
                return;
              }

              // Play the track from its intro until the end of the loop section once,
              // play the loop section twice (heard three times total),
              // then play the end section
              const maxLoopCount = 3;
              const FPS = 60;
              const tickMarginFactor = 4;
              const howl = AudioManager.getHowl(soundData);
              const loopStartPoint = soundData.sprite['loop'][0] / 1000;
              const loopDuration = soundData.sprite['loop'][1] / 1000;
              const loopEndPoint = loopStartPoint + loopDuration;
              const endStartPoint = soundData.sprite['end'][0] / 1000;

              let bufferSourceNode: AudioBufferSourceNode;
              let startPosition: number;
              let startTime: number;
              let loopEndTime: number;
              let currentLoopCount = 0;

              const cleanup = () => {
                loopLastPosition.current = 0;
                loopCount.current = 0;
              };

              const onLoop = () => {
                const shouldEnd = loopCount.current >= maxLoopCount;
                console.log(
                  '-- Play count:',
                  loopCount.current,
                  `-- ${shouldEnd ? 'End' : 'Loop'}`
                );

                if (shouldEnd) {
                  AudioManager.play(soundData, {
                    from: endStartPoint,
                    shouldSkipFade: true,
                    onEnd: cleanup,
                    onStop: cleanup,
                  });
                }
              };

              AudioManager.play(soundData, {
                from:
                  loopCount.current >= maxLoopCount
                    ? null
                    : AudioManager.getSoundState(soundData).isPaused
                    ? loopLastPosition.current
                    : 0,
                onStart: () => {
                  if (loopCount.current >= maxLoopCount) return;

                  startPosition = howl.seek();
                  startTime = AudioManager.Howler.ctx.currentTime;
                  loopEndTime =
                    startTime + loopEndPoint - loopLastPosition.current;

                  bufferSourceNode =
                    howl['_sounds'][0]['_node']['bufferSource'];

                  bufferSourceNode.loopStart = loopStartPoint;
                  bufferSourceNode.loopEnd = loopEndPoint;
                  bufferSourceNode.loop = true;
                },
                onProgress: () => {
                  if (loopCount.current >= maxLoopCount) return;

                  const currentTime = AudioManager.Howler.ctx.currentTime;
                  const nextTickTime =
                    currentTime + 1 / (FPS / tickMarginFactor);

                  loopLastPosition.current =
                    startPosition +
                    currentTime -
                    startTime -
                    currentLoopCount * loopDuration;

                  if (nextTickTime >= loopEndTime) {
                    loopEndTime += loopDuration;
                    loopCount.current++;
                    currentLoopCount++;
                    onLoop();
                  }
                },
                onStop: () => {
                  if (loopCount.current >= maxLoopCount) return;
                  cleanup();
                },
              });
            }}
          >
            Play {soundData.id}
          </button>
          <button onClick={() => AudioManager.pause(soundData)}>
            Pause {soundData.id}
          </button>
          <button onClick={() => AudioManager.stop(soundData)}>
            Stop {soundData.id}
          </button>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '30rem',
        }}
      >
        <button
          onClick={() => {
            if (roundRobin.current)
              AudioManager.playRoundRobin(roundRobin.current.id);
          }}
        >
          Play a random sound in the bucket ({roundRobin.current?.id})
        </button>
        <button
          onClick={() => {
            if (roundRobin.current)
              AudioManager.startRoundRobin(
                roundRobin.current.id,
                roundRobin.current.dataArray,
                {
                  // Update the 3D positioning when starting a sound
                  onStart: moveWolfSounds,
                }
              );
          }}
        >
          Start round robin ({roundRobin.current?.id})
        </button>
        <button
          onClick={() => {
            if (roundRobin.current) {
              AudioManager.stopRoundRobin(roundRobin.current.id);
            }
          }}
        >
          Stop round robin ({roundRobin.current?.id})
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '30rem',
        }}
      >
        <button
          onClick={() => {
            AudioManager.setVolume(
              SOUNDS_DATA.winterHasCome,
              0.1 * SOUNDS_DATA.winterHasCome.volume,
              0.5
            );
          }}
        >
          Set the BGM&apos;s volume to 10% (with a 0.5s fade)
        </button>
        <button
          onClick={() => {
            AudioManager.setVolume(
              SOUNDS_DATA.winterHasCome,
              SOUNDS_DATA.winterHasCome.volume
            );
          }}
        >
          Reset the BGM&apos;s volume (immediately)
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '30rem',
        }}
      >
        <button
          onClick={() => {
            AudioManager.toggleMute(0.2);
          }}
        >
          Toggle mute (with a 0.2s fade)
        </button>
        <button
          onClick={() => {
            AudioManager.stopAll(0.2);
          }}
        >
          Stop all sounds (with a 0.2s fade out)
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '30rem',
        }}
      >
        <button
          onClick={() => {
            AudioManager.setRate(SOUNDS_DATA.winterHasCome, 2, 0.5);
          }}
        >
          Set the BGM&apos;s rate to 200% (with a 0.5s transition)
        </button>
        <button
          onClick={() => {
            AudioManager.setRate(SOUNDS_DATA.winterHasCome, 1);
          }}
        >
          Reset the BGM&apos;s rate (immediately)
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '30rem',
        }}
      >
        <button
          onClick={() => {
            AudioManager.getType(SoundType.BGS).forEach(soundData => {
              AudioManager.setPan(soundData, getRandomValue(), 0.2);
            });
          }}
        >
          Randomise the BGS panning (with a 0.2s transition)
        </button>
        <button
          onClick={() => {
            AudioManager.getType(SoundType.BGS).forEach(soundData => {
              AudioManager.setPan(soundData, 0);
            });
          }}
        >
          Reset the BGS panning (immediately)
        </button>
        <button
          onClick={() => {
            spatialPosition.current = { x: 0, y: 0, z: 0 };
            AudioManager.getType(SoundType.SFX).forEach(soundData => {
              AudioManager.setPos(soundData, spatialPosition.current, 0.2);
            });
          }}
        >
          Reset the SFXs&apos; spatial posititioning (with a 0.2s transition)
        </button>
      </div>
    </div>
  );
};
