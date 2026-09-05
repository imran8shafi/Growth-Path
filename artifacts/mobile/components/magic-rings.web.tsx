import React, { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useReducedMotionPreference } from './motion-bits';
import { createRingRenderer } from '@/lib/magic-rings-renderer';

export function MagicRings() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const focused = useIsFocused(); const reduced = useReducedMotionPreference();
  useEffect(() => {
    const node = canvas.current; if (!node) return;
    const gl = node.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;
    let renderer: ReturnType<typeof createRingRenderer>;
    try { renderer = createRingRenderer(gl); } catch { return; }
    let interval: ReturnType<typeof setInterval> | undefined;
    let time = 2;
    const resize = () => { node.width = Math.max(1, Math.round(node.clientWidth)); node.height = Math.max(1, Math.round(node.clientHeight)); renderer.draw(time); };
    const run = () => {
      if (interval) clearInterval(interval);
      interval = undefined;
      if (focused && !reduced && !document.hidden) interval = setInterval(() => { time += 1 / 24; renderer.draw(time); }, 1000 / 24);
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(node);
    const contextLost = (event: Event) => { event.preventDefault(); if (interval) clearInterval(interval); };
    node.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', run); resize(); run();
    return () => { if (interval) clearInterval(interval); resizeObserver.disconnect(); document.removeEventListener('visibilitychange', run); node.removeEventListener('webglcontextlost', contextLost); renderer.dispose(); };
  }, [focused, reduced]);
  return <div aria-hidden="true" style={{ position: 'absolute', top: -70, left: 0, right: 0, height: 600, pointerEvents: 'none', opacity: .45 }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 26%, #55d6ff0d 27%, transparent 28%, transparent 38%, #8d7cff0d 39%, transparent 40%)' }} />
    <canvas ref={canvas} style={{ width: '100%', height: '100%', display: 'block' }} />
  </div>;
}
