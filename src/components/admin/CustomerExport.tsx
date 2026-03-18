import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function CustomerExport() {
  const [exporting, setExporting] = useState(false);

  async function exportCSV() {
    setExporting(true);

    const { data } = await supabase
      .from('bookings')
      .select('customer_name, customer_email, customer_phone, booking_date, services(name)')
      .order('customer_email');

    if (!data || data.length === 0) {
      alert('Keine Kundendaten gefunden.');
      setExporting(false);
      return;
    }

    // Deduplicate by email
    const seen = new Set<string>();
    const unique = data.filter(row => {
      const email = row.customer_email.toLowerCase();
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

    const csv = [
      'Name,E-Mail,Telefon,Letzte Buchung,Letzte Behandlung',
      ...unique.map(row =>
        `"${row.customer_name}","${row.customer_email}","${row.customer_phone}","${row.booking_date}","${(row.services as any)?.name || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beauty-face-lift-kunden-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <div>
      <h3>Kundenliste exportieren</h3>
      <p style={{ maxWidth: 'none', marginBottom: '1.5rem' }}>
        Exportieren Sie die Kundenliste als CSV-Datei für Meta Custom Audiences oder Google Customer Match.
      </p>
      <button onClick={exportCSV} disabled={exporting} className="pill-btn pill-btn-outline">
        {exporting ? 'Exportiert...' : 'CSV herunterladen'}
      </button>
    </div>
  );
}
