"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  delay?: number
}

export function Tooltip({
  children,
  content,
  position = 'top',
  className = '',
  delay = 100
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [effectivePosition, setEffectivePosition] = useState(position)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 11)}`

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      calculatePosition()
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const scrollY = 0 // fixed positioning uses viewport coords
    const scrollX = 0
    
    // Pobierz rozmiary tooltip (szacunkowe jeśli nie ma elementu)
    const tooltipWidth = tooltipRef.current?.offsetWidth || 200
    const tooltipHeight = tooltipRef.current?.offsetHeight || 40
    
    // Margines od krawędzi ekranu
    const margin = 10
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Sprawdź czy element jest blisko dolnej krawędzi ekranu
    const spaceBelow = viewportHeight - (triggerRect.bottom - scrollY)
    const spaceAbove = triggerRect.top - scrollY
    const spaceRight = viewportWidth - triggerRect.right
    const spaceLeft = triggerRect.left

    let effectivePosition = position
    
    // Automatycznie zmień pozycję jeśli nie ma miejsca
    if (position === 'right' && spaceRight < tooltipWidth + margin) {
      if (spaceLeft > tooltipWidth + margin) {
        effectivePosition = 'left'
      } else if (spaceAbove > tooltipHeight + margin) {
        effectivePosition = 'top'
      } else {
        effectivePosition = 'bottom'
      }
    }
    
    if (position === 'left' && spaceLeft < tooltipWidth + margin) {
      if (spaceRight > tooltipWidth + margin) {
        effectivePosition = 'right'
      } else if (spaceAbove > tooltipHeight + margin) {
        effectivePosition = 'top'
      } else {
        effectivePosition = 'bottom'
      }
    }
    
    if (position === 'bottom' && spaceBelow < tooltipHeight + margin) {
      effectivePosition = 'top'
    }
    
    if (position === 'top' && spaceAbove < tooltipHeight + margin) {
      effectivePosition = 'bottom'
    }

    let x = 0
    let y = 0

    switch (effectivePosition) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.top - 8
        
        // Sprawdź czy mieści się w oknie - poziomo
        if (x - tooltipWidth / 2 < margin) {
          x = margin + tooltipWidth / 2
        } else if (x + tooltipWidth / 2 > viewportWidth - margin) {
          x = viewportWidth - margin - tooltipWidth / 2
        }
        break
        
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.bottom + 8
        
        // Sprawdź czy mieści się w oknie - poziomo
        if (x - tooltipWidth / 2 < margin) {
          x = margin + tooltipWidth / 2
        } else if (x + tooltipWidth / 2 > viewportWidth - margin) {
          x = viewportWidth - margin - tooltipWidth / 2
        }
        break
        
      case 'left':
        x = triggerRect.left - 8
        y = triggerRect.top + scrollY + triggerRect.height / 2
        
        // Sprawdź czy mieści się w oknie - pionowo
        if (y - tooltipHeight / 2 < margin) {
          y = margin + tooltipHeight / 2
        } else if (y + tooltipHeight / 2 > viewportHeight - margin) {
          y = viewportHeight - margin - tooltipHeight / 2
        }
        break
        
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + scrollY + triggerRect.height / 2
        
        // Sprawdź czy mieści się w oknie - pionowo
        if (y - tooltipHeight / 2 < margin) {
          y = margin + tooltipHeight / 2
        } else if (y + tooltipHeight / 2 > viewportHeight - margin) {
          y = viewportHeight - margin - tooltipHeight / 2
        }
        break
    }

    setTooltipPosition({ x, y })
    
    // Zapisz efektywną pozycję do użycia przy renderowaniu strzałki
    setEffectivePosition(effectivePosition)
  }, [position])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip()
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        calculatePosition()
      }
    }
    
    const handleScroll = () => {
      if (isVisible) {
        calculatePosition()
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isVisible, calculatePosition])

  // Aktualizuj efektywną pozycję gdy pozycja początkowa się zmieni
  useEffect(() => {
    setEffectivePosition(position)
  }, [position])

  const tooltipElement = isVisible ? (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
              className={`
          fixed z-50 px-4 py-3 text-sm text-white bg-gray-800 rounded-lg shadow-xl max-w-sm
          pointer-events-none transform transition-all duration-200 opacity-100
          border border-gray-700 backdrop-blur-sm
          ${effectivePosition === 'top' ? '-translate-x-1/2 -translate-y-full' : ''}
          ${effectivePosition === 'bottom' ? '-translate-x-1/2' : ''}
          ${effectivePosition === 'left' ? '-translate-x-full -translate-y-1/2' : ''}
          ${effectivePosition === 'right' ? '-translate-y-1/2' : ''}
          font-medium leading-relaxed
          ${className}
        `}
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
      }}
    >
      {content}
      {/* Arrow */}
      <div
        className={`
          absolute w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45
          ${effectivePosition === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
          ${effectivePosition === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
          ${effectivePosition === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' : ''}
          ${effectivePosition === 'right' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        `}
      />
    </div>
  ) : null

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? tooltipId : undefined}
        className="inline-block cursor-help"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && tooltipElement &&
        createPortal(tooltipElement, document.body)
      }
    </>
  )
}

// Dodatkowe komponenty dla zgodności z Radix UI
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children, asChild, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  if (asChild) {
    return <>{children}</>
  }
  return <div {...props}>{children}</div>
}

export function TooltipContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

// Komponent wrapper dla kompatybilności
export function TooltipWrapper({ 
  children, 
  content, 
  ...props 
}: { 
  children: React.ReactNode; 
  content: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  )
} 