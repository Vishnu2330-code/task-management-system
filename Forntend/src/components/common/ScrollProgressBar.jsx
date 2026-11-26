import React, { useEffect, useRef } from 'react';

/**
 * High-performance top-fixed gradient glow scroll progress bar.
 * Uses direct GPU-composited transform: scaleX() and zero React re-renders during scroll.
 */
export const ScrollProgressBar = ({
  colorClass = '',
  height = 3,
  showHeadGlow = true,
}) => {
  const trackRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const doc = document.documentElement;
          const currentY = window.pageYOffset || doc.scrollTop;
          const totalHeight = doc.scrollHeight - doc.clientHeight;
          const progress = totalHeight > 0 ? Math.min(1, Math.max(0, currentY / totalHeight)) : 0;

          if (fillRef.current) {
            fillRef.current.style.transform = `scaleX(${progress})`;
          }

          if (trackRef.current) {
            if (currentY > 8) {
              trackRef.current.classList.add('is-active');
            } else {
              trackRef.current.classList.remove('is-active');
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={trackRef}
      className={`scroll-progress-track ${colorClass}`}
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-label="Page scroll progress"
    >
      <div
        ref={fillRef}
        className="scroll-progress-fill"
      >
        {showHeadGlow && (
          <div className="scroll-progress-glow-head" />
        )}
      </div>
    </div>
  );
};

export default ScrollProgressBar;
