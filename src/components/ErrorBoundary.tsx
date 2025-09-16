'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-gray-800/95 border-gray-700/30 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Something went wrong
                </h1>
                <p className="text-gray-300">
                  We encountered an unexpected error. Please try refreshing the page or go back to the home page.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left bg-black/20 p-4 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
                  <pre>{this.state.error.message}</pre>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
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

    return this.props.children
  }
}

export default ErrorBoundary
