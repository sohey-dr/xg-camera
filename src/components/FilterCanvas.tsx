'use client';

import { useEffect, useRef } from 'react';

interface FilterCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  filter: string;
  brightness: number;
  contrast: number;
}

export function FilterCanvas({ videoRef, filter, brightness, contrast }: FilterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !(video instanceof HTMLVideoElement)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const drawFrame = () => {
      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      
      switch (filter) {
        case 'grayscale':
          ctx.filter += ' grayscale(100%)';
          break;
        case 'sepia':
          ctx.filter += ' sepia(100%)';
          break;
        case 'blur':
          ctx.filter += ' blur(5px)';
          break;
        case 'none':
        default:
          break;
      }

      // Redraw with filters
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.filter = ctx.filter;
        tempCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        ctx.drawImage(tempCanvas, 0, 0);
      }

      animationFrame = requestAnimationFrame(drawFrame);
    };

    if (video.readyState >= 2) {
      drawFrame();
    } else {
      video.addEventListener('loadeddata', drawFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      video.removeEventListener('loadeddata', drawFrame);
    };
  }, [videoRef, filter, brightness, contrast]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
