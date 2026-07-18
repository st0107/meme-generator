import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  History,
  Loader2,
  RefreshCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { MemeCanvas } from '../components/MemeCanvas';
import { fetchTemplates, generateMeme } from '../services/memeService';
import { useToast } from '../context/ToastContext';
import { useMemeHistory } from '../context/MemeContext';
import { downloadMeme } from '../utils/downloadImage';

const tones = ['Funny', 'Dark', 'Sarcastic', 'Programmer', 'Corporate'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function createFileTemplate(fileName, image) {
  return {
    id: 'custom-upload',
    name: fileName || 'Custom upload',
    image,
    custom: true,
  };
}

function createDownloadName(prompt) {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  return slug ? `${slug}-meme.png` : 'ai-meme.png';
}

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Funny');
  const [templateId, setTemplateId] = useState('drake');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customTemplate, setCustomTemplate] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const { showToast } = useToast();
  const { history, addToHistory, clearHistory } = useMemeHistory();

  const activeTemplate = useMemo(() => {
    if (templateId === 'custom-upload' && customTemplate) return customTemplate;
    return selectedTemplate;
  }, [customTemplate, selectedTemplate, templateId]);

  useEffect(() => {
    fetchTemplates()
      .then((data) => {
        setTemplates(data);
        setSelectedTemplate(data[0]);
      })
      .catch(() => showToast('Could not load templates.', 'error'));
  }, [showToast]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a topic.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await generateMeme({ prompt, tone, templateId });
      const template = activeTemplate || data.template;
      const generated = {
        ...data,
        template,
      };

      setResult(generated);
      setTopText(data.topText);
      setBottomText(data.bottomText);
      setSelectedTemplate(template);
      addToHistory({
        prompt,
        tone,
        template,
        topText: data.topText,
        bottomText: data.bottomText,
        source: data.source,
        createdAt: new Date().toISOString(),
      });
      showToast(data.source === 'fallback' ? data.notice || 'Fallback captions used.' : 'Meme generated successfully.', data.source === 'fallback' ? 'info' : 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Generation failed. Try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event) => {
    const id = event.target.value;
    setTemplateId(id);
    setCustomTemplate(null);
    setSelectedTemplate(templates.find((item) => item.id === id) || null);
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      showToast('Image must be under 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const template = createFileTemplate(file.name, reader.result);
      setCustomTemplate(template);
      setSelectedTemplate(template);
      setTemplateId(template.id);
      showToast('Custom template loaded.', 'success');
    };
    reader.onerror = () => showToast('Could not read that image.', 'error');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleUseHistory = (item) => {
    setPrompt(item.prompt);
    setTone(item.tone);
    setTopText(item.topText);
    setBottomText(item.bottomText);
    setResult(item);
    setSelectedTemplate(item.template);
    setCustomTemplate(item.template?.custom ? item.template : null);
    setTemplateId(item.template?.id || 'drake');
  };

  const handleDownload = () => {
    const downloaded = downloadMeme(canvasRef.current, createDownloadName(prompt));
    showToast(downloaded ? 'PNG downloaded.' : 'Generate a meme before downloading.', downloaded ? 'success' : 'error');
  };

  const canPreview = Boolean(result && activeTemplate);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles size={18} /> Create your meme
            </div>

            <textarea
              value={prompt}
              maxLength={280}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-4 min-h-32 w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 outline-none ring-0 focus:border-fuchsia-500 dark:border-slate-700 dark:bg-slate-950"
              placeholder="e.g. My code compiles on the first try..."
            />
            <div className="mt-1 text-right text-xs text-slate-500">{prompt.length}/280</div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  {tones.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Template</label>
                <select value={templateId} onChange={handleTemplateChange} className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  {templates.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                  {customTemplate ? <option value={customTemplate.id}>{customTemplate.name}</option> : null}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700">
                <Upload size={16} /> Upload image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button onClick={handleGenerate} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} {loading ? 'Generating...' : 'Generate Meme'}
              </button>
            </div>

            {result ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Top caption
                  <input value={topText} maxLength={90} onChange={(e) => setTopText(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
                </label>
                <label className="text-sm font-medium">
                  Bottom caption
                  <input value={bottomText} maxLength={90} onChange={(e) => setBottomText(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
                </label>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 text-lg font-semibold">Template Gallery</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((item) => (
                <button key={item.id} onClick={() => handleTemplateChange({ target: { value: item.id } })} className={`overflow-hidden rounded-2xl border text-left text-sm transition ${templateId === item.id ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-200 hover:border-slate-400 dark:border-slate-700'}`}>
                  <img src={item.image} alt="" className="h-28 w-full object-cover" />
                  <div className="p-3 font-medium">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <History size={18} /> Recent history
              </div>
              {history.length ? (
                <button onClick={clearHistory} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
                  <Trash2 size={15} /> Clear
                </button>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? <p className="text-sm text-slate-500">No memes generated yet.</p> : history.map((item, index) => (
                <button key={`${item.prompt}-${index}`} onClick={() => handleUseHistory(item)} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-sm hover:border-fuchsia-400 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{item.prompt}</div>
                    <RefreshCcw size={15} className="shrink-0 text-slate-400" />
                  </div>
                  <div className="mt-1 text-slate-500">{item.topText} / {item.bottomText}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Preview</div>
                {result?.source ? <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{result.source} captions</div> : null}
              </div>
              <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
                <Download size={16} /> Download PNG
              </button>
            </div>
            <div className="mt-4">
              {canPreview ? (
                <MemeCanvas canvasRef={canvasRef} topText={topText} bottomText={bottomText} template={activeTemplate} />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                  Generate a meme to see the preview.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
