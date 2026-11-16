// src/pages/EditorPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Rocket, GripVertical, X, Check, ExternalLink, MonitorSmartphone,
  PanelTop, LayoutTemplate, Type, Image as ImageIcon, LayoutGrid, PanelBottom,
  Monitor, Tablet, Smartphone, Loader2,
} from 'lucide-react';
import useEditorStore from '../store/editorStore';
import client from '../api/client';
import PropPanel from '../components/editor/PropPanel';
import Aurora from '../components/ui/Aurora';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BLOCK_TYPES = [
  { type: 'navbar',   label: 'Navbar',   desc: 'Header + nav links',    icon: PanelTop },
  { type: 'hero',     label: 'Hero',     desc: 'Headline + CTA button', icon: LayoutTemplate },
  { type: 'text',     label: 'Text',     desc: 'Paragraph content',     icon: Type },
  { type: 'image',    label: 'Image',    desc: 'Photo or graphic',      icon: ImageIcon },
  { type: 'features', label: 'Features', desc: '3-column grid',         icon: LayoutGrid },
  { type: 'footer',   label: 'Footer',   desc: 'Bottom bar',            icon: PanelBottom },
];

/* readable text colour for a user-picked background */
function readableOn(hex) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec((hex || '').trim());
  if (!m) return undefined;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#14101f' : '#ffffff';
}

/* ── block preview renderers (miniature of the site) ── */
function BlockPreview({ section }) {
  const p = section.props || {};
  switch (section.type) {
    case 'navbar': return (
      <div className="bp bp-nav">
        <strong>{p.logo || 'My Site'}</strong>
        <div>{(p.links || []).map((l, i) => <span key={i}>{l}</span>)}</div>
      </div>
    );
    case 'hero': return (
      <div className="bp bp-hero" style={{ background: p.bg || 'transparent', color: readableOn(p.bg) }}>
        <h3>{p.title || 'Your headline'}</h3>
        <p>{p.subtitle || ''}</p>
        {p.btnText && <span className="bp-btn">{p.btnText}</span>}
      </div>
    );
    case 'text': return (
      <div className="bp bp-text">
        {(p.content || '').slice(0, 140) || 'Text block'}{(p.content || '').length > 140 ? '…' : ''}
      </div>
    );
    case 'image': return (
      <div className="bp bp-img">
        {p.url && p.url !== '__loading__'
          ? <img src={p.url} alt={p.alt || ''} />
          : <div className="bp-img__empty">{p.url === '__loading__' ? 'Uploading…' : 'No image yet — add one in the panel'}</div>}
      </div>
    );
    case 'features': return (
      <div className="bp bp-feat">
        <h4>{p.title || 'Features'}</h4>
        <div className="bp-feat__grid">
          {(p.items || []).map((item, i) => <div key={i} className="bp-feat__item"><i />{item}</div>)}
        </div>
      </div>
    );
    case 'footer': return <div className="bp bp-foot">{p.text || '© 2025'}</div>;
    default: return <div className="bp bp-foot">{section.type} block</div>;
  }
}

/* ── sortable section card ── */
function SortableSection({ section }) {
  const { selectedId, setSelected, removeSection, setSaveStatus } = useEditorStore();
  const isSelected = section.id === selectedId;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`sec${isSelected ? ' is-selected' : ''}`} onClick={() => setSelected(section.id)}>
        <div className="sec__bar">
          <div className="sec__grip" {...listeners} {...attributes} style={{ cursor: isDragging ? 'grabbing' : 'grab' }} title="Drag to reorder">
            <GripVertical size={16} />
          </div>
          <span className="sec__type">{section.type}</span>
          {isSelected && <span className="sec__tag">editing</span>}
          <div style={{ flex: 1 }} />
          <button
            className="sec__del" title="Delete section" aria-label={`Delete ${section.type} section`}
            onClick={e => { e.stopPropagation(); removeSection(section.id); setSaveStatus('unsaved'); }}
          >
            <X size={15} />
          </button>
        </div>
        <BlockPreview section={section} />
      </div>
    </div>
  );
}

