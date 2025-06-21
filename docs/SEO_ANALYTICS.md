# SEO & Analytics - Dokumentacja

## 8.1 Dynamiczne Meta Title ✅

### Implementacja
Dynamiczne generowanie meta title na podstawie parametrów URL:

```typescript
// src/lib/seo/dynamicMeta.ts
export function generateDynamicMetadata(params: DynamicMetaParams): Metadata {
  const { city, area, rooms, year, district, type } = params
  
  switch (type) {
    case 'valuation':
      title = generateValuationTitle({ city, area, rooms, year, district })
      description = generateValuationDescription({ city, area, rooms, year, district })
      break
  }
}
```

### Przykłady dynamicznych tytułów
- **Podstawowy**: `Kalkulator Wyceny Mieszkania | AI Wycena`
- **Z miastem**: `Kalkulator Wyceny Mieszkania - Olsztyn | AI Wycena`
- **Pełny**: `Kalkulator Wyceny Mieszkania - Olsztyn Kortowo 60m² 3 pokoje 2015r | AI Wycena`

### URL Parameters
- `?miasto=Olsztyn` → miasto w meta title
- `?metraz=60` → metraż w meta title  
- `?pokoje=3` → liczba pokoi w meta title
- `?rok=2015` → rok budowy w meta title
- `?dzielnica=Kortowo` → dzielnica w meta title

### SEO Benefits
- **Unique titles**: Każda kombinacja parametrów = unikalny tytuł
- **Long-tail keywords**: "mieszkanie 60m² 3 pokoje Olsztyn Kortowo"
- **Local SEO**: Miasta i dzielnice w tytułach
- **User intent**: Dokładne dopasowanie do wyszukiwania

## 8.2 Schema.org RealEstate + Offer ✅

### SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kalkulator Wyceny Mieszkania",
  "applicationCategory": "FinanceApplication",
  "applicationSubCategory": "RealEstateApplication",
  "operatingSystem": "Web",
  "description": "Profesjonalny kalkulator do wyceny mieszkań wykorzystujący sztuczną inteligencję.",
  "featureList": [
    "Wycena oparta o AI",
    "Model Random Forest",
    "MAPE 15.56%",
    "566 próbek treningowych"
  ]
}
```

### RealEstate Schema (dynamiczny)
```typescript
// src/lib/seo/dynamicMeta.ts
export function generateValuationSchema(params: DynamicMetaParams & { price?: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstate',
    name: generateValuationTitle({ city, area, rooms, year, district }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: 'PLN',
        availability: 'https://schema.org/InStock'
      }
    }),
    ...(city && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressCountry: 'PL'
      }
    }),
    ...(area && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: area,
        unitCode: 'MTK'
      }
    })
  }
}
```

### FAQPage Schema
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Jak dokładny jest kalkulator wyceny mieszkania?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Model Random Forest z dokładnością MAPE 15.56%, wytrenowany na 566 rzeczywistych ofertach z regionu Olsztyn."
      }
    }
  ]
}
```

