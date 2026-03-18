import { useState, useEffect } from 'react';
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

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Service>>({});

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
      <h3>Behandlungen verwalten</h3>
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
            {services.map(s => (
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
                    <td>CHF {s.price_chf}</td>
                    <td>CHF {s.deposit_chf}</td>
                    <td>
                      <button onClick={() => toggleActive(s.id, s.is_active)} className="admin-toggle">
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
    </div>
  );
}
