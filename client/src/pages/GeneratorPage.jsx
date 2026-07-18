import { useEffect, useRef, useState } from 'react';
import { Sparkles, Download, History, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { MemeCanvas } from '../components/MemeCanvas';
import { fetchTemplates, generateMeme } from '../services/memeService';
import { useToast } from '../context/ToastContext';
import { useMemeHistory } from '../context/MemeContext';
import { downloadMeme } from '../utils/downloadImage';

const tones = ['Funny', 'Dark', 'Sarcastic', 'Programmer', 'Corporate'];

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Funny');
  const [templateId, setTemplateId] = useState('drake');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { showToast } = useToast();
  const { history, addToHistory } = useMemeHistory();

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
      setResult(data);
      const template = templates.find((item) => item.id === templateId) || data.template;
      setSelectedTemplate(template);
      addToHistory({ prompt, tone, template, topText: data.topText, bottomText: data.bottomText });
      showToast('Meme generated successfully.', 'success');
    } catch {
      showToast('Generation failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event) => {
    const id = event.target.value;
    setTemplateId(id);
    setSelectedTemplate(templates.find((item) => item.id === id) || null);
  };

  const canvasRef = useRef(null);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles size={18} /> Create your meme
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-4 min-h-32 w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 outline-none ring-0 dark:border-slate-700 dark:bg-slate-950"
              placeholder="e.g. My code compiles on the first try..."
            />
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
                </select>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium">Template Gallery</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((item) => (
                  <button key={item.id} onClick={() => handleTemplateChange({ target: { value: item.id } })} className={`rounded-2xl border p-3 text-left text-sm ${templateId === item.id ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="font-medium">{item.name}</div>
                    <div className="mt-1 text-slate-500 dark:text-slate-400">Classic meme layout</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} {loading ? 'Generating...' : 'Generate Meme'}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <History size={18} /> Recent history
            </div>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? <p className="text-sm text-slate-500">No memes generated yet.</p> : history.map((item, index) => (
                <div key={`${item.prompt}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <div className="font-medium">{item.prompt}</div>
                  <div className="mt-1 text-slate-500">{item.topText} / {item.bottomText}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Preview</div>
              <button onClick={() => downloadMeme(canvasRef.current)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
                <Download size={16} /> Download PNG
              </button>
            </div>
            <div className="mt-4">
              {result ? (
                <MemeCanvas canvasRef={canvasRef} topText={result.topText} bottomText={result.bottomText} template={selectedTemplate} />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
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
