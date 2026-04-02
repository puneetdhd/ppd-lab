import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout: React.FC = () => (
  <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  </div>
);
