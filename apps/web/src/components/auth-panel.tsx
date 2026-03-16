'use client';

import { FormEvent, useState } from 'react';
import { loginUser, registerUser } from '../lib/api';

type AuthPanelProps = {
  apiBase: string;
  onAuthenticated: (payload: { userId: string; accessToken: string }) => void;
};

export function AuthPanel({ apiBase, onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');

    try {
      const result = mode === 'register'
        ? await registerUser({ email, name, password }, apiBase)
        : await loginUser({ email, password }, apiBase);

      onAuthenticated({
        userId: result.user.id,
        accessToken: result.accessToken,
      });
      setMessage(`${result.message}. Bearer token loaded into the shell.`);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication request failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h3>Connect a live user</h3>
        </div>
        <div className="toggle-row">
          <button className={mode === 'register' ? 'toggle active' : 'toggle'} onClick={() => setMode('register')} type="button">
            Register
          </button>
          <button className={mode === 'login' ? 'toggle active' : 'toggle'} onClick={() => setMode('login')} type="button">
            Login
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        {mode === 'register' ? (
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        ) : null}
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? 'Submitting...' : mode === 'register' ? 'Create user' : 'Sign in'}
        </button>
      </form>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}