/* ── left panel ── */
function BlockPalette() {
  const { addSection } = useEditorStore();
  return (
    <aside className="panel panel--left" aria-label="Blocks">
      <h2 className="panel__title">Blocks</h2>
      <p className="panel__hint">Click a block to add it to your page.</p>
      {BLOCK_TYPES.map(({ type, label, desc, icon: Icon }) => (
        <button key={type} className="palette__item" onClick={() => addSection(type)}>
          <span className="palette__icon"><Icon size={18} strokeWidth={1.8} /></span>
          <span>
            <div className="palette__label">{label}</div>
            <div className="palette__desc">{desc}</div>
          </span>
        </button>
      ))}
    </aside>
  );
}

/* ── center canvas ── */
function Canvas() {
  const { sections, reorderSections, setSaveStatus } = useEditorStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oi = sections.findIndex(s => s.id === active.id);
    const ni = sections.findIndex(s => s.id === over.id);
    reorderSections(arrayMove(sections, oi, ni));
    setSaveStatus('unsaved');
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <main className="canvas">
          <div className="canvas__inner">
            {sections.length === 0 ? (
              <div className="canvas-empty">
                <div className="canvas-empty__icon"><MonitorSmartphone size={28} strokeWidth={1.6} /></div>
                <h2>Your page is empty</h2>
                <p>Pick a block from the left panel to start building.</p>
              </div>
            ) : (
              <>
                {sections.map(section => <SortableSection key={section.id} section={section} />)}
                <div className="canvas-add">Add more blocks from the left panel</div>
              </>
            )}
          </div>
        </main>
      </SortableContext>
    </DndContext>
  );
}

