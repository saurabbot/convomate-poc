'use client'

import React from 'react'
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import ConvomateLogo from '@/components/ConvomateLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800/95 border-gray-700/30 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-10 text-center space-y-8">
          <div className="flex justify-center">
            <ConvomateLogo size={200} variant="light" />
          </div>
          
          <div className="space-y-4">
            <div className="text-6xl font-bold text-gray-400">
              404
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Page Not Found
              </h1>
              <p className="text-gray-300 tracking-tight">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button asChild className="bg-gray-600 hover:bg-gray-700 text-white">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="bg-gray-600/80 border-gray-600 text-gray-300 hover:bg-gray-700/90"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
