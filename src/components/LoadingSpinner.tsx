'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  variant?: 'default' | 'card'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${variant === 'card' ? '' : className}`}>
      <Loader2 className={`animate-spin text-gray-400 ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card className={`bg-gray-800/95 border-gray-700/30 shadow-xl backdrop-blur-xl ${className}`}>
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    )
  }

  return content
}

export default LoadingSpinner
