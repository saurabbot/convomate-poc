'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800/95 border-gray-700/30 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          
          <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Something went wrong!
              </h1>
              <p className="text-gray-300 tracking-tight">
                We encountered an unexpected error. Please try again or go back to the home page.
              </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-left bg-black/20 p-4 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
              <pre>{error.message}</pre>
              {error.digest && <p className="mt-2 text-xs">Error ID: {error.digest}</p>}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={reset}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="bg-gray-600/80 border-gray-600 text-gray-300 hover:bg-gray-700/90"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
