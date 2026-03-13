'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  userId: string;
  accessToken: string;
  clearAuth: () => void;
  apiBase: string;
  setApiBase: (value: string) => void;
}>;

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/projects', label: 'Projects' },
  { href: '/experiments', label: 'Experiments' },
] as const;

export function AppShell({
  title,
  subtitle,
  userId,
  accessToken,
  clearAuth,
  apiBase,
  setApiBase,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Research Lab Experiment Ops</p>
          <h1 className="brand">LabOps</h1>
          <p className="muted">Reproducibility, run governance, and experiment operations in one place.</p>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="session-card">
          <label>
            API Base
            <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} placeholder="http://localhost:3001/v1" />
          </label>
          <label>
            Active User ID
            <input value={userId} readOnly placeholder="Authenticate to load user context" />
          </label>
          <label>
            Access Token
            <input value={accessToken ? 'Bearer token loaded' : ''} readOnly placeholder="Authenticate to store a bearer token" />
          </label>
          <button className="secondary-button" type="button" onClick={clearAuth}>
            Sign out locally
          </button>
          <p className="hint">The shell now uses bearer auth for live API calls. The legacy x-user-id transport is only a fallback.</p>
        </div>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Live Workspace View</p>
            <h2>{title}</h2>
            <p className="muted">{subtitle}</p>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
