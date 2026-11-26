import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Floating Scroll-To-Top button with radial SVG progress ring.
 * Optimized for zero continuous React re-renders while scrolling.
 */
export const ScrollToTopButton = ({ threshold = 280, label = 'Back to top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const circleRef = useRef(null);

  // SVG Circular progress math
  const size = 46;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const doc = document.documentElement;
          const currentY = window.pageYOffset || doc.scrollTop;
          const totalHeight = doc.scrollHeight - doc.clientHeight;
          const progress = totalHeight > 0 ? Math.min(1, Math.max(0, currentY / totalHeight)) : 0;

          // Update SVG stroke-dashoffset directly on DOM without re-rendering
          if (circleRef.current) {
            const offset = circumference - progress * circumference;
            circleRef.current.style.strokeDashoffset = `${offset}`;
          }

          // Only update React state when crossing threshold
          const shouldBeVisible = currentY > threshold;
          if (shouldBeVisible !== isVisibleRef.current) {
            isVisibleRef.current = shouldBeVisible;
            setIsVisible(shouldBeVisible);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, circumference]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label={label}
      title={label}
    >
      <svg
        className="scroll-progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="scroll-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          className="scroll-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: circumference }}
        />
      </svg>
      <div className="scroll-arrow-icon">
        <ArrowUp size={18} />
      </div>
    </button>
  );
};

export default ScrollToTopButton;
