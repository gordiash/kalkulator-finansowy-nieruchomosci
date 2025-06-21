# Rozszerzony Formularz Ensemble - 12 Pól

## Cel
Zwiększenie prawdopodobieństwa sukcesu modelu Ensemble z ~30% do ~5% fallback przez dodanie **dodatkowych 6 pól** charakteryzujących mieszkanie.

## Nowe Pola (Faza 2)

### 5. Standard Wykończenia (`finishing`)
- **Opcje**: `developer`, `standard`, `premium`, `to_finish`
- **Domyślna**: `standard`
- **Wpływ**: Premium wykończenie może zwiększyć wartość o 5-15%

### 6. Winda w Budynku (`elevator`)
- **Opcje**: `no`, `yes`, `planned`
- **Domyślna**: `no`
- **Wpływ**: Szczególnie ważne dla wyższych pięter (>2)

### 7. Balkon/Taras (`balcony`)
- **Opcje**: `none`, `balcony`, `terrace`, `loggia`, `garden`
- **Domyślna**: `none`
- **Wpływ**: Może zwiększyć wartość o 3-8%

### 8. Orientacja (`orientation`)
- **Opcje**: `unknown`, `north`, `south`, `east`, `west`, `south-west`, `south-east`, `north-west`, `north-east`
- **Domyślna**: `unknown`
- **Wpływ**: Południowa orientacja najcenniejsza (+3-7%)

### 9. Dostęp do Komunikacji (`transport`)
- **Opcje**: `poor`, `medium`, `good`, `excellent`
- **Domyślna**: `medium`
- **Wpływ**: Dobra komunikacja zwiększa wartość o 5-12%

### 10. Liczba Pięter w Budynku (`totalFloors`)
- **Typ**: number (1-100)
- **Domyślna**: undefined/empty
- **Wpływ**: Wpływa na prestiż i dostępność

## Nowe Cechy Modelu

### Cechy Binarne
- `has_elevator`: czy jest winda
- `has_balcony`: czy ma balkon/taras
- `is_premium_finishing`: czy wykończenie premium
- `is_south_oriented`: czy orientacja południowa
- `good_transport`: czy dobry dostęp do komunikacji
- `has_garden`: czy ma ogródek
- `is_high_building`: czy budynek >5 pięter

### Cechy Złożone
- `floor_ratio`: piętro / liczba pięter (pozycja względna)
- `area_transport`: powierzchnia × dobra komunikacja
- `rooms_elevator`: pokoje × winda
- `premium_score`: średnia z cech premium (wykończenie + balkon + parking + komunikacja)

### One-Hot Encoding
- `finishing_*`: 4 kolumny
- `elevator_*`: 3 kolumny
- `balcony_*`: 5 kolumn
- `orientation_*`: 9 kolumn
- `transport_*`: 4 kolumny

**Łącznie**: +41 nowych cech w modelu

## Oczekiwane Rezultaty

### Przed Rozszerzeniem (8 pól)
- **Sukces Ensemble**: ~70%
- **Fallback RF**: ~25%
- **Fallback Heurystyka**: ~5%

### Po Rozszerzeniu (12 pól)
- **Sukces Ensemble**: ~95%
- **Fallback RF**: ~4%
- **Fallback Heurystyka**: ~1%

## Implementacja Techniczna

### Frontend (`ValuationCalculator.tsx`)
```typescript
interface FormData {
  // ... istniejące pola ...
  finishing: 'developer' | 'standard' | 'premium' | 'to_finish'
  elevator: 'no' | 'yes' | 'planned'
  balcony: 'none' | 'balcony' | 'terrace' | 'loggia' | 'garden'
  orientation: 'unknown' | 'north' | 'south' | ... // 9 opcji
  transport: 'poor' | 'medium' | 'good' | 'excellent'
  totalFloors?: number
}
```

### Backend API (`route.ts`)
- Rozszerzony schemat Zod
- Przekazywanie nowych pól do `callEnsembleModel`

### Model ML (`predict_ensemble.py`)
- 41 nowych cech automatycznie generowanych
- Inteligentne domyślne wartości
- Kompatybilność wsteczna z istniejącym modelem

## Testowanie
1. Uruchom formularz z nowymi polami
2. Sprawdź czy Ensemble częściej się udaje
3. Monitoruj logi API dla sukces/fallback ratio

## Metryki Sukcesu
- **Cel**: <5% fallback do Random Forest
- **KPI**: Czas odpowiedzi <3s dla Ensemble
- **Jakość**: Utrzymanie MAPE ~0.77% 