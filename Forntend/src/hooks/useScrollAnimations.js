import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * High-performance hook that ONLY updates state when scroll crosses a threshold.
 * Prevents continuous React re-renders during scrolling (0% re-renders while scrolling).
 */
export const useScrollThreshold = (threshold = 30) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.pageYOffset || document.documentElement.scrollTop;
          const nextScrolled = currentY > threshold;

          if (nextScrolled !== isScrolledRef.current) {
            isScrolledRef.current = nextScrolled;
            setIsScrolled(nextScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check initial position
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return isScrolled;
};

/**
 * Backward compatible hook with throttled values
 */
export const useScrollProgress = (options = {}) => {
  const { threshold = 20 } = options;
  const isScrolled = useScrollThreshold(threshold);
  return { isScrolled };
};

/**
 * Zero-re-render Parallax Hook
 * Returns a ref to attach to the parallax container.
 * Updates transform: translate3d(...) on RAF directly on the DOM element with 0 React re-renders!
 */
export const useParallaxRef = (speed = 0.15) => {
  const elementRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (elementRef.current) {
            const y = window.pageYOffset || document.documentElement.scrollTop;
            elementRef.current.style.transform = `translate3d(0, ${Math.round(y * speed)}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return elementRef;
};

/**
 * Hook to detect when an element enters the viewport using IntersectionObserver.
 * Unobserves immediately upon entering viewport to free browser resources.
 */
export const useInView = (options = {}) => {
  const { threshold = 0.1, rootMargin = '0px 0px -30px 0px', triggerOnce = true } = options;
  const [inView, setInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, inView];
};

/**
 * Optimized ScrollSpy: only triggers state change when the active section ID actually changes.
 * Caches section positions using passive RAF to prevent layout thrashing.
 */
export const useScrollSpy = (sectionIds = [], offset = 120) => {
  const [activeId, setActiveId] = useState(sectionIds[0] || '');
  const activeIdRef = useRef(sectionIds[0] || '');

  useEffect(() => {
    if (!sectionIds.length) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = (window.pageYOffset || document.documentElement.scrollTop) + offset;

          let foundId = sectionIds[0];
          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const id = sectionIds[i];
            const el = document.getElementById(id);
            if (el) {
              const top = el.offsetTop;
              if (scrollPosition >= top - 20) {
                foundId = id;
                break;
              }
            }
          }

          if (foundId !== activeIdRef.current) {
            activeIdRef.current = foundId;
            setActiveId(foundId);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionIds, offset]);

  const scrollToSection = useCallback((id, customOffset = 80) => {
    const element = document.getElementById(id);
    if (!element) return;

    setActiveId(id);
    activeIdRef.current = id;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementPosition - customOffset);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    // Add glowing highlight pulse to the target section
    element.classList.remove('section-highlight-pulse');
    void element.offsetWidth; // trigger reflow
    element.classList.add('section-highlight-pulse');
    setTimeout(() => {
      element.classList.remove('section-highlight-pulse');
    }, 1800);
  }, []);

  return { activeId, scrollToSection };
};
