"use client"

import { useState, useRef, useEffect } from 'react'
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
  delay = 500
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 11)}`

  const showTooltip = () => {
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

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    let x = 0
    let y = 0

    switch (position) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.top + scrollY - 8
        break
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.bottom + scrollY + 8
        break
      case 'left':
        x = triggerRect.left + scrollX - 8
        y = triggerRect.top + scrollY + triggerRect.height / 2
        break
      case 'right':
        x = triggerRect.right + scrollX + 8
        y = triggerRect.top + scrollY + triggerRect.height / 2
        break
    }

    setTooltipPosition({ x, y })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip()
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const tooltipElement = isVisible ? (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className={`
        fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg max-w-xs
        pointer-events-none transform transition-opacity duration-200
        ${position === 'top' ? '-translate-x-1/2 -translate-y-full' : ''}
        ${position === 'bottom' ? '-translate-x-1/2' : ''}
        ${position === 'left' ? '-translate-x-full -translate-y-1/2' : ''}
        ${position === 'right' ? '-translate-y-1/2' : ''}
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
          absolute w-2 h-2 bg-gray-900 transform rotate-45
          ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
          ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
          ${position === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' : ''}
          ${position === 'right' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
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
        className="inline-block"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && tooltipElement &&
        createPortal(tooltipElement, document.body)
      }
    </>
  )
} 