import { useState, useEffect, useRef } from 'react';

// Animated number counter hook
export function useAnimatedCounter(target, duration = 1200, decimals = 0) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = null;
    const start = 0;
    const end = target;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(parseFloat((start + (end - start) * eased).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);

  return current;
}

// Spotlight / glow effect hook for cards
export function useSpotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
    };

    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return ref;
}

// Magnetic button hook (subtle pull toward cursor)
export function useMagnetic(strength = 0.3) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleLeave = () => {
      el.style.transform = 'translate(0px, 0px)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    };

    const handleEnter = () => {
      el.style.transition = 'transform 0.1s linear';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('mouseenter', handleEnter);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('mouseenter', handleEnter);
    };
  }, [strength]);

  return ref;
}

// Tilt card hook
export function useTilt(maxTilt = 8) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(600px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`;
    };

    const handleLeave = () => {
      el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    };

    const handleEnter = () => {
      el.style.transition = 'none';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('mouseenter', handleEnter);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('mouseenter', handleEnter);
    };
  }, [maxTilt]);

  return ref;
}

// Staggered mount animation hook
export function useStaggerMount(count, delayMs = 80) {
  const [visible, setVisible] = useState(new Array(count).fill(false));

  useEffect(() => {
    const timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * delayMs));
    }
    return () => timers.forEach(clearTimeout);
  }, [count, delayMs]);

  return visible;
}
