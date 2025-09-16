'use client'

import React from 'react'

interface ConvomateLogoProps {
  size?: number
  variant?: 'light' | 'dark'
  className?: string
}

const ConvomateLogo: React.FC<ConvomateLogoProps> = ({ 
  size = 200, 
  variant = 'light',
  className = ''
}) => {
  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size * 0.1}px`,
    display: 'inline-block'
  }

  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.currentTarget
    target.style.transform = 'scale(1.05)'
  }

  const handleMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.currentTarget
    target.style.transform = 'scale(1)'
  }

  return (
    <div style={containerStyle} className={className}>
      <svg 
        width={size} 
        height={size * 0.4} 
        viewBox="0 0 320 128" 
        xmlns="http://www.w3.org/2000/svg"
        className={`logo ${variant} transition-all duration-300 ease-in-out`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#e0e0e0', stopOpacity:1}} />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        <g className="icon animate-float">
          <path 
            d="M 8 20 Q 8 12 16 12 L 40 12 Q 48 12 48 20 L 48 32 Q 48 40 40 40 L 20 40 L 12 46 L 16 40 Q 8 40 8 32 Z" 
            fill="url(#textGradient)" 
            filter="url(#shadow)"
          />
          <path 
            d="M 28 32 Q 28 26 34 26 L 54 26 Q 60 26 60 32 L 60 42 Q 60 48 54 48 L 38 48 L 32 52 L 36 48 Q 28 48 28 42 Z" 
            fill="#cccccc" 
            opacity="0.8"
          />
          <circle cx="20" cy="26" r="2" fill="#333333"/>
          <circle cx="28" cy="26" r="2" fill="#333333"/>
          <circle cx="36" cy="26" r="2" fill="#333333"/>
        </g>
        
        <g className="text">
          <text 
            x="75" 
            y="32" 
            className="logo-text main font-bold tracking-tight text-2xl"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fill: 'url(#textGradient)',
              filter: 'url(#shadow)'
            }}
          >
            Convo
          </text>
          <text 
            x="75" 
            y="52" 
            className="logo-text accent font-normal tracking-tight text-xl"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fill: '#cccccc'
            }}
          >
            mate
          </text>
        </g>
        
        <line x1="75" y1="58" x2="240" y2="58" stroke="url(#textGradient)" strokeWidth="2" opacity="0.6"/>
      </svg>
    </div>
  )
}

export default ConvomateLogo
