'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  userId: string;
  setUserId: (value: string) => void;
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
  setUserId,
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
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Paste x-user-id here" />
          </label>
          <p className="hint">Use `/auth/register` or `/auth/login` below to get the current `x-user-id` value for live API calls.</p>
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
