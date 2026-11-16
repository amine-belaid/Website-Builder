import { useRef } from 'react';
import { MousePointerClick, Upload, X, Loader2 } from 'lucide-react';
import useEditorStore from '../../store/editorStore';

const Input = ({ label, textarea, rows, ...props }) => (
  <div className="pf">
    <label>{label}</label>
    {textarea
      ? <textarea className="pf__input" rows={rows || 3} {...props} />
      : <input className="pf__input" {...props} />}
  </div>
);

export default function PropPanel() {
  const { sections, selectedId, updateSection, setSaveStatus } = useEditorStore();
  const section = sections.find(s => s.id === selectedId);
  const fileRef = useRef(null);

  /* ── empty state ── */
  if (!section) return (
    <aside className="panel panel--right">
      <div className="props-empty">
        <span className="palette__icon"><MousePointerClick size={20} strokeWidth={1.8} /></span>
        <p>Select a block<br />to edit its properties</p>
      </div>
    </aside>
  );

  const update = (key, value) => {
    updateSection(section.id, { [key]: value });
    setSaveStatus('unsaved');
  };

  /* ── image upload handler ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    update('url', '__loading__');   // show uploading state immediately

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assets/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // no Content-Type: browser adds the boundary
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      update('url', data.url);      // Cloudinary CDN URL
    } catch (err) {
      alert(err.message || 'Upload failed. Try again.');
      update('url', '');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const renderFields = () => {
    const p = section.props || {};

    switch (section.type) {
      case 'navbar':
        return <>
          <Input label="Logo text" value={p.logo || ''} onChange={e => update('logo', e.target.value)} />
          <Input label="Links (comma separated)" placeholder="Home, About, Contact"
            value={(p.links || []).join(', ')}
            onChange={e => update('links', e.target.value.split(',').map(s => s.trim()))} />
        </>;

      case 'hero':
        return <>
          <Input label="Title" value={p.title || ''} onChange={e => update('title', e.target.value)} />
          <Input label="Subtitle" textarea rows={3} value={p.subtitle || ''} onChange={e => update('subtitle', e.target.value)} />
          <Input label="Button text" placeholder="Get started" value={p.btnText || ''} onChange={e => update('btnText', e.target.value)} />
          <div className="pf">
            <label>Background color</label>
            <div className="pf__row">
              <input type="color" className="pf__color" aria-label="Pick background color"
                value={p.bg || '#0a090f'} onChange={e => update('bg', e.target.value)} />
              <input className="pf__input" placeholder="#0a090f" aria-label="Background color hex"
                value={p.bg || '#0a090f'} onChange={e => update('bg', e.target.value)} />
            </div>
          </div>
        </>;

      case 'text':
        return <Input label="Content" textarea rows={6} value={p.content || ''} onChange={e => update('content', e.target.value)} />;

      case 'image': {
        const uploading = p.url === '__loading__';
        return <>
          <div className="pf">
            <span className="pf__label">Upload image</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleImageUpload} />
            <button type="button" className="btn btn-secondary btn-sm btn-block" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <><Loader2 size={15} className="spin" />Uploading…</> : <><Upload size={15} />Choose image</>}
            </button>
            <p className="pf__note">JPEG, PNG, WebP or GIF — max 5 MB</p>
          </div>

          {p.url && !uploading && (
            <div className="pf">
              <span className="pf__label">Preview</span>
              <div className="pf__preview">
                <img src={p.url} alt={p.alt || 'preview'} />
                <button type="button" className="pf__remove" onClick={() => update('url', '')} title="Remove image" aria-label="Remove image"><X size={14} /></button>
              </div>
            </div>
          )}

          <Input label="Or paste URL" placeholder="https://example.com/image.jpg"
            value={uploading ? '' : p.url || ''} onChange={e => update('url', e.target.value)} />
          <Input label="Alt text" placeholder="Describe the image"
            value={p.alt || ''} onChange={e => update('alt', e.target.value)} />
        </>;
      }

      case 'features':
        return <>
          <Input label="Section title" value={p.title || ''} onChange={e => update('title', e.target.value)} />
          {(p.items || []).map((item, i) => (
            <Input key={i} label={`Feature ${i + 1}`} value={item}
              onChange={e => {
                const items = [...(p.items || [])];
                items[i] = e.target.value;
                update('items', items);
              }} />
          ))}
        </>;

      case 'footer':
        return <Input label="Footer text" placeholder="© 2025 My Site" value={p.text || ''} onChange={e => update('text', e.target.value)} />;

      default:
        return <p className="pf__note">No properties.</p>;
    }
  };

  return (
    <aside className="panel panel--right">
      <div className="props__head">
        <span className="sec__type">{section.type}</span>
        <span>properties</span>
      </div>
      <div className="props__body">{renderFields()}</div>
    </aside>
  );
}
