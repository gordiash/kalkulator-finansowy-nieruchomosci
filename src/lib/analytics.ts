// System analytics do śledzenia eventów użytkownika

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

interface ValuationAnalyticsData {
  city?: string
  district?: string
  area?: number
  rooms?: number
  floor?: number
  year?: number
  price?: number
  method?: string
  timestamp?: string
}

/**
 * Wysyła event do Google Analytics 4
 */
export function trackEvent(event: AnalyticsEvent) {
  // Sprawdź czy GA4 jest dostępne
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    })
  }
  
  // Fallback - wyślij do console w development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', event)
  }
}

/**
 * Śledzenie eventów kalkulatora wyceny
 */
export const valuationAnalytics = {
  // Event: Rozpoczęcie wyceny
  trackValuationStarted(data: Partial<ValuationAnalyticsData>) {
    trackEvent({
      action: 'valuation_started',
      category: 'calculator',
      label: 'valuation_calculator',
      custom_parameters: {
        city: data.city,
        area: data.area,
        rooms: data.rooms,
        has_district: !!data.district,
        has_year: !!data.year
      }
    })
  },

  // Event: Formularz wysłany
  trackValuationSubmitted(data: ValuationAnalyticsData) {
    trackEvent({
      action: 'valuation_submitted',
      category: 'calculator',
      label: 'valuation_form_submit',
      custom_parameters: {
        city: data.city,
        district: data.district,
        area: data.area,
        rooms: data.rooms,
        floor: data.floor,
        year: data.year,
        form_completion_time: Date.now() - (data.timestamp ? new Date(data.timestamp).getTime() : Date.now())
      }
    })
  },

  // Event: Wynik otrzymany
  trackValuationResultViewed(data: ValuationAnalyticsData) {
    trackEvent({
      action: 'valuation_result_viewed',
      category: 'calculator',
      label: 'valuation_result',
      value: data.price,
      custom_parameters: {
        city: data.city,
        district: data.district,
        area: data.area,
        rooms: data.rooms,
        price: data.price,
        price_per_sqm: data.area && data.price ? Math.round(data.price / data.area) : undefined,
        method: data.method,
        is_ai_prediction: data.method?.includes('random_forest')
      }
    })
  },

  // Event: Błąd wyceny
  trackValuationError(error: string, data?: Partial<ValuationAnalyticsData>) {
    trackEvent({
      action: 'valuation_error',
      category: 'calculator',
      label: 'valuation_error',
      custom_parameters: {
        error_message: error,
        city: data?.city,
        area: data?.area,
        rooms: data?.rooms
      }
    })
  },

  // Event: Kliknięcie w przycisk akcji
  trackActionButtonClick(buttonType: 'credit' | 'rental' | 'purchase', data: ValuationAnalyticsData) {
    trackEvent({
      action: 'action_button_click',
      category: 'calculator',
      label: `${buttonType}_button`,
      value: data.price,
      custom_parameters: {
        button_type: buttonType,
        source_price: data.price,
        city: data.city,
        area: data.area,
        rooms: data.rooms
      }
    })
  }
}

/**
 * Śledzenie eventów innych kalkulatorów
 */
export const calculatorAnalytics = {
  // Kalkulator zdolności kredytowej
  trackCreditCalculation(data: { amount: number, income: number, result?: number }) {
    trackEvent({
      action: 'credit_calculation',
      category: 'calculator',
      label: 'credit_calculator',
      value: data.amount,
      custom_parameters: {
        loan_amount: data.amount,
        monthly_income: data.income,
        max_loan: data.result
      }
    })
  },

  // Kalkulator wynajmu
  trackRentalCalculation(data: { price: number, rent: number, roi?: number }) {
    trackEvent({
      action: 'rental_calculation',
      category: 'calculator',
      label: 'rental_calculator',
      value: data.price,
      custom_parameters: {
        property_price: data.price,
        monthly_rent: data.rent,
        roi_percentage: data.roi
      }
    })
  },

  // Kalkulator kosztów zakupu
  trackPurchaseCostCalculation(data: { price: number, totalCosts?: number }) {
    trackEvent({
      action: 'purchase_cost_calculation',
      category: 'calculator',
      label: 'purchase_calculator',
      value: data.price,
      custom_parameters: {
        property_price: data.price,
        total_costs: data.totalCosts,
        cost_percentage: data.totalCosts && data.price ? (data.totalCosts / data.price * 100) : undefined
      }
    })
  }
}

/**
 * Śledzenie eventów UX
 */
export const uxAnalytics = {
  // Czas spędzony na stronie
  trackPageTime(page: string, timeInSeconds: number) {
    trackEvent({
      action: 'page_time',
      category: 'engagement',
      label: page,
      value: timeInSeconds,
      custom_parameters: {
        page_name: page,
        time_seconds: timeInSeconds
      }
    })
  },

  // Scroll depth
  trackScrollDepth(page: string, percentage: number) {
    trackEvent({
      action: 'scroll_depth',
      category: 'engagement',
      label: page,
      value: percentage,
      custom_parameters: {
        page_name: page,
        scroll_percentage: percentage
      }
    })
  },

  // Błędy formularza
  trackFormError(formName: string, fieldName: string, errorMessage: string) {
    trackEvent({
      action: 'form_error',
      category: 'form_interaction',
      label: `${formName}_${fieldName}`,
      custom_parameters: {
        form_name: formName,
        field_name: fieldName,
        error_message: errorMessage
      }
    })
  }
}

/**
 * Inicjalizacja Google Analytics 4
 */
export function initializeAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return
  
  // Załaduj gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
  
  // Inicjalizuj gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function(...args: any[]) {
    window.dataLayer?.push(args)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    // Konfiguracja prywatności
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    
    // Enhanced measurements
    enhanced_measurements: {
      scrolls: true,
      outbound_clicks: true,
      site_search: true,
      video_engagement: true,
      file_downloads: true
    }
  })
  
  console.log('📊 Google Analytics 4 initialized:', measurementId)
}

/**
 * Hook do śledzenia czasu na stronie
 */
export function usePageTimeTracking(pageName: string) {
  if (typeof window === 'undefined') return
  
  const startTime = Date.now()
  
  // Śledź czas przy opuszczeniu strony
  const handleBeforeUnload = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    if (timeSpent > 5) { // Tylko jeśli spędził więcej niż 5 sekund
      uxAnalytics.trackPageTime(pageName, timeSpent)
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

/**
 * Hook do śledzenia scroll depth
 */
export function useScrollTracking(pageName: string) {
  if (typeof window === 'undefined') return
  
  let maxScrollPercentage = 0
  const trackedPercentages = new Set<number>()
  
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercentage = Math.round((scrollTop / docHeight) * 100)
    
    if (scrollPercentage > maxScrollPercentage) {
      maxScrollPercentage = scrollPercentage
      
      // Śledź milestone'y: 25%, 50%, 75%, 90%
      const milestones = [25, 50, 75, 90]
      for (const milestone of milestones) {
        if (scrollPercentage >= milestone && !trackedPercentages.has(milestone)) {
          trackedPercentages.add(milestone)
          uxAnalytics.trackScrollDepth(pageName, milestone)
        }
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
} 