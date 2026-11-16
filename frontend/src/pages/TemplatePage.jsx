// src/pages/TemplatePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import useEditorStore from '../store/editorStore';
import client from '../api/client';
import { v4 as uuidv4 } from 'uuid';
import Aurora from '../components/ui/Aurora';
import AppBar from '../components/ui/AppBar';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';

const Line = ({ w, h, accent }) => <div className={`mini__line${accent ? ' mini__line--accent' : ''}`} style={{ width: w, height: h }} />;

const TPL_PREVIEWS = {
  blank:     () => <><Line w="40%" h={5} /><Line w="28%" h={4} /></>,
  landing:   () => <><Line w="60%" h={6} /><Line w="42%" h={4} /><Line w="24%" h={7} accent /></>,
  portfolio: () => <><div className="mini__img" style={{ width: '72%', height: 28 }} /><Line w="48%" h={5} /><Line w="34%" h={4} /></>,
};

export default function TemplatePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // `state` is passed by the Dashboard: navigate('/templates', { state: { siteId } })
  // It tells this page which site we are choosing a template for.
  const { setSections } = useEditorStore();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Opened directly (no site chosen) → go back to the dashboard
  useEffect(() => {
    if (!state?.siteId) navigate('/', { replace: true });
  }, [state, navigate]);

  const pick = async () => {
    if (!selected || !state?.siteId) return;
    setLoading(true);
    setError('');
    try {
      const template = TEMPLATES.find(t => t.id === selected);
      // Give each section a unique ID
      const sections = template.sections.map(s => ({ ...s, id: uuidv4() }));
      // Load template into editor store
      setSections(sections);

      // Get the home page ID for this site
      const { data: pages } = await client.get(`/sites/${state.siteId}/pages`);
      let pageId;
      if (pages.length > 0) {
        pageId = pages[0].id;
      } else {
        // No page yet → create it on the fly
        const { data: newPage } = await client.post(`/sites/${state.siteId}/pages`, { title: 'Home' });
        pageId = newPage.id;
      }
      // Save template sections to the backend
      await client.put(`/pages/${pageId}/sections`, { sections });
      navigate(`/editor/${pageId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not set up the template. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Aurora />
      <AppBar start={
        <>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}><ArrowLeft size={15} />Back</button>
          <Logo size={34} small />
        </>
      }>
        <ThemeToggle />
      </AppBar>

      <main className="app__body">
        <div className="page-head">
          <div>
            <h1 className="page-title">Choose a template</h1>
            <p className="page-sub">Pick a starting point — you can customise every block after.</p>
          </div>
        </div>

        <div className="tpls" role="group" aria-label="Templates">
          {TEMPLATES.map(t => {
            const Preview = TPL_PREVIEWS[t.id];
            const isSel = selected === t.id;
            return (
              <button key={t.id} type="button" className="tpl glass" aria-pressed={isSel} onClick={() => setSelected(t.id)}>
                <div className="thumb">
                  <div className="mini">
                    <div className="mini__bar">
                      <i style={{ background: '#f87171' }} /><i style={{ background: '#facc15' }} /><i style={{ background: '#34d399' }} />
                    </div>
                    <div className="mini__body">{Preview ? <Preview /> : <Line w="50%" h={5} />}</div>
                  </div>
                  {isSel && <span className="tpl__badge"><Check size={13} strokeWidth={3} />Selected</span>}
                </div>
                <div className="tpl__info">
                  <span className="tpl__name">{t.name}</span>
                  <span className={`tpl__tag${t.id === 'landing' ? ' tpl__tag--hot' : ''}`}>
                    {t.id === 'landing' ? 'Popular' : t.id === 'blank' ? 'Empty' : 'Template'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="continue">
          {error && <div className="alert alert--error" role="alert"><AlertCircle size={16} />{error}</div>}
          {!selected && <span className="continue__hint">Select a template to continue</span>}
          <button className="btn btn-primary btn-lg" onClick={pick} disabled={!selected || loading}>
            {loading ? <><Loader2 size={18} className="spin" />Setting up…</> : <>Start building <ArrowRight size={18} /></>}
          </button>
        </div>
      </main>
    </div>
  );
}
