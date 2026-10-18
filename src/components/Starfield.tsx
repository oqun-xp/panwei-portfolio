import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
  depth: number;
  color: string;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let animationFrame = 0;
    let running = true;
    const pointer = { x: 0, y: 0 };

    const createStars = () => {
      const count = width < 640 ? 70 : width < 1024 ? 110 : 160;
      stars = Array.from({ length: count }, () => {
        const tint = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.35,
          alpha: Math.random() * 0.55 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.55 + 0.25,
          depth: Math.random() * 0.9 + 0.1,
          color: tint > 0.78 ? '167, 139, 250' : tint > 0.5 ? '125, 211, 252' : '226, 232, 240'
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      createStars();
      if (reduceMotion) draw(0);
    };

    const draw = (time: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        const twinkle = reduceMotion ? 1 : 0.55 + 0.45 * Math.sin(time * 0.001 * star.speed + star.phase);
        const x = star.x + pointer.x * star.depth * 14;
        const y = star.y + pointer.y * star.depth * 14;
        context.beginPath();
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${star.color}, ${star.alpha * twinkle})`;
        context.fill();
      });

      if (!reduceMotion && running) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointer = (event: MouseEvent) => {
      pointer.x = event.clientX / width - 0.5;
      pointer.y = event.clientY / height - 0.5;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(animationFrame);
      } else if (!reduceMotion) {
        running = true;
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    resize();

    if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(draw);
      window.addEventListener('mousemove', handlePointer, { passive: true });
      document.addEventListener('visibilitychange', handleVisibility);
    }
    window.addEventListener('resize', resize);

    return () => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas id="starfield" ref={canvasRef} aria-hidden="true" />;
}
