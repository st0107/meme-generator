export function downloadMeme(canvas) {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'ai-meme.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
