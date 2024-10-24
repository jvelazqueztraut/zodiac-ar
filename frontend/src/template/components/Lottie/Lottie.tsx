import { Player, PlayerEvent } from '@lottiefiles/react-lottie-player';
import React, { MutableRefObject, useEffect } from 'react';

import * as Styled from './Lottie.styles';

export interface LottieProps {
  animation: Record<string, any>;
  autoPlay?: boolean;
  loop?: boolean;
  useCanvas?: boolean;
  pauseAtFrame?: number;
  forceContinue?: boolean;
  keepLastFrame?: boolean;
  onLoad?: () => void;
  onReady?: () => void;
  onComplete?: () => void;
  onLoadError?: () => void;
  onFrame?: () => void;
}

const defaultProps: Partial<LottieProps> = {
  autoPlay: true,
  loop: false,
  useCanvas: false,
  pauseAtFrame: null,
  forceContinue: false,
  keepLastFrame: true,
  onLoad: () => null,
  onReady: () => null,
  onComplete: () => null,
  onLoadError: () => null,
  onFrame: () => null,
};

const Lottie = React.forwardRef<Player, LottieProps>(
  (
    {
      animation,
      autoPlay,
      loop,
      keepLastFrame,
      useCanvas,
      pauseAtFrame,
      forceContinue,
      onLoad,
      onReady,
      onComplete,
      onLoadError,
      onFrame,
    },
    lottiePlayer?: MutableRefObject<Player>
  ) => {
    const handleOnFrame = () => {
      if (pauseAtFrame && lottiePlayer.current.state.instance) {
        if (
          lottiePlayer.current.state.instance['currentFrame'] >= pauseAtFrame &&
          !forceContinue
        ) {
          lottiePlayer.current.pause();
        }
      }
      onFrame();
    };

    useEffect(() => {
      if (forceContinue) {
        lottiePlayer.current.play();
      }
    }, [forceContinue, lottiePlayer]);

    const handleEvent = (event: PlayerEvent) => {
      if (lottiePlayer) {
        switch (event) {
          case 'load':
            onLoad();
            break;
          case 'error':
            onLoadError();
            break;
          case 'ready':
            onReady();
            break;
          case 'frame':
            handleOnFrame();
            break;
          case 'complete':
            onComplete();
            break;
          default:
            break;
        }
      }
    };

    return (
      <Styled.Wrapper>
        <Player
          ref={lottiePlayer}
          src={animation}
          autoplay={autoPlay}
          loop={loop}
          keepLastFrame={keepLastFrame}
          onEvent={handleEvent}
          renderer={useCanvas ? 'canvas' : 'svg'}
        />
      </Styled.Wrapper>
    );
  }
);

Lottie.displayName = 'Lottie';
Lottie.defaultProps = defaultProps;

export default Lottie;
