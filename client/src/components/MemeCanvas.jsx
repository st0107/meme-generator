import { useEffect, useRef } from 'react';

export function MemeCanvas({ topText, bottomText, template, canvasRef }) {
  const internalCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = template?.image || 'https://i.imgflip.com/1bij.jpg';
    img.onload = () => {
      const width = 480;
      const height = 480;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = 'bold 30px sans-serif';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 7;
      ctx.strokeText(topText, width / 2, 48);
      ctx.fillText(topText, width / 2, 48);
      ctx.strokeText(bottomText, width / 2, height - 24);
      ctx.fillText(bottomText, width / 2, height - 24);
    };
  }, [topText, bottomText, template]);

  return (
    <canvas
      ref={(node) => {
        internalCanvasRef.current = node;
        if (canvasRef) {
          canvasRef.current = node;
        }
      }}
      className="w-full rounded-3xl border border-slate-200 bg-slate-100 shadow-lg dark:border-slate-800 dark:bg-slate-900"
    />
  );
}
