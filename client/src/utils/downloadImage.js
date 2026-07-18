export function downloadMeme(canvas, filename = 'ai-meme.png') {
  if (!canvas) return false;

  const link = document.createElement('a');
  try {
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch {
    return false;
  }
}
