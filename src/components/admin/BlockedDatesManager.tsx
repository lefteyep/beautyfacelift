import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

export function BlockedDatesManager() {
  const [dates, setDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => { loadDates(); }, []);

  async function loadDates() {
    setLoading(true);
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date');
    setDates((data as BlockedDate[]) || []);
    setLoading(false);
  }

  async function addDate() {
    if (!newDate) return;
    await supabase.from('blocked_dates').insert({ date: newDate, reason: newReason || null });
    setNewDate('');
    setNewReason('');
    loadDates();
  }

  async function removeDate(id: string) {
    await supabase.from('blocked_dates').delete().eq('id', id);
    loadDates();
  }

  if (loading) return <p className="booking-loading">Laden...</p>;

  return (
    <div>
      <h3>Blockierte Tage</h3>

      <div className="admin-add-row">
        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        <input type="text" value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Grund (optional)" />
        <button onClick={addDate} className="pill-btn" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>Hinzufügen</button>
      </div>

      {dates.length === 0 ? (
        <p className="booking-empty">Keine blockierten Tage.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Datum</th><th>Grund</th><th>Aktion</th></tr>
            </thead>
            <tbody>
              {dates.map(d => (
                <tr key={d.id}>
                  <td>{d.date}</td>
                  <td>{d.reason || '–'}</td>
                  <td><button onClick={() => removeDate(d.id)} className="admin-actions">Entfernen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
