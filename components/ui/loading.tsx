"use client"

import { Globe, Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  subText?: string
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Loading...", 
  subText 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin`}></div>
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin`}></div>
        <Globe className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${iconSizes[size]} text-blue-600 dark:text-blue-400`} />
      </div>
      
      <div className="text-center">
        <h3 className={`font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent ${textSizes[size]} mb-1`}>
          {text}
        </h3>
        {subText && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {subText}
          </p>
        )}
      </div>
    </div>
  )
}

interface FullPageLoadingProps {
  text?: string
  subText?: string
}

export function FullPageLoading({ 
  text = "Loading...", 
  subText = "Please wait while we prepare your content" 
}: FullPageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <LoadingSpinner size="lg" text={text} subText={subText} />
    </div>
  )
}
