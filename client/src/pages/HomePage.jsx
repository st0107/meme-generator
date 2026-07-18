import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Images, Download } from 'lucide-react';
import { Layout } from '../components/Layout';

export default function HomePage() {
  return (
    <Layout>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-700 dark:text-fuchsia-300">
            <Sparkles size={16} /> AI-powered meme magic
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Turn any topic into a hilarious meme in seconds.
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
            Describe your idea, pick a vibe, select a template, edit the captions, and download a share-ready PNG.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/generator" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg">
              Generate Meme <ArrowRight size={18} />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm dark:border-slate-700">
              <Images size={16} /> Templates and uploads
            </div>
          </div>
        </div>
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <Download size={20} /> Fast, polished, and shareable
          </div>
          <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <li>- Instant AI-generated captions tailored to your tone.</li>
            <li>- Template gallery, custom uploads, and editable captions.</li>
            <li>- One-click PNG download and reusable local history.</li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
