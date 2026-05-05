import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  onLogin: () => void | Promise<void>;
}

export function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Ungültige Anmeldedaten.');
      setLoading(false);
    } else {
      await onLogin();
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="booking-field">
          <label htmlFor="admin-email">E-Mail</label>
          <input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="booking-field">
          <label htmlFor="admin-pass">Passwort</label>
          <input id="admin-pass" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <div className="booking-error-banner">{error}</div>}
        <button type="submit" className="pill-btn booking-submit" disabled={loading}>
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
