import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * High-performance horizontal scroll container with dynamic left/right gradient shadows.
 * Throttled with requestAnimationFrame to prevent layout thrashing and scroll jank.
 */
export const ScrollHorizontalShadow = ({
  children,
  className = '',
  showButtons = false,
  scrollAmount = 300,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stateRef = useRef({ left: false, right: false });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    window.requestAnimationFrame(() => {
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const nextLeft = scrollLeft > 2;
      const nextRight = scrollLeft < scrollWidth - clientWidth - 2;

      if (nextLeft !== stateRef.current.left) {
        stateRef.current.left = nextLeft;
        setCanScrollLeft(nextLeft);
      }

      if (nextRight !== stateRef.current.right) {
        stateRef.current.right = nextRight;
        setCanScrollRight(nextRight);
      }
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const handleScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;

    const target = direction === 'left' ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <div className={`scroll-h-wrapper ${className}`}>
      {/* Left shadow mask */}
      <div
        className={`scroll-h-shadow shadow-left ${canScrollLeft ? 'is-active' : ''}`}
        aria-hidden="true"
      />

      {/* Optional Left Scroll Button */}
      {showButtons && canScrollLeft && (
        <button
          type="button"
          className="scroll-h-arrow arrow-left"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Main scrollable container */}
      <div className="scroll-h-content" ref={scrollRef}>
        {children}
      </div>

      {/* Optional Right Scroll Button */}
      {showButtons && canScrollRight && (
        <button
          type="button"
          className="scroll-h-arrow arrow-right"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Right shadow mask */}
      <div
        className={`scroll-h-shadow shadow-right ${canScrollRight ? 'is-active' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default ScrollHorizontalShadow;
