import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { SPRITES } from 'utils/config.assets';

import SliderAnchor from './SliderAnchor/SliderAnchor';

import * as Styled from './DraggableSlider.styles';

import {
  FilterTypeIcons,
  FilterTypeNames,
  FilterTypes,
} from 'constants/ar-constants';

interface DraggableSliderProps {
  hint: string;
  onAnchorSelect: (anchorIndex: number) => void;
  motion?: any;
}

const HINT_TIMEOUT = 5000;

const DraggableSlider: React.FC<DraggableSliderProps> = ({
  hint,
  onAnchorSelect,
  motion,
}) => {
  const [userDrag, setUserDrag] = useState(false);
  const [sliderPosition, setSliderPosition] = useState({ x: 50, y: 50 });
  const [selectedAnchor, setSelectedAnchor] = useState<FilterTypes | null>(
    null
  );
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderHint, setSliderHint] = useState(true);
  const sliderHintTimeout = useRef(null);

  const anchors = [
    {
      x: 50,
      y: 10,
      icon: FilterTypeIcons[FilterTypes.Sun],
      text: FilterTypeNames[FilterTypes.Sun],
    }, // Top-center - Anchor 0
    {
      x: 90,
      y: 90,
      icon: FilterTypeIcons[FilterTypes.Moon],
      text: FilterTypeNames[FilterTypes.Moon],
    }, // Bottom-right corner - Anchor 1
    {
      x: 10,
      y: 90,
      icon: FilterTypeIcons[FilterTypes.Rising],
      text: FilterTypeNames[FilterTypes.Rising],
    }, // Bottom-left corner  - Anchor 2
  ];
  const [anchorHint, setAnchorHint] = useState([true, true, true]);

  const handleDrag = (clientX: number, clientY: number) => {
    setUserDrag(true);
    const rect = sliderRef.current?.parentElement?.getBoundingClientRect();
    if (rect) {
      const newLeft = ((clientX - rect.left) / rect.width) * 100;
      const newTop = ((clientY - rect.top) / rect.height) * 100;
      setSliderPosition({
        x: Math.max(0, Math.min(100, newLeft)),
        y: Math.max(0, Math.min(100, newTop)),
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDrag(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseDown = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
  };

  const handleTouchStart = () => {
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd, { once: true });
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
  };

  useEffect(() => {
    if (!userDrag) return; // Skip if the user has not dragged the slider
    const closestAnchorIndex = anchors.reduce(
      (prevIndex, currAnchor, currIndex) => {
        const prevAnchor = anchors[prevIndex];
        const prevDistance = Math.hypot(
          prevAnchor.x - sliderPosition.x,
          prevAnchor.y - sliderPosition.y
        );
        const currDistance = Math.hypot(
          currAnchor.x - sliderPosition.x,
          currAnchor.y - sliderPosition.y
        );
        return currDistance < prevDistance ? currIndex : prevIndex;
      },
      0
    );
    setSelectedAnchor(closestAnchorIndex as FilterTypes);
    onAnchorSelect(closestAnchorIndex);
    // Start the slider hint timeout
    setSliderHint(false);
    clearTimeout(sliderHintTimeout.current);
    sliderHintTimeout.current = setTimeout(() => {
      setSliderHint(true);
    }, HINT_TIMEOUT);
    // Clear anchor hints
    setAnchorHint(anchorHint =>
      anchorHint.map((hint, index) =>
        index === closestAnchorIndex ? false : hint
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderPosition]);

  return (
    <AnimatePresence>
      <Styled.Wrapper {...motion}>
        {anchors.map((anchor, index) => (
          <SliderAnchor
            key={index}
            left={anchor.x}
            top={anchor.y}
            selected={index === selectedAnchor}
            icon={anchor.icon}
            hint={anchor.text}
            isHintVisible={anchorHint[index]}
          />
        ))}
        <Styled.Slider
          ref={sliderRef}
          left={sliderPosition.x}
          top={sliderPosition.y}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <Styled.Icon src={SPRITES.ZodiacIcon} alt="Slider Icon" />
          <Styled.Text visible={sliderHint}>{hint}</Styled.Text>
        </Styled.Slider>
      </Styled.Wrapper>
    </AnimatePresence>
  );
};

export default DraggableSlider;
