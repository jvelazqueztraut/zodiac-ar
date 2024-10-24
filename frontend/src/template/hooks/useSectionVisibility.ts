import { chain } from 'lodash';
import { useEffect, useState } from 'react';

import { useScroll } from 'template/hooks';

const useSectionVisibility = (sectionCount: number, initialSection = 0) => {
  const [currentSection, setCurrentSection] = useState<number>(initialSection);
  const [visibilityChecks, setVisibilityChecks] = useState<boolean[]>([]);
  const { scrollDirection } = useScroll();

  const checkSlidesVisibility = () => {
    if (visibilityChecks.length !== sectionCount) return;
    let newSlide = currentSection || 0;

    const visibleSection = chain(visibilityChecks)
      .map((isSectionInViewport, index) => ({ isSectionInViewport, index }))
      [scrollDirection === 'up' ? 'findLast' : 'find']('isSectionInViewport')
      .value() || { index: newSlide, isSectionInViewport: true };

    newSlide = visibleSection.index;
    setCurrentSection(newSlide);
  };

  const updateSectionVisbility = (isInViewport: boolean, index: number) => {
    const visibilityArray = [...visibilityChecks];
    visibilityArray[index] = isInViewport;

    if (
      visibilityArray.some((value, index) => value !== visibilityChecks[index])
    ) {
      setVisibilityChecks([...visibilityArray]);
    }
  };

  useEffect(() => {
    checkSlidesVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollDirection, visibilityChecks, sectionCount]);

  return {
    currentSection,
    updateSectionVisbility,
  };
};

export default useSectionVisibility;
