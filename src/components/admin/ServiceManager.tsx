import { useMemo, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price_chf: number;
  deposit_chf: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

const PRICE_RANGE_LABELS: Record<string, string> = {
  'maske-soin-initiale-augenmaske': 'CHF 30-150',
  'klassische-ganzkoerpermassage': 'CHF 135-1200',
};

function formatAdminPrice(service: Service): string {
  return PRICE_RANGE_LABELS[service.slug] || `CHF ${service.price_chf}`;
}

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Service>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const categoryOptions = useMemo(() => {
    const categories = services.map(service => service.category || 'Ohne Kategorie');
    return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b, 'de-CH'));
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('de-CH');

    return services.filter(service => {
      const category = service.category || 'Ohne Kategorie';
      const searchable = [
        service.name,
        service.slug,
        service.description || '',
        category,
        formatAdminPrice(service),
      ].join(' ').toLocaleLowerCase('de-CH');
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.is_active) ||
        (statusFilter === 'inactive' && !service.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, searchTerm, services, statusFilter]);

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices((data as Service[]) || []);
    setLoading(false);
  }

  function startEdit(s: Service) {
    setEditing(s.id);
    setEditData({ ...s });
  }

  async function saveEdit() {
    if (!editing) return;
    await supabase.from('services').update({
      name: editData.name,
      description: editData.description,
      duration_minutes: editData.duration_minutes,
      price_chf: editData.price_chf,
      deposit_chf: editData.deposit_chf,
      category: editData.category,
      sort_order: editData.sort_order,
    }).eq('id', editing);
    setEditing(null);
    loadServices();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('services').update({ is_active: !current }).eq('id', id);
    loadServices();
  }

  if (loading) return <p className="booking-loading">Laden...</p>;

  return (
    <div>
      <div className="admin-toolbar admin-toolbar-stack">
        <div>
          <h3>Behandlungen verwalten</h3>
          <p className="admin-subtle">
            {filteredServices.length} von {services.length} Behandlungen angezeigt
          </p>
        </div>
      </div>

      <div className="admin-service-controls" aria-label="Behandlungen filtern">
        <label className="admin-control">
          <span>Suche</span>
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Name, Slug, Kategorie oder Preis"
          />
        </label>

        <label className="admin-control">
          <span>Kategorie</span>
          <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
            <option value="all">Alle Kategorien</option>
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <div className="admin-service-status" role="group" aria-label="Status filtern">
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            aria-pressed={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            Alle
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            aria-pressed={statusFilter === 'active'}
            onClick={() => setStatusFilter('active')}
          >
            Aktiv
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
            aria-pressed={statusFilter === 'inactive'}
            onClick={() => setStatusFilter('inactive')}
          >
            Inaktiv
          </button>
        </div>
      </div>

      {filteredServices.length === 0 && (
        <div className="booking-state admin-empty-state" role="status">
          <h3>Keine Behandlung gefunden.</h3>
          <p>Bitte Suche oder Filter zurücksetzen.</p>
          <button
            type="button"
            className="pill-btn pill-btn-outline"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {filteredServices.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kategorie</th>
                <th>Dauer</th>
                <th>Preis</th>
                <th>Anzahlung</th>
                <th>Aktiv</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(s => (
                <tr key={s.id} style={{ opacity: s.is_active ? 1 : 0.5 }}>
                  {editing === s.id ? (
                    <>
                      <td><input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} /></td>
                      <td><input value={editData.category || ''} onChange={e => setEditData({...editData, category: e.target.value})} /></td>
                      <td><input type="number" value={editData.duration_minutes || 0} onChange={e => setEditData({...editData, duration_minutes: +e.target.value})} style={{width:'60px'}} /></td>
                      <td><input type="number" value={editData.price_chf || 0} onChange={e => setEditData({...editData, price_chf: +e.target.value})} style={{width:'80px'}} /></td>
                      <td><input type="number" value={editData.deposit_chf || 0} onChange={e => setEditData({...editData, deposit_chf: +e.target.value})} style={{width:'80px'}} /></td>
                      <td>{s.is_active ? 'Ja' : 'Nein'}</td>
                      <td className="admin-actions">
                        <button onClick={saveEdit}>Speichern</button>
                        <button onClick={() => setEditing(null)}>Abbrechen</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.category}</td>
                      <td>{s.duration_minutes} Min.</td>
                      <td>{formatAdminPrice(s)}</td>
                      <td>CHF {s.deposit_chf}</td>
                      <td>
                        <button
                          onClick={() => toggleActive(s.id, s.is_active)}
                          className="admin-toggle"
                          aria-label={`${s.name} ${s.is_active ? 'deaktivieren' : 'aktivieren'}`}
                        >
                          {s.is_active ? '✓' : '✗'}
                        </button>
                      </td>
                      <td className="admin-actions">
                        <button onClick={() => startEdit(s)}>Bearbeiten</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
