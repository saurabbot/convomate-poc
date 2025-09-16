'use client';

import React from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardSidebar from './DashboardSidebar';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Loading dashboard..." variant="card" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <DashboardSidebar />
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800/95 border-b border-gray-700/30 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-gray-300">
                Ready to start your AI-powered conversations?
              </p>
            </div>
          </div>
          
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-600/90"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        <main className="flex-1 p-6 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
