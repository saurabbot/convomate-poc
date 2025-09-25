'use client';

import React from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Globe, BarChart3, MessageSquare, FileText, Video } from 'lucide-react';

const quickActions = [
  {
    title: 'Ingest Site',
    description: 'Extract content from any website',
    icon: Globe,
    href: '/dashboard/ingest_site',
    gradient: 'from-gray-800 to-black'
  },
  {
    title: 'View Analytics',
    description: 'Monitor your content performance',
    icon: BarChart3,
    href: '/dashboard/analytics',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    title: 'Conversations',
    description: 'Review AI conversations',
    icon: MessageSquare,
    href: '/dashboard/conversations',
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    title: 'Content Library',
    description: 'Manage your extracted content',
    icon: FileText,
    href: '/dashboard/content',
    gradient: 'from-gray-900 to-black'
  },
  {
    title: 'Video Calls',
    description: 'Start AI-powered video sessions',
    icon: Video,
    href: '/dashboard/video-calls',
    gradient: 'from-black to-gray-800'
  }
];

export default function Dashboard() {
  const { user } = useUser();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="bg-gray-800/95 border-gray-700/30 shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-green-400" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/95 border-gray-700/30 shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Sites Ingested:</span>
                <span className="text-cyan-400 font-bold text-xl">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Conversations:</span>
                <span className="text-purple-400 font-bold text-xl">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Content Items:</span>
                <span className="text-orange-400 font-bold text-xl">0</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/95 border-gray-700/30 shadow-xl backdrop-blur-xl md:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">No recent activity</div>
                <div className="text-gray-500 text-xs mt-1">Start by ingesting your first site</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.title} className="bg-gray-800/95 border-gray-700/30 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${action.gradient} bg-opacity-20`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                          {action.description}
                        </p>
                        <Button
                          className="w-full bg-white text-black font-semibold hover:bg-gray-100 border border-black transition-all duration-300"
                          onClick={() => window.location.href = action.href}
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
