import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { SPRITES } from 'utils/config.assets';

import SliderAnchor from './SliderAnchor/SliderAnchor';

import * as Styled from './DraggableSlider.styles';

interface DraggableSliderProps {
  onAnchorSelect: (anchorIndex: number) => void;
}

const DraggableSlider: React.FC<DraggableSliderProps> = ({
  onAnchorSelect,
}) => {
  const [sliderPosition, setSliderPosition] = useState({ x: 50, y: 50 });
  const [selectedAnchor, setSelectedAnchor] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const anchors = [
    { x: 50, y: 10, icon: SPRITES.SunIcon, text: 'Sun' }, // Top-center - Anchor 0
    { x: 90, y: 90, icon: SPRITES.MoonIcon, text: 'Moon' }, // Bottom-right corner - Anchor 1
    { x: 10, y: 90, icon: SPRITES.RisingIcon, text: 'Rising' }, // Bottom-left corner  - Anchor 2
  ];

  const handleDrag = (clientX: number, clientY: number) => {
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
    setSelectedAnchor(closestAnchorIndex);
    onAnchorSelect(closestAnchorIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderPosition]);

  return (
    <AnimatePresence>
      <Styled.Wrapper>
        {anchors.map((anchor, index) => (
          <SliderAnchor
            key={index}
            left={anchor.x}
            top={anchor.y}
            selected={index === selectedAnchor}
            icon={anchor.icon}
            text={anchor.text}
          />
        ))}
        <Styled.Slider
          ref={sliderRef}
          left={sliderPosition.x}
          top={sliderPosition.y}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      </Styled.Wrapper>
    </AnimatePresence>
  );
};

export default DraggableSlider;
