import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export function AvailabilityEditor() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAvailability(); }, []);

  async function loadAvailability() {
    setLoading(true);
    const { data } = await supabase.from('availability').select('*').order('day_of_week');
    setAvailability((data as Availability[]) || []);
    setLoading(false);
  }

  async function updateField(id: string, field: string, value: string | boolean) {
    await supabase.from('availability').update({ [field]: value }).eq('id', id);
    loadAvailability();
  }

  if (loading) return <p className="booking-loading">Laden...</p>;

  return (
    <div>
      <h3>Öffnungszeiten</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Von</th>
              <th>Bis</th>
              <th>Aktiv</th>
            </tr>
          </thead>
          <tbody>
            {availability.map(a => (
              <tr key={a.id} style={{ opacity: a.is_active ? 1 : 0.5 }}>
                <td><strong>{DAY_NAMES[a.day_of_week]}</strong></td>
                <td>
                  <input
                    type="time"
                    value={a.start_time}
                    onChange={e => updateField(a.id, 'start_time', e.target.value)}
                    disabled={!a.is_active}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={a.end_time}
                    onChange={e => updateField(a.id, 'end_time', e.target.value)}
                    disabled={!a.is_active}
                  />
                </td>
                <td>
                  <button onClick={() => updateField(a.id, 'is_active', !a.is_active)} className="admin-toggle">
                    {a.is_active ? '✓ Offen' : '✗ Geschlossen'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
