import { useEffect, useRef } from 'react';

const CANVAS_SIZE = 720;

function drawImageCover(ctx, img, width, height) {
  const scale = Math.max(width / img.width, height / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      return;
    }

    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const trimmed = lines.slice(0, maxLines);
  const last = trimmed[maxLines - 1];
  trimmed[maxLines - 1] = last.length > 3 ? `${last.slice(0, -3)}...` : last;
  return trimmed;
}

function fitText(ctx, text, maxWidth, maxLines, startSize) {
  for (let size = startSize; size >= 28; size -= 2) {
    ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
    const lines = wrapLines(ctx, text, maxWidth, maxLines);
    const fits = lines.every((line) => ctx.measureText(line).width <= maxWidth);
    if (fits && lines.length <= maxLines) {
      return { lines, size };
    }
  }

  ctx.font = '900 28px Impact, Arial Black, sans-serif';
  return { lines: wrapLines(ctx, text, maxWidth, maxLines), size: 28 };
}

function drawCaption(ctx, text, position) {
  const maxWidth = CANVAS_SIZE - 72;
  const { lines, size } = fitText(ctx, text, maxWidth, 3, 54);
  const lineHeight = size * 1.08;
  const startY = position === 'top'
    ? 62
    : CANVAS_SIZE - 48 - ((lines.length - 1) * lineHeight);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.lineWidth = Math.max(8, size * 0.18);
  ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;

  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight);
    ctx.strokeText(line.toUpperCase(), CANVAS_SIZE / 2, y);
    ctx.fillText(line.toUpperCase(), CANVAS_SIZE / 2, y);
  });
}

export function MemeCanvas({ topText, bottomText, template, canvasRef }) {
  const internalCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = template?.image || 'https://i.imgflip.com/1bij.jpg';

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawImageCover(ctx, img, CANVAS_SIZE, CANVAS_SIZE);
      drawCaption(ctx, topText, 'top');
      drawCaption(ctx, bottomText, 'bottom');
    };

    img.onerror = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawCaption(ctx, topText || 'Template unavailable', 'top');
      drawCaption(ctx, bottomText || 'Try another image', 'bottom');
    };
  }, [topText, bottomText, template?.image]);

  return (
    <canvas
      ref={(node) => {
        internalCanvasRef.current = node;
        if (canvasRef) {
          canvasRef.current = node;
        }
      }}
      className="aspect-square w-full rounded-3xl border border-slate-200 bg-slate-100 shadow-lg dark:border-slate-800 dark:bg-slate-900"
    />
  );
}