/* ── preview modal ── */
// Preview HTML is built exactly like the published page.
function buildHTML(sections) {
  const body = sections.map(s => {
    const p = s.props || {};
    switch (s.type) {
      case 'navbar': return `<nav style="display:flex;align-items:center;justify-content:space-between;padding:14px 40px;border-bottom:1px solid #eee;font-family:system-ui,sans-serif"><strong style="font-size:18px">${p.logo || 'My Site'}</strong><div>${(p.links || []).map(l => `<a href="#" style="margin-left:20px;text-decoration:none;color:#333;font-size:14px">${l}</a>`).join('')}</div></nav>`;
      case 'hero':   return `<section style="background:${p.bg || '#fff'};padding:80px 40px;text-align:center;font-family:system-ui,sans-serif"><h1 style="font-size:42px;margin-bottom:14px">${p.title || ''}</h1><p style="font-size:18px;color:#666;margin-bottom:24px">${p.subtitle || ''}</p>${p.btnText ? `<a href="#" style="display:inline-block;padding:12px 28px;background:#b5285a;color:#fff;border-radius:8px;text-decoration:none;font-size:15px">${p.btnText}</a>` : ''}</section>`;
      case 'text':   return `<section style="max-width:720px;margin:0 auto;padding:60px 40px;font-family:system-ui,sans-serif"><p style="font-size:17px;line-height:1.8;color:#444">${p.content || ''}</p></section>`;
      case 'image':  return p.url ? `<section style="text-align:center;padding:40px;background:#f8f8f8"><img src="${p.url}" alt="${p.alt || ''}" style="max-width:100%;border-radius:10px"></section>` : '';
      case 'features': return `<section style="padding:60px 40px;font-family:system-ui,sans-serif"><h2 style="text-align:center;font-size:28px;margin-bottom:32px">${p.title || 'Features'}</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:0 auto">${(p.items || []).map(item => `<div style="background:#f8f8f8;border-radius:10px;padding:20px"><strong>${item}</strong></div>`).join('')}</div></section>`;
      case 'footer': return `<footer style="text-align:center;padding:24px;border-top:1px solid #eee;font-family:system-ui,sans-serif;font-size:13px;color:#999">${p.text || ''}</footer>`;
      default: return '';
    }
  }).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif}</style></head><body>${body}</body></html>`;
}

const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: '100%', size: '1280px', icon: Monitor },
  { id: 'tablet',  label: 'Tablet',  width: 768,    size: '768px',  icon: Tablet },
  { id: 'mobile',  label: 'Mobile',  width: 375,    size: '375px',  icon: Smartphone },
];

function PreviewModal({ onClose }) {
  const { sections } = useEditorStore();
  const [vp, setVp] = useState('desktop');
  const html = useMemo(() => buildHTML(sections), [sections]);
  const [blobUrl, setBlobUrl] = useState('');
  const current = VIEWPORTS.find(v => v.id === vp);

  useEffect(() => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="preview" role="dialog" aria-modal="true" aria-label="Preview">
      <div className="preview__bar">
        <span className="preview__title">Preview</span>
        <div className="seg" role="group" aria-label="Device size">
          {VIEWPORTS.map(({ id, label, icon: Icon }) => (
            <button key={id} aria-pressed={vp === id} onClick={() => setVp(id)}><Icon size={15} />{label}</button>
          ))}
        </div>
        <span className="preview__size">{current.size}</span>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
      <div className="preview__stage">
        {blobUrl && (
          <iframe
            key={vp} src={blobUrl} title="Preview" className="preview__frame"
            style={{ width: current.width, maxWidth: current.width }}
            sandbox=""   /* preview needs no scripts; keeps injected markup from running */
          />
        )}
      </div>
    </div>
  );
}

/* ── publish modal ── */
function PublishModal({ url, onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal glow-border publish" role="dialog" aria-modal="true" aria-labelledby="pub-title">
        <div className="publish__icon"><Check size={28} strokeWidth={2.5} /></div>
        <h2 className="modal__title" id="pub-title">Published!</h2>
        <p className="modal__sub">Your site is live at:</p>
        <div className="publish__url">{url}</div>
        <div className="modal__actions">
          <a className="btn btn-primary" href={url} target="_blank" rel="noreferrer">Open site <ExternalLink size={15} /></a>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── main toolbar ── */
function Toolbar({ pageId, onPreview }) {
  const navigate = useNavigate();
  const { saveStatus, sections } = useEditorStore();
  const [publishing, setPublishing] = useState(false);
  const [pubUrl, setPubUrl]         = useState(null);

  const statusColor = saveStatus === 'saved' ? 'var(--success)' : saveStatus === 'saving' ? 'var(--warn)' : 'var(--muted)';
  const statusLabel = { saved: 'Saved', saving: 'Saving…', unsaved: 'Unsaved changes' }[saveStatus] || 'Saved';

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // get the site_id from the page
      const { data: page } = await client.get(`/pages/${pageId}`);
      // save the latest sections before publishing
      await client.put(`/pages/${pageId}/sections`, { sections });
      // call publish endpoint, then show the live URL
      const { data } = await client.post(`/sites/${page.site_id}/publish`);
      setPubUrl(data.url);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <header className="editor__bar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}><ArrowLeft size={15} />Dashboard</button>
        <span className="editor__sep" />
        <Logo size={32} small />
        <div className="editor__spacer" />
        <span className="save" style={{ color: statusColor }}>
          <i style={{ background: statusColor }} />{statusLabel}
        </span>
        <ThemeToggle />
        <button className="btn btn-secondary btn-sm" onClick={onPreview}><Eye size={15} />Preview</button>
        <button className="btn btn-primary btn-sm" onClick={handlePublish} disabled={publishing}>
          {publishing ? <><Loader2 size={15} className="spin" />Publishing…</> : <><Rocket size={15} />Publish</>}
        </button>
      </header>
      {pubUrl && <PublishModal url={pubUrl} onClose={() => setPubUrl(null)} />}
    </>
  );
}

/* ── EditorPage ── */
export default function EditorPage() {
  const { pageId } = useParams();
  const { sections, setSections, saveStatus, setSaveStatus } = useEditorStore();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    client.get(`/pages/${pageId}/sections`).then(r => setSections(r.data));
  }, [pageId]);

  useEffect(() => {
    if (saveStatus !== 'unsaved') return;
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await client.put(`/pages/${pageId}/sections`, { sections });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [sections, saveStatus]);

  return (
    <div className="editor">
      <Aurora />
      <Toolbar pageId={pageId} onPreview={() => setShowPreview(true)} />
      <div className="editor__body">
        <BlockPalette />
        <Canvas />
        <PropPanel />
      </div>
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  );
}
