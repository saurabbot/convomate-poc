'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Globe, 
  Settings, 
  User, 
  BarChart3,
  MessageSquare,
  FileText,
  Video,
  Bug
} from 'lucide-react';
import ConvomateLogo from './ConvomateLogo';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Ingest Site',
    href: '/dashboard/ingest_site',
    icon: Globe,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Conversations',
    href: '/dashboard/conversations',
    icon: MessageSquare,
  },
  {
    name: 'Content',
    href: '/dashboard/content',
    icon: FileText,
  },
  {
    name: 'Video Calls',
    href: '/dashboard/video-calls',
    icon: Video,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    name: 'Debug',
    href: '/dashboard/debug',
    icon: Bug,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  className?: string;
}

export default function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      'flex flex-col h-full bg-gray-800/95 border-r border-gray-700/30 backdrop-blur-xl',
      className
    )}>
      <div className="flex items-center justify-center p-6 border-b border-gray-700/30">
        <ConvomateLogo size={200} variant="light" />
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-green-400/20 to-cyan-400/20 text-white border border-green-400/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 mr-3 transition-colors',
                isActive 
                  ? 'text-green-400' 
                  : 'text-gray-400 group-hover:text-gray-300'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-700/30">
        <div className="text-xs text-gray-400 text-center">
          Convomate v1.0
        </div>
      </div>
    </div>
  );
}
