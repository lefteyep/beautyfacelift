import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LoginForm } from './LoginForm';
import { BookingsList } from './BookingsList';
import { ServiceManager } from './ServiceManager';
import { AvailabilityEditor } from './AvailabilityEditor';
import { BlockedDatesManager } from './BlockedDatesManager';
import { CustomerExport } from './CustomerExport';

type Tab = 'bookings' | 'services' | 'availability' | 'blocked' | 'customers';

const TABS: { key: Tab; label: string }[] = [
  { key: 'bookings', label: 'Buchungen' },
  { key: 'services', label: 'Behandlungen' },
  { key: 'availability', label: 'Öffnungszeiten' },
  { key: 'blocked', label: 'Blockierte Tage' },
  { key: 'customers', label: 'Kunden' },
];

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    return (TABS.find(t => t.key === hash)?.key || 'bookings') as Tab;
  });

  useEffect(() => {
    verifyAdminSession(false);
  }, []);

  async function verifyAdminSession(showUnauthorizedMessage = true) {
    setChecking(true);
    setAuthError('');

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setAuthenticated(false);
      setChecking(false);
      return;
    }

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.session.user.id)
      .maybeSingle();

    if (error || !adminUser) {
      await supabase.auth.signOut();
      setAuthenticated(false);
      if (showUnauthorizedMessage) {
        setAuthError('Dieses Konto ist nicht für den Adminbereich freigeschaltet.');
      }
      setChecking(false);
      return;
    }

    setAuthenticated(true);
    setChecking(false);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    window.location.hash = tab;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthenticated(false);
  }

  if (checking) {
    return <div className="booking-loading">Laden...</div>;
  }

  if (!authenticated) {
    return (
      <>
        {authError && <div className="booking-error-banner">{authError}</div>}
        <LoginForm onLogin={() => verifyAdminSession(true)} />
      </>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="admin-logout">Abmelden</button>
      </div>

      <nav className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="admin-content">
        {activeTab === 'bookings' && <BookingsList />}
        {activeTab === 'services' && <ServiceManager />}
        {activeTab === 'availability' && <AvailabilityEditor />}
        {activeTab === 'blocked' && <BlockedDatesManager />}
        {activeTab === 'customers' && <CustomerExport />}
      </div>
    </div>
  );
}
