// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Pencil, Trash2, LayoutTemplate, User, Loader2, AlertCircle } from 'lucide-react';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import Aurora from '../components/ui/Aurora';
import AppBar from '../components/ui/AppBar';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';

function SiteCard({ site, onEdit, onDelete }) {
  const live = !!site.published_at;
  return (
    <article className="site glass">
      <div className="thumb">
        <div className="mini">
          <div className="mini__bar">
            <i style={{ background: '#f87171' }} /><i style={{ background: '#facc15' }} /><i style={{ background: '#34d399' }} />
          </div>
          <div className="mini__body">
            <div className="mini__line" style={{ width: '58%', height: 6 }} />
            <div className="mini__line" style={{ width: '40%', height: 4 }} />
            <div className="mini__line mini__line--accent" style={{ width: '26%', height: 7 }} />
          </div>
        </div>
      </div>
      <div className="site__body">
        <span className={`pill${live ? ' pill--live' : ''}`}><i />{live ? 'Live' : 'Draft'}</span>
        <h3 className="site__name">{site.name}</h3>
        <p className="site__url">{site.subdomain}.builder.app</p>
        <div className="site__actions">
          <button className="btn btn-secondary btn-sm" onClick={onEdit}><Pencil size={15} />Edit</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete} aria-label={`Delete ${site.name}`}><Trash2 size={15} />Delete</button>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [sites, setSites]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [siteName, setSiteName]   = useState('');
  const [creating, setCreating]   = useState(false);
  const [createErr, setCreateErr] = useState('');
  const navigate   = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    client.get('/sites')
      .then(r => setSites(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const onKey = e => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const closeModal = () => { setShowModal(false); setSiteName(''); setCreateErr(''); };

  const createSite = async () => {
    if (!siteName.trim()) return;
    setCreating(true);
    setCreateErr('');
    try {
      const { data } = await client.post('/sites', { name: siteName.trim() });
      closeModal();
      // Sequelize returns Pages (capital P) with include
      const pageId = data.Pages?.[0]?.id;
      navigate('/templates', { state: { siteId: data.id, pageId } });
    } catch (err) {
      setCreateErr(err.response?.data?.error || 'Failed to create site');
    } finally {
      setCreating(false);
    }
  };

  const editSite = (site) => {
    const pageId = site.Pages?.[0]?.id;
    if (!pageId) {
      alert('No page found. Delete this site and create a new one.');
      return;
    }
    navigate(`/editor/${pageId}`);
  };

  const deleteSite = (site) => {
    client.delete(`/sites/${site.id}`);
    setSites(prev => prev.filter(s => s.id !== site.id));
  };

  if (loading) return (
    <div className="app">
      <Aurora />
      <div className="center-state">
        <div className="center-state__inner"><Loader2 className="spin" size={20} />Loading your sites…</div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <Aurora />
      <AppBar start={<Logo size={38} small />}>
        <ThemeToggle />
        <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={15} />Sign out</button>
        <span className="avatar" aria-hidden="true"><User size={19} /></span>
      </AppBar>

      <main className="app__body">
        <div className="page-head">
          <div>
            <h1 className="page-title">Your sites</h1>
            <p className="page-sub">{sites.length} site{sites.length !== 1 ? 's' : ''} total</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} />New site</button>
        </div>

        {sites.length === 0 ? (
          <div className="empty">
            <div className="empty__icon"><LayoutTemplate size={34} strokeWidth={1.6} /></div>
            <h2>No sites yet</h2>
            <p>Create your first site and start building.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>Create your first site</button>
          </div>
        ) : (
          <div className="sites">
            {sites.map(site => (
              <SiteCard key={site.id} site={site} onEdit={() => editSite(site)} onDelete={() => deleteSite(site)} />
            ))}
            <button className="site-new" onClick={() => setShowModal(true)}>
              <span className="site-new__plus"><Plus size={24} /></span>
              New site
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal glow-border" role="dialog" aria-modal="true" aria-labelledby="new-site-title">
            <h2 className="modal__title" id="new-site-title">Name your site</h2>
            <p className="modal__sub">You can change this later from the dashboard.</p>
            <div className="modal-input" style={{ marginTop: 20 }}>
              {createErr && <div className="alert alert--error" role="alert"><AlertCircle size={16} />{createErr}</div>}
              <div className="input-group">
                <input
                  placeholder="e.g. My Portfolio" aria-label="Site name" style={{ paddingLeft: 18 }}
                  value={siteName} onChange={e => setSiteName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createSite()} autoFocus
                />
              </div>
            </div>
            <div className="modal__actions">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={createSite} disabled={creating || !siteName.trim()}>
                {creating ? <><Loader2 size={16} className="spin" />Creating…</> : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
