'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ConvomateLogo from '@/components/ConvomateLogo'
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Phone, Settings } from 'lucide-react'

export default function AgentRoom() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus('Connected to AI Agent')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const toggleVideo = () => setIsVideoEnabled(prev => !prev)
  const toggleAudio = () => setIsAudioEnabled(prev => !prev)
  
  const endCall = () => {
    router.push('/')
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="p-4 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex items-center gap-3">
          <ConvomateLogo size={220} variant="light" />
          {/* <div className="text-white">
            <div className="text-sm opacity-80">Room ID: {roomId}</div>
            <div className={`text-xs ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {connectionStatus}
            </div>
          </div> */}
        </div>

        <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 relative bg-gray-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            {isVideoEnabled ? (
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-4xl font-bold">AI</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">Convomate AI Agent</h3>
                <p className="text-gray-300 tracking-tight">Ready to help with your content</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <VideoOff className="w-16 h-16 mx-auto mb-4" />
                <p>Video is disabled</p>
              </div>
            )}
          </div>

          {isConnected && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm">
              ● Live
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 bg-gray-800/50 rounded-lg backdrop-blur-sm p-4">
          <h3 className="text-white text-lg font-semibold mb-4 tracking-tight">Chat</h3>
          
          <div className="h-64 lg:h-96 bg-gray-900/50 rounded-lg p-4 mb-4 overflow-y-auto">
            <div className="space-y-3">
              {isConnected ? (
                <div className="text-sm text-gray-300">
                  <div className="bg-purple-600/20 p-3 rounded-lg">
                    <strong className="text-purple-300">AI Agent:</strong> Hello! I&apos;m ready to help you analyze the content from the URL you processed. What would you like to know?
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm">
                  Waiting for connection...
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
              disabled={!isConnected}
            />
            <button
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={!isConnected}
            >
              Send
            </button>
          </div>
        </div>
      </main>

      <footer className="p-4 bg-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Phone className="w-5 h-5 transform rotate-135" />
          </button>
        </div>
      </footer>
    </div>
  )
}
