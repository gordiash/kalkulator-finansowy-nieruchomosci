# UX / UI / Accessibility - Dokumentacja

## 7.1 Design System ✅

### Wykorzystane komponenty UI
- **Input** - pola tekstowe z walidacją
- **Autocomplete** - inteligentne autouzupełnianie z nawigacją klawiaturą
- **Button** - przyciski z focus states
- **Tooltip** - wyjaśnienia pojęć z ARIA support
- **FieldWithTooltip** - pola z etykietami i pomocą kontekstową

### Kolory i kontrast
```typescript
// Sprawdzenie kontrastów WCAG 2.1
const colors = {
  primary: '#2563EB',      // blue-600
  success: '#047857',      // emerald-700 (poprawione dla lepszego kontrastu)
  error: '#B91C1C',        // red-700 (poprawione dla lepszego kontrastu)
  text: '#374151',         // gray-700
  background: '#FFFFFF'
}
```

**Wyniki testów kontrastu:**
- ✅ Tekst na białym tle: 10.31:1 (AAA)
- ✔️ Biały tekst na niebieskim: 5.17:1 (AA)
- ✔️ Biały tekst na zielonym: 5.48:1 (AA) - POPRAWIONE
- ✔️ Biały tekst na czerwonym: 6.47:1 (AA) - POPRAWIONE
- ✔️ Zielony tekst na jasnym tle: 4.84:1 (AA) - POPRAWIONE
- ✔️ Czerwony tekst na jasnym tle: 5.3:1 (AA) - POPRAWIONE
- ✔️ Szary tekst na białym: 4.83:1 (AA)

### Typografia
- **Font size**: Skalowane (0.9x bazowy rozmiar)
- **Line height**: Optymalne proporcje czytelności
- **Font weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## 7.2 Responsywność i Mobile First ✅

### Breakpointy
```css
/* Mobile First Approach */
sm: 640px   /* Telefony poziomo */
md: 768px   /* Tablety pionowo */
lg: 1024px  /* Tablety poziomo / małe laptopy */
xl: 1280px  /* Desktopy */
2xl: 1536px /* Duże ekrany */
```

### Implementacja responsywna
- **Grid layout**: `grid-cols-1 md:grid-cols-2` - 1 kolumna na mobile, 2 na desktop
- **Padding**: `px-4 sm:px-6 py-4` - progresywne marginesy
- **Przyciski**: `grid-cols-1 sm:grid-cols-3` - pionowo na mobile, poziomo na desktop
- **Tekst**: Skalowane rozmiary dla różnych ekranów

### Testowane urządzenia
- 📱 iPhone SE (375px)
- 📱 iPhone 12 Pro (390px)
- 📱 Samsung Galaxy S21 (360px)
- 📟 iPad (768px)
- 💻 Desktop (1920px)

## 7.3 ARIA Labels, Kontrast, Klawiaturowa Nawigacja ✅

### ARIA Implementation

#### Formularz główny
```html
<form aria-labelledby="valuation-form-title" noValidate>
  <h2 id="valuation-form-title" class="sr-only">
    Formularz wyceny mieszkania
  </h2>
  <fieldset>
    <legend>Dane mieszkania</legend>
```

#### Komponenty z ARIA
- **Autocomplete**: `role="combobox"`, `aria-expanded`, `aria-activedescendant`
- **Tooltip**: `role="tooltip"`, `aria-describedby`
- **Błędy**: `role="alert"`, `aria-live="polite"`
- **Wyniki**: `role="region"`, `aria-labelledby`
- **Loading**: `role="status"`, `aria-label="Obliczanie wyceny"`

#### Screen Reader Support
```html
<!-- Ukryty tekst dla czytników ekranu -->
<div id="help-city" class="sr-only">
  Miasto gdzie znajduje się mieszkanie. Model został wytrenowany głównie na danych z Olsztyna i okolic.
</div>

<!-- Oznaczenia pól wymaganych -->
<span class="text-red-500 ml-1" aria-label="pole wymagane">*</span>
```

### Klawiaturowa nawigacja

#### Autocomplete
- **Arrow Down/Up**: Nawigacja po opcjach
- **Enter**: Wybór opcji
- **Escape**: Zamknięcie listy
- **Tab**: Przejście do następnego pola

#### Focus Management
```css
/* Focus indicators */
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
```

#### Keyboard Shortcuts
- **Tab**: Kolejne pole
- **Shift + Tab**: Poprzednie pole
- **Enter**: Submit formularza
- **Escape**: Zamknięcie tooltipów/autocomplete

### Kontrast kolorów (WCAG 2.1)

#### Sprawdzenie automatyczne
```typescript
import { generateAccessibilityReport } from '@/lib/accessibility'

// W development console:
generateAccessibilityReport()
```

