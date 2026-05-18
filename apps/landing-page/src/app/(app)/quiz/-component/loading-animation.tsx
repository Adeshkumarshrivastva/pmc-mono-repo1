'use client'

import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'

export default function LoadingAnimation() {
  const [isOn, setIsOn] = useState(true)

  useEffect(() => {
    // Blink every 500ms (0.5 seconds)
    const interval = setInterval(() => {
      setIsOn((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Blinking Bulb */}
        <div className="flex justify-center">
          <div
            className={`transition-all duration-300 ${
              isOn
                ? 'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]'
                : 'text-gray-400 drop-shadow-none'
            }`}
          >
            <Lightbulb className="w-24 h-24" fill={isOn ? 'currentColor' : 'none'} />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Analyzing Your Responses</h2>
          <p className="text-muted-foreground">Please wait while we prepare your personalized report...</p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2">
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        {/* Progress Bar with CSS animation */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{
                animation: 'progressBar 3.5s ease-in-out forwards',
              }}
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progressBar {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `
      }} />
    </div>
  )
}
