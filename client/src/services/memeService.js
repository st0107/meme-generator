import axios from 'axios';

const API_BASE = '/generate-meme';

export async function generateMeme(payload) {
  const response = await axios.post(API_BASE, payload);
  return response.data;
}

export async function fetchTemplates() {
  const response = await axios.get('/api/templates');
  return response.data;
}
