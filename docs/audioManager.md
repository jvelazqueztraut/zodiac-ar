<img src="./images/logo.png" width="100" />

# AudioManager
![readme for version](https://img.shields.io/badge/readme%20for%20version-4.5.0-brightgreen) ![docs status](https://img.shields.io/badge/docs%20status-finished-brightgreen)


---

The `AudioManager` builds upon howler.js to cover all of the common audio needs for web development.
<br />

## Features
All of howler.js' features (including audio sprites and spatialisation), plus...
- A preloader with batch loading support
- Customisable types (BGM, BGS, SFX, etc.) to allow for audio layers management
- Fades for all tweenable properties without any extra code required
- [Round robins](https://help.ableton.com/hc/en-us/articles/115000267664-How-to-create-Round-Robin-sample-playback#:~:text=Round%2Drobin%20is%20a%20method,variations%20in%20otherwise%20static%20patterns.) with randomised interval and panning support
<br />

## Tech stack
- [howler.js](https://github.com/goldfire/howler.js)
- [GSAP](https://greensock.com/docs)
- [Storybook](https://storybook.js.org/docs/react/get-started/introduction)
- [The Base Web's `EventManager`](./../README.md#using-the-eventmanager)
- [The Base Web's `PreloadService`](./../README.md#using-the-preloaderservice)
<br />

## Browser compatibility
All modern browsers (Chrome, Firefox, Opera, Edge, Safari, etc.), with no required configuration.

<br />

---
## Contents
- [Quick start](#quick-start)
- [`AudioManager`](#audiomanager-api)
  - [Properties](#properties)
  - [Methods](#methods)
  - [Events](#events)
  - [Interfaces and configuration](#interfaces-and-configuration)
- [What's next?](#whats-next)

<br />

---
## Quick start
The audio engine is always available from `/frontend/src/template/services/audioManager/audioManager.service.ts`. The initial batch of sounds to load can be configured in `audioManager.data.ts`. It can be tested through its Storybook story.

Setting up the sounds in `/frontend/src/template/services/audioManager/audioManager.data.ts`
```ts
import BgmSomeBGM from 'assets/sounds/bgm/someBGM.mp3';
import BgsSomeBGS from 'assets/sounds/bgs/someBGS.mp3';
import SfxSomeSFXmp3 from 'assets/sounds/sfx/someSFX.mp3';
import SfxSomeSFXwav from 'assets/sounds/sfx/someSFX.wav';

export enum SoundFile {
  someBGM = 'someBGM',
  someBGS = 'someBGS',
  someSFX = 'someSFX',
}

export enum SoundType {
  // Background music (only one played at the same time)
  BGM = 'BGM',
  // Background sound (ambience sounds, etc.)
  BGS = 'BGS',
  // Sound effects
  SFX = 'SFX',
}

const initialData: SoundDataSettings = {
  // BGM
  someBGM: {
    type: SoundType.BGM,
    file: BgmSomeBGM,
    loop: true,
    volume: 0.3,
  },

  // BGS
  someBGS: {
    type: SoundType.BGS,
    file: BgsSomeBGS,
    sprite: {
      // Start time and duration in ms, loop flag
      ambience1: [0, 15000, true],
      // Or using timecodes (can use h:ms:s.ms or h:m:s:f, defaulting to 30 fps)
      ambience2: [...getSpriteTimes(['00:00:15.00', '00:00:30.00']), true],
    } as SoundData['sprite'],
    volume: 0.25,
  },

  // SFX
  someSFX: {
    type: SoundType.SFX,
    // In order of preference
    file: [SfxSomeSFXwav, SfxSomeSFXmp3] as string[],
    format: ['wav', 'mp3'] as string[],
    volume: 0.9,
  }
}
```

Default initialisation
```tsx
const [audioLoadProgress, setAudioLoadProgress] = useState<number>(0);
const [isAudioLoadComplete, setAudioLoadComplete] = useState<boolean>(false);

useEffect(() => {
  AudioManager.load({
    onLoadProgress: setLoadProgress,
    onLoadComplete: () => {
      setLoadProgress(100);
      // Any additional setup (round robins creation, etc.)
      setLoadComplete(true);
    },
  });

  return () => {
    AudioManager.unload();
  };
}, []);
```
<br />

The `AudioManager` will try to load the sounds from the `PreloaderService`'s cache first, so it is possible to preload audio using it.

<br />

Loading additional sounds
```tsx
const [audioLoadProgress, setAudioLoadProgress] = useState<number>(0);

const onPageChange = async() => {
  setLoadProgress(0);

  // The sounds can also be loaded from a distant URL
  const pageSounds = await fetchSounds();

  AudioManager.load({
    data: pageSounds,
    onLoadProgress: setLoadProgress,
    onLoadComplete: () => {
      setLoadProgress(100);
    },
  });
};
```

<br />

Creating and using a round robin
```tsx
roundRobin.current = AudioManager.createRoundRobin('wolfGrowl', [
  SOUNDS_DATA.wolfGrowl1,
  SOUNDS_DATA.wolfGrowl2,
  SOUNDS_DATA.wolfGrowl3,
  SOUNDS_DATA.wolfGrowl4,
  SOUNDS_DATA.wolfGrowl5,
  SOUNDS_DATA.wolfGrowl6,
]);

// ...

// Will play a different sound in the bucket each time
<button
  onClick={() => {
    if (roundRobin.current)
      AudioManager.playRoundRobin(roundRobin.current.id);
  }}
/>

// Will loop through different sounds in the bucket at random intervals
// Can also be used to create and start a round robin in one call if a `dataArray` is provided as a second argument
<button
  onClick={() => {
    if (roundRobin.current)
      AudioManager.startRoundRobin(roundRobin.current.id);
  }}
/>
```

<br />

Spatialising a 3D character's sound effects when it moves
```ts
update() {
  AudioManager.getType(SoundType.Wolf).forEach(soundData => {
    if (AudioManager.getSoundState(soundData)?.isPlaying) {
      const {
        originalVector: { x, y, z },
      } = this.headBone.getScreenPosition();
      AudioManager.setPos(soundData, { x, y, z: 1.75 * z });
    }
  });
}
```

*Note: The `Wolf` sound type was created here so we can easily only target the character's sounds.*

*Note: The first version of the engine was originally built for this project. The logic is the same but the names are a bit outdated!*

<br />

Playing an introduction, then a looping section
*See [`/frontend/src/template/services/audioManager/audioManager.stories.tsx`](./../frontend/src/template/services/audioManager/audioManager.stories.tsx)*

<br />

---
## `AudioManager` {#audiomanager-api}
### Properties
##### globalVolume `number` `readonly` `1` {#globalVolume}
The global volume for all sounds.

<br />


##### currentBGM `Sound` `readonly` {#currentBGM}
The current background music.

<br />


##### eventManager `EventManager` `readonly` {#eventManager}
The associated `EventManager` instance. Check the [Events](#events) section to read about the available events.

<br />


##### loadProgress `number` `readonly` `0` {#globalVolume}
The global loading progress as a number between 0 and 100.

<br />


##### isReady `boolean` `readonly` `false` {#isReady}
Indicates whether the engine is done loading its files.

<br />


##### isUnlocked `boolean` `readonly` `false` {#isUnlocked}
Indicates whether the `AudioContext` has been unlocked.

<br />


##### isMuted `boolean` `readonly` `false` {#isMuted}
Indicates whether the engine is currently muted.

<br />


##### isUserMuted `boolean` `readonly` `false` {#isUserMuted}
Indicates whether the engine has been muted by the user manually (ie. not automatically when switching tabs, etc.)
Useful to know whether the current mute state should be stored as a user preference.

<br />


##### Howler `Howler` `readonly` {#Howler}
Returns the global `Howler` instance, if needed.

<br />


##### listenerPos `Vector3` `readonly` `{ x: 0, y: 0, z: 0 }` {#listenerPos}
*`SpatialAudio` module*

The position of the listener in 3D cartesian space. See [setListenerPos()](#setListenerPos).

<br />


##### listenerOrientation `ListenerOrientation` `readonly` `{x: 0, y: 0, z: -1, xUp: 0, yUp: 1, zUp: 0 }` {#listenerOrientation}
*`SpatialAudio` module*

The direction the listener is pointing in the 3D cartesian space. See [setListenerOrientation()](#setListenerOrientation).

<br />


### Methods
##### load() `(options?: object): void` {#load}
Loads all sounds provided in `data`. It will check whether the file has already been loaded with the `PreloaderService`, and reuse the data if so.
If not, the file will be loaded through `Howler.js`' loader.

- **options** `object` `optional` `{ data: SOUNDS_DATA }`
The loading options
  - **options.data** `SoundDataDictionary` `optional` `SOUNDS_DATA`
  An object with keys registered in the `SoundFile` enum, and `SoundData` objects as value.
  <br />

  - **options.onLoadProgress** `(progress: number) => void` `optional`
  Callback function called when a file has finished loading. Passes the global progress as a number between 0 and 100.
  <br />

  - **options.onLoadComplete** `() => void` `optional`
  Callback function called when all files have finished loading.

<br />


##### unload() `(): void` {#unload}
Stops all sounds, kills all value tweens, reinitialises all properties to their defaults.
Should be called when unmouting.

<br />


##### play() `(soundData: SoundData, config?: Partial<SoundConfig>): void` {#play}
Plays a sound.

- **soundData** `SoundData`
The sound
<br />

- **config** `Partial<SoundConfig>` `optional` `DEFAULT_SOUND_CONFIG`
The playback's configuration

<br />


##### pause() `(soundData: SoundData, fadeDuration?: number, callback?: () => void): void` {#pause}
Pauses a sound.

- **soundData** `SoundData`
The sound
<br />

- **fadeDuration** `number` `optional` `0`
The fade out's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### stop() `(soundData: SoundData, fadeDuration?: number, callback?: () => void): void` {#stop}
Stops a sound.

- **soundData** `SoundData`
The sound
<br />

- **fadeDuration** `number` `optional` `0`
The fade out's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### stopType() `(soundType: SoundType, fadeDuration?: number, callback?: () => void): void` {#stopType}
Stops all sounds of a given type.

- **soundType** `SoundType`
The type of sound
<br />

- **fadeDuration** `number` `optional` `0`
The fade out duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### stopAll() `(fadeDuration?: number, callback?: () => void): void` {#stopAll}
Stops all sounds.

- **fadeDuration** `number` `optional` `0`
The fade out duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### setVolume() `(soundData: SoundData, volume: number, transitionDuration?: number, callback?: () => void): void` {#setVolume}
Sets a sound's volume

- **soundData** `SoundData`
The sound
<br />

- **volume** `number`
The sound's volume
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### setGlobalVolume() `(volume: number, transitionDuration?: number, callback?: () => void): void` {#setGlobalVolume}
Sets the global volume for all sounds

- **volume** `number`
The global volume
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### mute() `(fadeDuration?: number, isFromUser?: boolean): void` {#mute}
Mute all sounds.

- **fadeDuration** `number` `optional` `DEFAULT_FADE_DURATION`
The fade out's duration, in seconds
<br />

- **isFromUser** `boolean` `optional` `false`
Indicates whether the change was initiated by the user

<br />


##### unmute() `(fadeDuration?: number, isFromUser?: boolean): void` {#unmute}
Unmutes all sounds.

- **fadeDuration** `number` `optional` `DEFAULT_FADE_DURATION`
The fade in's duration, in seconds
<br />

- **isFromUser** `boolean` `optional` `false`
Indicates whether the change was initiated by the user

<br />


##### toggleMute() `(fadeDuration?: number, isFromUser?: boolean): boolean` {#toggleMute}
Toggles the global volume's muted state.

- **fadeDuration** `number` `optional` `DEFAULT_FADE_DURATION`
The fade's duration, in seconds
<br />

- **isFromUser** `boolean` `optional` `true`
Indicates whether the change was initiated by the user
<br />

***`return` `boolean`***
The updated muted state

<br />


##### setRate() `(soundData: SoundData, rate: number, transitionDuration?: number, callback?: () => void): void` {#setRate}
Changes a sound's playrate, altering the its pitch.

- **soundData** `SoundData`
The sound
<br />

- **rate** `number`
The playback's speed, `0.5` to `4`, with `1` being normal speed.
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds

- **callback** `() => void` `optional`
The callback function to call once done
<br />


##### getHowl() `(soundData: SoundData): Howl` {#getHowl}
Returns a sound's underlying `Howl` instance, if needed.

- **soundData** `SoundData`
The sound
<br />

***`return` `Howl`***
The sound's `Howl` instance

<br />


##### getSoundState() `(soundData: SoundData): object` {#getSoundState}
Returns a sound's current state.

- **soundData** `soundData`
The sound
<br />

***`return` `object`***
The sound's current state
  - ***`object.isLoaded` `boolean`***
    Indicates whether the sound has been loaded
  - ***`object.isPlaying` `boolean`***
    Indicates whether the sound is current playing
  - ***`object.isPaused` `boolean`***
    Indicates whether the sound is currently paused (but not stopped)

<br />


##### getType() `(soundType: SoundType): SoundData[]` {#getType}
Returns all registered sounds of the given type.

***`return` `SoundData[]`***
The list of all matching sounds

<br />


##### getTypes() `(soundTypes: SoundType[]): SoundData[]` {#getTypes}
Returns all registered sounds of the given types.

***`return` `SoundData[]`***
The list of all matching sounds

<br />


##### setPan() `(soundData: SoundData, pan: number, transitionDuration?: number, callback?: () => void): void` {#setPan}
*`SpatialAudio` module*

Sets a sound's stereo panning position.

- **soundData** `SoundData`
The sound
<br />

- **pan** `number`
The stereo panning position as a number between `-1` and `1`, with `0` being center.
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### setPos() `(soundData: SoundData, pos: Vector3, transitionDuration?: number, callback?: () => void): void` {#setPos}
*`SpatialAudio` module*

Set a sound's 3D spatial position.

- **soundData** `SoundData`
The sound
<br />

- **pos** `Vector3`
The sound's spatial position
  - **pos.x** `number`
  The x-position of the sound
  - **pos.y** `number`
  The y-position of the sound
  - **pos.z** `number`
  The z-position of the sound
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### setOrientation() `(soundData: SoundData, orientation: Vector3, transitionDuration?: number, callback?: () => void): void` {#setOrientation}
*`SpatialAudio` module*

Sets the direction the sound source is pointing in the 3D cartesian coordinate space. Depending on how directional the sound is, based on the `PannerAttributes`, a sound pointing away from the listener can be quiet or silent.

- **soundData** `SoundData`
The sound
<br />

- **orientation** `Vector3`
The sound's spatial orientation
  - **orientation.x** `number`
  The sound's x-orientation
  - **orientation.y** `number`
  The sound's y-orientation
  - **orientation.z** `number`
  The sound's z-orientation
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### setPannerAttr() `(soundData: SoundData, pannerAttr: Partial<PannerAttributes>, transitionDuration?: number, callback?: () => void, shouldSetNTPAtEnd?: boolean): void` {#setPannerAttr}
*`SpatialAudio` module*

Sets the sound's panner node's attributes.

- **soundData** `SoundData`
The sound
<br />

- **pannerAttr** `Partial<PannerAttributes>`
The panner node's attributes. See [Howler's documentation](https://github.com/goldfire/howler.js/blob/master/README.md#pannerattro-id) for more information.
  - **pannerAttr.coneInnerAngle** `number` `optional` `360`
  - **pannerAttr.coneOuterAngle** `number` `optional` `360`
  - **pannerAttr.coneOuterGain** `number` `optional` `0`
  - **pannerAttr.distanceModel** `inverse | linear` `optional` `inverse`
  - **pannerAttr.maxDistance** `number` `optional` `10000`
  - **pannerAttr.refDistance** `number` `optional` `10000`
  - **pannerAttr.rolloffFactor** `number` `optional` `1`
  - **pannerAttr.panningModel** `number` `HRTF | equalpower` `HRTF`
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done
<br />

- **shouldSetNTPAtEnd** `boolean` `optional` `false`
Indicates whether the non-tweenable properties of `pannerAttr`, if present, should be set at the beginning or the end of the tween.

<br />


##### setListenerPos() `(pos: Vector3, transitionDuration?: number, callback?: () => void): void` {#setListenerPos}
*`SpatialAudio` module*

Sets the position of the listener in 3D cartesian space. Sounds using 3D position will be relative to the listener's position.

- **pos** `Vector3`
The listener's spatial position
  - **pos.x** `number`
  The x-position of the listener
  - **pos.y** `number`
  The y-position of the listener
  - **pos.z** `number`
  The z-position of the listener
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### setListenerOrientation()  `(orientation: ListenerOrientation, transitionDuration?: number, callback?: () => void): void` {#setListenerOrientation}
*`SpatialAudio` module*

Sets the direction the listener is pointing in the 3D cartesian space. A front and up vector must be provided. The front is the direction the face of the listener is pointing, and up is the direction the top of the listener is pointing. Thus, these values are expected to be at right angles from each other.

- **orientation** `ListenerOrientation`
The listener's spatial orientation
  - **orientation.x** `number`
  The x-orientation of the listener
  - **orientation.y** `number`
  The y-orientation of the listener
  - **orientation.z** `number`
  The z-orientation of the listener
  - **orientation.xUp** `number`
  The x-orientation of the top of the listener
  - **orientation.yUp** `number`
  The y-orientation of the top of the listener
  - **orientation.zUp** `number`
  The z-orientation of the top of the listener
<br />

- **transitionDuration** `number` `optional` `0`
The transition's duration, in seconds
<br />

- **callback** `() => void` `optional`
The callback function to call once done

<br />


##### createRoundRobin() `(id: string, dataArray: SoundData[], config?: Partial<RoundRobinConfig>): RoundRobin` {#createRoundRobin}
*`RoundRobinGenerator` module*

Creates a new round robin.

- **id** `string`
The round robin's id
<br />

- **dataArray** `SoundData[]`
The round robin's sound bucket
<br />

- **config** `Partial<RoundRobinConfig>` `optional` `DEFAULT_ROUND_ROBIN_CONFIG`
The round robin's configuration
<br />

***`return` `RoundRobin` `readonly`***
The created round robin

<br />


##### playRoundRobin() `(id: RoundRobin['id'], shouldResumeLooping?: boolean, configUpdate?: Partial<RoundRobinConfig>): void` {#playRoundRobin}
*`RoundRobinGenerator` module*

Plays a random sound effect within a given bucket.

- **id** `string`
The round robin's id
<br />

- **shouldResumePlaying** `boolean` `optional` `true`
Indicates whether the looping, if there was one, should resume after the sound has finished playing.

- **config** `Partial<RoundRobinConfig>` `optional` `{}`
Any updates to make to the round robin's configuration

<br />


##### startRoundRobin() `(id: string, dataArray?: SoundData[], config?: Partial<RoundRobinConfig>): void` {#startRoundRobin}
*`RoundRobinGenerator` module*

Loops random sound effects from a bucket playing at random intervals. If the round robin doesn't exist, it will be created first.

- **id** `string`
The round robin's id
<br />

- **dataArray** `SoundData[]` `optional`
The round robin's sound bucket
<br />

- **config** `Partial<RoundRobinConfig>` `optional` `DEFAULT_ROUND_ROBIN_CONFIG`
The round robin's configuration

***`return` `RoundRobin` `readonly`***
The round robin

<br />


##### stopRoundRobin() `(id: string, shouldCutTrail?: boolean): void` {#stopRoundRobin}
*`RoundRobinGenerator` module*

Stops a round robin.

- **id** `string`
The round robin's id
<br />

- **shouldCutTrail** `boolean` `optional` `false`
Indicates whether the sound should be cut immediately, or allowed to finish

<br />


##### getRoundRobin() `(id: string): RoundRobin` {#getRoundRobin}
*`RoundRobinGenerator` module*

Returns the matching round robin.

- **id** `string`
The round robin's id.
<br />

***`return` `RoundRobin`***
The round robin

<br />


##### getAllRoundRobins() `(): RoundRobin[]` {#getAllRoundRobins}
*`RoundRobinGenerator` module*

Returns all round robins.

***`return` `RoundRobin[]`***
The list of all round robins

<br />


### Events
##### loadProgress
Triggered when a sound finishes loading.
Passes the global loading progress as a number between 0 and 100 in its `data`.
<br />


##### loadComplete
Triggered when all sounds have finished loading.
<br />


##### unlock
Triggered when the `AudioContext` is unlocked.

<br />


### Interfaces and configuration
These can be changed in `/frontend/src/template/services/audioManager/audioManager.data.ts`.

```ts
interface RoundRobin {
  // The round robin's unique id
  id: string;
  // The sound bucket the round robin can choose from
  dataArray: SoundData[];
  // The round robin's current position in the `dataArray`
  iterator: number;
  // A number set automatically when the round robin is waiting to play its next sound
  timeout: number;
  // Indicates whether the round robin is playing a sound
  isPlaying: boolean;
  // Indicates whether the round robin is looping through its sounds
  isLooping: boolean;
  // The round robin's configuration
  config: RoundRobinConfig;
}

// The default duration for BGM and global volume fades, in seconds
const DEFAULT_FADE_DURATION = 0.4;

// Default `SoundData`
const DEFAULT_SOUND_DATA = {
  // The sound's id, as defined in the initial data
  id: '',
  // The sound's type
  type: SoundType.SFX,
  // The file, or files if an array if provided.
  file: '',
  // Optional, the audio format.
  // Can be an array of values for each of the `file` array items.
  format: 'mp3',
  // The sprite data object
  sprite: null,
  // The loop flag
  loop: false,
  // The volume
  volume: 1,
  // The stereo panning position
  pan: 0,
  // The 3D spatial position
  pos: null,
  // The orientation in a 3D space
  orientation: null,
  // The panner node attributes
  pannerAttr: null,
};

// Default `SoundConfig`
const DEFAULT_SOUND_CONFIG = {
  // The sprite to play, if sprites are used
  spriteName: '',
  // The fade in's duration, in seconds
  fadeDuration: null,
  // If set, will set the starting point, in seconds
  // Will simply resume from the current position
  from: null,
  // The delay before the sound starts playing, in seconds
  delay: 0,
  // Callback function called when the sound starts playing (delay included)
  onStart: null,
  // Callback function called when the sound has finished playing
  onEnd: null,
  // Callback function called when the sound's current position updates.
  // Passes the current position, in seconds
  onProgress: null,
  // Callback function called when the sound is stopped
  onStop: null,
  // For a BGM (if a BGM is already playing), or a BGS (if that BGS is already playing),
  // indicates whether the the fade out before restarting (or switching BGMs) should be skipped
  shouldSkipFade: false,
};

// Default `RoundRobinConfig`
const DEFAULT_ROUND_ROBIN_CONFIG = {
  // If set, the `dataArray` index of the sound the round robin should start with
  startWith: null,
  // The delay before the sound starts playing, in seconds
  delay: 0,
  // The minimum wait time between two sounds, in seconds
  minWait: 3,
  // The maximum wait time between two sounds, in seconds
  maxWait: 6,
  // Expects [number, number][], an array of min and max pan values for each sound in the round robin
  // eg. [[-1, 0.5], [0.2, 1]]
  // Or [number], a fixed pan value for all sounds.
  // eg. [0.75]
  // A missing value in the array will have its sound's `pan` value default to 0.
  // Not setting a value to this parameter disables panning randomisation.
  pan: null,
  // Callback function called when a sound starts playing. Passes the randomly chosen sound.
  onStart: null,
  // Callback function called when a sound has finished playing
  onEnd: null,
};
```

<br />

---
## What's next?
The audio engine currently has many features that should cover most of the use cases we have for web audio.
However if you encounter any issue, bug, or need any new feature (effects like delay or chorus, playable instruments using MIDI, or [Tone.js](https://tonejs.github.io/docs/14.7.77/index.html) integration for advanced audio processing or sound generation), please feel free to reach out on Slack.

<br />