#### Wyniki
- ✅ **AAA Level**: Główny tekst (8.9:1)
- ✅ **AA Level**: Wszystkie przyciski i statusy
- ✅ **Focus indicators**: Niebieskie ringi 2px
- ✅ **Error states**: Czerwony tekst z ikoną

## 7.4 Copywriting: Microcopy, Tooltipy z Definicjami ✅

### Microcopy Examples

#### Etykiety pól
```typescript
const tooltips = {
  city: 'Miasto gdzie znajduje się mieszkanie. Model został wytrenowany głównie na danych z Olsztyna i okolic.',
  
  district: 'Dzielnica lub osiedle. Lokalizacja znacząco wpływa na cenę nieruchomości. Opcjonalne pole.',
  
  area: 'Powierzchnia mieszkania w metrach kwadratowych. Jeden z najważniejszych czynników wpływających na cenę.',
  
  rooms: 'Liczba pokoi (bez kuchni i łazienki). Wpływa na funkcjonalność i atrakcyjność mieszkania.',
  
  floor: 'Piętro na którym znajduje się mieszkanie. 0 oznacza parter. Wyższe piętra mogą być bardziej atrakcyjne.',
  
  year: 'Rok budowy budynku. Nowsze budynki zazwyczaj mają wyższe ceny ze względu na lepszy standard.'
}
```

#### Komunikaty statusu
- **Loading**: "Obliczanie wyceny..." z animacją
- **Success**: "Szacowana wartość mieszkania" z ikonami
- **Error**: Konkretne komunikaty błędów
- **Validation**: "Wypełnij wymagane pola: miasto, metraż i liczbę pokoi"

#### Przyciski akcji
- **Primary**: "🏠 Oblicz wartość mieszkania"
- **Secondary**: "💳 Rata kredytu", "🏘️ Wynajem", "💰 Koszty zakupu"

### Definicje pojęć w tooltipach

#### Implementacja
```tsx
<FieldWithTooltip
  label="Metraż (m²)"
  tooltip="Powierzchnia mieszkania w metrach kwadratowych. Jeden z najważniejszych czynników wpływających na cenę."
  required
  htmlFor="area"
>
  <Input ... />
</FieldWithTooltip>
```

#### UX Patterns
- **Hover delay**: 500ms przed pokazaniem
- **Keyboard accessible**: Focus + Enter
- **Mobile friendly**: Touch to show/hide
- **Escape to close**: Uniwersalne zamknięcie

### Informacje o modelu AI
```tsx
<div role="banner" aria-labelledby="ai-info-title">
  <h3 id="ai-info-title">
    🤖 Wycena oparta o sztuczną inteligencję
  </h3>
  <p>
    Używamy modelu Random Forest wytrenowanego na 
    <span className="font-medium">566 ofertach z regionu Olsztyn</span>.
    Dokładność: <span className="font-medium">MAPE 15.56%</span>
  </p>
</div>
```

## Testy Accessibility

### Automatyczne sprawdzanie
```bash
# Development console
npm run dev
# Otwórz console - automatyczny raport accessibility
```

### Manualne testy
- [ ] **Nawigacja tylko klawiaturą** - Tab przez wszystkie elementy
- [ ] **Screen reader** - NVDA/JAWS/VoiceOver
- [ ] **Zoom 200%** - Czytelność przy powiększeniu
- [ ] **Kontrast** - Sprawdzenie w różnych warunkach oświetlenia
- [ ] **Mobile** - Touch targets min 44px

### Narzędzia testowe
- **axe DevTools** - Automatyczne skanowanie
- **WAVE** - Web accessibility evaluation
- **Lighthouse** - Audit accessibility score
- **Colour Contrast Analyser** - Sprawdzanie kontrastów

## Status Implementacji

| Element | Status | Uwagi |
|---------|--------|-------|
| **Design System** | ✅ | Komponenty UI z Tailwind |
| **Responsywność** | ✅ | Mobile-first, wszystkie breakpointy |
| **ARIA Labels** | ✅ | Pełna implementacja semantyczna |
| **Kontrast** | ✅ | WCAG 2.1 AA compliance - POPRAWIONE |
| **Klawiatura** | ✅ | Pełna nawigacja + shortcuts |
| **Tooltips** | ✅ | Accessibility + definicje pojęć |
| **Microcopy** | ✅ | Jasne komunikaty i etykiety |
| **Testing** | ⏳ | Automatyczne + manualne testy |

## Roadmap

### Faza następna
- [ ] **Testy E2E** - Playwright z accessibility checks
- [ ] **Performance** - Optymalizacja dla screen readerów
- [ ] **i18n** - Internacjonalizacja (EN/PL)
- [ ] **Dark mode** - Tryb ciemny z kontrastami

### Metryki docelowe
- **Lighthouse Accessibility**: 100/100
- **axe violations**: 0
- **Keyboard navigation**: 100% coverage
- **Screen reader**: Pełna kompatybilność 