"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading your content.", 
  onRetry,
  showRetry = true 
}: ErrorStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl text-center animate-scale-in">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-xl text-gray-900 dark:text-white">{title}</CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            {message}
          </CardDescription>
        </CardHeader>
        {showRetry && onRetry && (
          <CardContent>
            <Button 
              onClick={onRetry}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ 
  title = "No data found", 
  message = "It looks like there's nothing here yet.", 
  action,
  icon
}: EmptyStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl text-center animate-scale-in">
        <CardHeader className="pb-4">
          {icon && (
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                {icon}
              </div>
            </div>
          )}
          <CardTitle className="text-xl text-gray-900 dark:text-white">{title}</CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            {message}
          </CardDescription>
        </CardHeader>
        {action && (
          <CardContent>
            <Button 
              onClick={action.onClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {action.label}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
