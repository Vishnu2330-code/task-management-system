import React, { useState, useEffect } from 'react';
import { useInView } from '../../hooks/useScrollAnimations';

/**
 * Reusable wrapper that triggers animated reveal when scrolled into the viewport.
 * Automatically cleans up will-change after transition completes to conserve GPU memory.
 */
export const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 480,
  threshold = 0.08,
  triggerOnce = true,
  className = '',
  style = {},
  as: Component = 'div',
  ...rest
}) => {
  const [ref, inView] = useInView({ threshold, triggerOnce });
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
    if (inView && !transitionDone) {
      const timer = setTimeout(() => {
        setTransitionDone(true);
      }, duration + delay + 50);
      return () => clearTimeout(timer);
    }
  }, [inView, transitionDone, duration, delay]);

  const customStyle = {
    ...style,
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    ...(transitionDone && { willChange: 'auto', transform: 'none' }),
  };

  return (
    <Component
      ref={ref}
      className={`scroll-reveal-item reveal-${variant} ${inView ? 'is-in-view' : ''} ${transitionDone ? 'is-revealed' : ''} ${className}`}
      style={customStyle}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
