import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  end_time: string;
  status: string;
  deposit_paid: boolean;
  deposit_amount: number;
  notes: string | null;
  created_at: string;
  services: { name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  cancelled: 'Storniert',
  completed: 'Abgeschlossen',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#CFA65E',
  confirmed: '#27ae60',
  cancelled: '#c0392b',
  completed: '#7f8c8d',
};

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => { loadBookings(); }, [filter]);

  async function loadBookings() {
    setLoading(true);
    let query = supabase
      .from('bookings')
      .select('*, services(name)')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (filter === 'upcoming') {
      query = query
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .in('status', ['pending', 'confirmed']);
    }

    const { data } = await query;
    setBookings((data as unknown as Booking[]) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    loadBookings();
  }

  async function handleRefund(bookingId: string) {
    if (!confirm('Anzahlung wirklich erstatten?')) return;
    await fetch('/api/refund-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    loadBookings();
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Buchungen</h3>
        <div className="admin-filters">
          <button className={`admin-filter-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Kommende</button>
          <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Alle</button>
        </div>
      </div>

      {loading ? (
        <p className="booking-loading">Laden...</p>
      ) : bookings.length === 0 ? (
        <p className="booking-empty">Keine Buchungen gefunden.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Zeit</th>
                <th>Kundin</th>
                <th>Behandlung</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.booking_date}</td>
                  <td>{b.booking_time}–{b.end_time}</td>
                  <td>
                    <strong>{b.customer_name}</strong><br />
                    <small>{b.customer_phone}</small>
                  </td>
                  <td>{b.services?.name || '–'}</td>
                  <td>
                    <span className="admin-status" style={{ background: STATUS_COLORS[b.status] || '#999' }}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </td>
                  <td className="admin-actions">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'confirmed')}>Bestätigen</button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')}>Stornieren</button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'completed')}>Abschliessen</button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')}>Stornieren</button>
                      </>
                    )}
                    {b.status === 'cancelled' && b.deposit_paid && (
                      <button onClick={() => handleRefund(b.id)}>Erstatten</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