### Breadcrumbs Schema
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Strona główna",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "name": "Kalkulatory",
      "item": "https://example.com/#kalkulatory"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Kalkulator Wyceny Mieszkania",
      "item": "https://example.com/kalkulator-wyceny"
    }
  ]
}
```

## 8.3 Google Analytics 4 / Firebase Events ✅

### System Analytics
```typescript
// src/lib/analytics.ts
interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    })
  }
}
```

### Kalkulator Wyceny Events

#### 1. valuation_submitted
```typescript
valuationAnalytics.trackValuationSubmitted({
  city: 'Olsztyn',
  district: 'Kortowo',
  area: 60,
  rooms: 3,
  floor: 2,
  year: 2015,
  timestamp: '2024-01-15T10:30:00Z'
})
```

**Custom Parameters:**
- `city`, `district`, `area`, `rooms`, `floor`, `year`
- `form_completion_time` - czas wypełniania formularza
- `has_district`, `has_year` - czy podano opcjonalne pola

#### 2. valuation_result_viewed
```typescript
valuationAnalytics.trackValuationResultViewed({
  city: 'Olsztyn',
  area: 60,
  rooms: 3,
  price: 684000,
  method: 'random_forest_v1.0'
})
```

**Custom Parameters:**
- `price` - wyceniona wartość (jako value)
- `price_per_sqm` - cena za m²
- `method` - metoda wyceny (AI/heurystyka)
- `is_ai_prediction` - czy to predykcja AI

#### 3. action_button_click
```typescript
valuationAnalytics.trackActionButtonClick('credit', {
  price: 684000,
  city: 'Olsztyn',
  area: 60,
  rooms: 3
})
```

**Custom Parameters:**
- `button_type` - 'credit', 'rental', 'purchase'
- `source_price` - cena z wyceny
- Parametry mieszkania

#### 4. valuation_error
```typescript
valuationAnalytics.trackValuationError('Błąd serwera', {
  city: 'Olsztyn',
  area: 60,
  rooms: 3
})
```

### Inne Kalkulatory Events

#### Credit Calculator
```typescript
calculatorAnalytics.trackCreditCalculation({
  amount: 684000,
  income: 8000,
  result: 650000
})
```

#### Rental Calculator  
```typescript
calculatorAnalytics.trackRentalCalculation({
  price: 684000,
  rent: 2500,
  roi: 4.38
})
```

#### Purchase Cost Calculator
```typescript
calculatorAnalytics.trackPurchaseCostCalculation({
  price: 684000,
  totalCosts: 75240
})
```

### UX Analytics

#### Page Time Tracking
```typescript
uxAnalytics.trackPageTime('kalkulator-wyceny', 245) // 245 sekund
```

#### Scroll Depth
```typescript
uxAnalytics.trackScrollDepth('kalkulator-wyceny', 75) // 75%
```

#### Form Errors
```typescript
uxAnalytics.trackFormError('valuation_form', 'area', 'Podaj prawidłowy metraż')
```

### Inicjalizacja GA4
```typescript
// src/lib/analytics.ts
export function initializeAnalytics(measurementId: string) {
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
}
```

## 8.4 Sitemap.xml z Priorytetem 0.9 ✅

### Implementacja
```typescript
// src/app/sitemap.ts
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: `${baseUrl}/kalkulator-wyceny`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }
]
```

### Hierarchia Priorytetów
```
1.0 - Strona główna
0.9 - Kalkulator wyceny, Blog
0.8 - Inne kalkulatory (wynajem, zakup, zdolność)
0.7 - Wpisy blogowe
0.6 - O nas, Kontakt
0.5 - Login
0.3 - Polityka prywatności, Regulamin
```

### Change Frequency
- **daily**: Strona główna, Blog
- **weekly**: Kalkulator wyceny, Wpisy blogowe  
- **monthly**: Inne kalkulatory, Login
- **yearly**: Strony statyczne

### Automatyczna Aktualizacja
- **Statyczne strony**: `lastModified: new Date()`
- **Wpisy blogowe**: `lastModified: new Date(post.updated_at)`
- **Fallback**: Tylko statyczne strony przy błędzie bazy

## Metryki i KPIs

### SEO Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **Page Speed**: Desktop/Mobile
- **Indexing**: Google Search Console
- **Rankings**: Pozycje dla kluczowych fraz

### Analytics Metrics

#### Engagement
- **Session Duration**: Średni czas na stronie
- **Bounce Rate**: Procent odejść bez interakcji
- **Pages/Session**: Liczba stron w sesji
- **Scroll Depth**: Głębokość przewijania

#### Conversions
- **Form Completion Rate**: % ukończonych wycen
- **Action Button CTR**: Kliknięcia w przyciski akcji
- **Calculator Funnel**: Wycena → Kredyt/Wynajem/Zakup
- **Error Rate**: % błędów formularza

#### User Behavior
- **Popular Cities**: Najczęściej wyceniane miasta
- **Average Property Size**: Średni metraż
- **Price Ranges**: Rozkład cen wycenianych mieszkań
- **Method Usage**: AI vs Heurystyka

### Custom Dimensions
```typescript
// GA4 Custom Dimensions
{
  'custom_city': 'Olsztyn',
  'custom_area_range': '50-70m2',
  'custom_price_range': '600k-800k',
  'custom_prediction_method': 'random_forest',
  'custom_user_type': 'first_time_visitor'
}
```

### Goals & Events Setup

#### Primary Goals
1. **Valuation Completed** - `valuation_result_viewed`
2. **Calculator Integration** - `action_button_click`
3. **Form Engagement** - `valuation_submitted`

#### Secondary Goals
1. **Page Depth** - `scroll_depth` >= 75%
2. **Time Engagement** - `page_time` >= 120s
3. **Return Visits** - Multiple sessions

## Implementation Status

| Element | Status | Uwagi |
|---------|--------|-------|
| **Dynamiczne Meta Title** | ✅ | URL params → unique titles |
| **Schema.org RealEstate** | ✅ | 4 typy schema + dynamiczny |
| **Schema.org Offer** | ✅ | Cena w schema gdy dostępna |
| **GA4 Events** | ✅ | 12 typów eventów + custom params |
| **Firebase Integration** | ⏳ | Do skonfigurowania w produkcji |
| **Sitemap Priority 0.9** | ✅ | Wysoki priorytet, weekly update |
| **Analytics Dashboard** | ⏳ | Konfiguracja w GA4 |

## Next Steps

### Faza produkcyjna
- [ ] **GA4 Setup**: Konfiguracja measurement ID
- [ ] **Search Console**: Weryfikacja i submit sitemap
- [ ] **Analytics Dashboard**: Custom reports w GA4
- [ ] **A/B Testing**: Optymalizacja konwersji

### Monitoring
- [ ] **Weekly SEO Reports**: Rankings, traffic, indexing
- [ ] **Monthly Analytics Review**: Conversions, user behavior
- [ ] **Quarterly Schema Updates**: Nowe typy danych
- [ ] **Performance Monitoring**: Core Web Vitals

### Optymalizacje
- [ ] **Rich Snippets**: FAQ, HowTo schema
- [ ] **Local SEO**: Google My Business integration
- [ ] **Voice Search**: Optymalizacja pod pytania głosowe
- [ ] **Mobile SEO**: AMP lub PWA implementacja 