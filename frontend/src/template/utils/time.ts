const toFixedNoRounding = (number: number, digits = 0) => {
  const fixed =
    Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits);
  const [integer, float] = fixed.toLocaleString('en').split('.');
  const floatValue = float || '0';

  return floatValue.length < digits
    ? `${integer}.${floatValue.padEnd(digits, '0')}`
    : `${fixed}`;
};

// Uses m:s by default
// Uses m:s.ms with `shouldUseMs`
// Uses m:s:f with `shouldUseFrames`
// Uses h:m:s with `shouldUseHours`
// Uses h:m:s.ms with `shouldUseHours` and `shouldUseMs`
// Uses h:m:s:f with `shouldUseHours` and `shouldUseFrames`
export const secondsToTimestring = (
  seconds: number,
  shouldUseHours = false,
  shouldUseMs = false,
  shouldUseFrames = false,
  fps = 30
) => {
  let hours: number, minutes: number, secs: number, frames: number;

  minutes = Math.floor(seconds / 60);
  secs = shouldUseMs ? seconds % 60 : Math.floor(seconds % 60);

  if (shouldUseHours) {
    hours = Math.floor(seconds / 60 ** 2);
    minutes = Math.floor(seconds / 60) % 60;
  }

  if (shouldUseFrames) {
    const secsWithFloat = seconds % 60;
    secs = Math.floor(secsWithFloat);
    frames = (secsWithFloat - secs) * fps;
  }

  return [
    shouldUseHours ? `${hours}`.padStart(2, '0') : hours,
    `${minutes}`.padStart(2, '0'),
    shouldUseMs && !shouldUseFrames
      ? toFixedNoRounding(secs, 3).padStart(6, '0')
      : `${secs}`.padStart(2, '0'),
    shouldUseFrames ? toFixedNoRounding(frames, 2).padStart(5, '0') : frames,
  ]
    .filter(Boolean)
    .join(':');
};

// Uses h:m:s.ms format by default
// Uses h:m:s:f with `shouldUseFrames`
export const timecodeToSeconds = (
  timecode: string,
  shouldUseFrames = false,
  fps = 30
) => {
  const valuesArray = timecode
    .split(':')
    .map(number => parseFloat(number.replace(',', '.')));
  const hours = valuesArray[0] * 60 ** 2;
  const minutes = valuesArray[1] * 60;
  const secs = valuesArray[2];
  const images = ((valuesArray[3] || 0) % fps) / fps;

  return hours + minutes + secs + (shouldUseFrames ? images : 0);
};

export const timecodeToMilliseconds = (
  timecode: string,
  shouldUseFrames?: boolean,
  fps?: number
) => timecodeToSeconds(timecode, shouldUseFrames, fps) * 1000;
