'use client'

import { Tooltip } from './tooltip'
import { HelpCircle } from 'lucide-react'

interface FieldWithTooltipProps {
  label: string
  tooltip: string
  required?: boolean
  children: React.ReactNode
  htmlFor?: string
  className?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

export function FieldWithTooltip({
  label,
  tooltip,
  required = false,
  children,
  htmlFor,
  className = '',
  tooltipPosition = 'right'
}: FieldWithTooltipProps) {
  const labelId = `label-${htmlFor || 'field'}`
  const helpId = `help-${htmlFor || 'field'}`

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label 
          id={labelId}
          htmlFor={htmlFor}
          className="block font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="pole wymagane">*</span>}
        </label>
        
        <Tooltip content={tooltip} position={tooltipPosition}>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full p-0.5"
            aria-label={`Więcej informacji o: ${label}`}
            aria-describedby={helpId}
            tabIndex={0}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      
      <div 
        role="group" 
        aria-labelledby={labelId}
        aria-describedby={helpId}
      >
        {children}
      </div>
      
      {/* Hidden help text for screen readers */}
      <div id={helpId} className="sr-only">
        {tooltip}
      </div>
    </div>
  )
} 