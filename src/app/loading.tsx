import React from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConvomateLogo from '@/components/ConvomateLogo'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg w-full">
        <div className="flex justify-center">
          <ConvomateLogo size={200} variant="light" />
        </div>
        
        <LoadingSpinner size="lg" text="Loading..." variant="card" />
      </div>
    </div>
  )
}
