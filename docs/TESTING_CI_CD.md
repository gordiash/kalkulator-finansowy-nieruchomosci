# Testy i CI/CD - Punkt 9 Implementacji

## Przegląd

Punkt 9 obejmuje kompletną strategię testowania i automatyzacji CI/CD dla kalkulatora wyceny mieszkań, zgodnie z planem implementacji.

## 9.1 Testy Jednostkowe (Jest)

### Lokalizacja
- `tests/valuation.unit.test.ts` - Testy komponentu React
- `tests/valuation.integration.test.ts` - Testy API

### Zakres Testowania

#### Walidacja Wejścia
```typescript
describe('Walidacja wejścia', () => {
  it('waliduje zakres metrażu (1-1000)')
  it('waliduje liczbę pokoi (1-20)')  
  it('waliduje rok budowy (1800-2030)')
  it('pozwala na pusty rok budowy')
  it('wyświetla błędy dla wymaganych pól')
})
```

#### Funkcja Predykcji
```typescript
describe('Funkcja predykcji', () => {
  it('wysyła poprawne dane do API')
  it('wyświetla wynik wyceny')
  it('obsługuje błędy API')
  it('obsługuje błędy sieci')
})
```

### Konfiguracja Jest

**Coverage Requirements:**
- Branches: 70%
- Functions: 70% 
- Lines: 70%
- Statements: 70%

**Test Patterns:**
- `tests/**/*.test.{ts,tsx}`
- `src/**/__tests__/**/*.{ts,tsx}`
- `src/**/*.{test,spec}.{ts,tsx}`

## 9.2 Testy Integracyjne

### Request → Response z Mockiem Modelu

#### API Endpoint Testing
```typescript
describe('Request → Response z mockiem modelu', () => {
  it('akceptuje poprawne zapytanie')
  it('odrzuca nieprawidłowe dane') 
  it('waliduje zakresy wartości')
  it('obsługuje błędy Python subprocess')
  it('używa fallback gdy model niedostępny')
  it('oblicza przedział ufności ±7%')
})
```

#### Mock Strategy
- **Python subprocess:** Mock `child_process.spawn`
- **File system:** Mock `fs.existsSync`
- **Model responses:** JSON fixtures
- **Error scenarios:** Exit codes, stderr output

#### Security Testing
```typescript
describe('Security i Rate Limiting', () => {
  it('odrzuca zbyt duże payloady')
  it('ma poprawne CORS headers')
  it('waliduje input sanitization')
})
```

## 9.3 Testy E2E (Planowane - Playwright)

### Happy Path Scenarios
- Pełny przepływ wyceny mieszkania
- Nawigacja do innych kalkulatorów
- Responsywność na różnych urządzeniach

### Edge Cases  
- Błąd serwera z graceful fallback
- Timeout sieci
- Odpowiedź z fallback heurystyką
- Bardzo duże mieszkania
- Bardzo stare budynki

### Accessibility Testing
- Nawigacja klawiaturą
- Screen reader compatibility
- Kontrast kolorów WCAG 2.1

## 9.4 Pipeline GitHub Actions

### Workflow Structure

```yaml
lint → test → build → deploy → invalidate-cache
```

### Jobs Overview

#### 1. 🔍 Lint Code
- ESLint validation
- TypeScript type checking
- Code style enforcement

#### 2. 🧪 Run Tests  
- Unit tests with coverage
- Integration tests
- Upload coverage to Codecov

#### 3. 🤖 Test ML Model
- Validate model files
- Test prediction script
- Check model loading

#### 4. 🏗️ Build Application
- Next.js production build
- Environment variable injection
- Artifact upload

#### 5. 🚦 Lighthouse Performance
- Core Web Vitals
- Accessibility audit
- SEO validation
- Performance budgets

#### 6. 🔒 Security Scan
- npm audit (high severity)
- Snyk vulnerability scan
- Dependency analysis

#### 7. 🚀 Deploy Staging/Production
- Vercel deployment
- Environment-specific configs
- Cache invalidation

#### 8. 📊 Post-Deploy Actions
- Slack notifications
- Deployment status tracking
- Performance monitoring

### Branch Strategy

| Branch | Trigger | Environment | Actions |
|--------|---------|-------------|---------|
| `develop` | Push | Staging | lint → test → build → deploy-staging |
| `main` | Push | Production | lint → test → build → security → deploy-prod |
| `feature/*` | PR | - | lint → test → build → lighthouse |

### Environment Variables

#### Required Secrets
```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID  
VERCEL_PROJECT_ID

# Database
DATABASE_URL

# Monitoring
LHCI_GITHUB_APP_TOKEN
SNYK_TOKEN
SLACK_WEBHOOK

# Cache
CACHE_INVALIDATION_URL
CACHE_INVALIDATION_TOKEN
```

## Scheduled Workflows

### 🔄 Model Retraining (Monthly)
```yaml
schedule:
  - cron: '0 2 1 * *'  # 1st day of month, 2 AM UTC
```

**Actions:**
1. Retrain Random Forest model
2. Commit new model files
3. Generate performance report
4. Upload artifacts

## Model Performance Monitoring

### 📊 Performance Report Script
**Location:** `scripts/model_performance_report.py`

#### Metrics Tracked
- **MAPE:** Mean Absolute Percentage Error
- **RMSE:** Root Mean Square Error  
- **R²:** Coefficient of Determination
- **MAE:** Mean Absolute Error

#### Alert Thresholds
- 🚨 **MAPE > 15%:** Model degradation alert
- ⚠️ **Model Age > 30 days:** Freshness warning
- 📊 **Error Distribution:** Percentile analysis

#### Performance by Price Range
- Budget: 0-300k PLN
- Mid-range: 300-600k PLN  
- Premium: 600k-1M PLN
- Luxury: 1M+ PLN

### Report Output Example
```markdown
# 📊 Model Performance Report
**Generated:** 2024-01-15 10:30:00 UTC

✅ **Model Status:** Loaded successfully
**Features:** 35

## 📈 Performance Metrics
- **MAPE:** 15.56%
- **RMSE:** 173,000 PLN
- **R²:** 0.555
- **MAE:** 125,000 PLN

✅ **Performance:** MAPE (15.56%) within acceptable range (<15.0%)

## 🏠 Performance by Price Range
- **Budget** (0-300,000 PLN): 18.2% MAPE (45 samples)
- **Mid-range** (300,000-600,000 PLN): 14.1% MAPE (128 samples)
- **Premium** (600,000-1,000,000 PLN): 12.8% MAPE (89 samples)
```

## NPM Scripts

### Test Commands
```bash
npm run test              # All tests
npm run test:unit         # Unit tests only  
npm run test:integration  # Integration tests only
npm run test:coverage     # With coverage report
npm run test:watch        # Watch mode
```

### Model Commands
```bash
npm run model:report      # Performance report
npm run model:retrain     # Retrain model
npm run train:valuation   # Train XGBoost (legacy)
```

### Build Commands
```bash
npm run build             # Production build
npm run build:clean       # Clean + build
npm run build:fast        # Skip linting
npm run lhci             # Lighthouse CI
```

## Quality Gates

### Pre-Merge Requirements
- ✅ All tests pass
- ✅ Coverage ≥ 70%
- ✅ No ESLint errors
- ✅ TypeScript compilation
- ✅ Lighthouse score ≥ 90
- ✅ No high-severity vulnerabilities

### Production Deployment
- ✅ All quality gates
- ✅ Security scan passed
- ✅ Model performance acceptable
- ✅ Manual approval (if required)

## Monitoring & Alerting

### Success Metrics
- **Build Success Rate:** >95%
- **Test Coverage:** >70%
- **Deployment Time:** <10 minutes
- **Model MAPE:** <15%

### Alert Channels
- 📧 **Email:** Critical failures
- 💬 **Slack:** Deployment notifications
- 📊 **Dashboard:** Real-time metrics
- 🚨 **PagerDuty:** Production incidents

## Troubleshooting

### Common Issues

#### Test Failures
```bash
# Clear cache and reinstall
npm run clean
npm ci
npm test
```

#### Build Failures
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check ESLint
npm run lint
```

#### Model Issues
```bash
# Check model file
python scripts/model_performance_report.py

# Retrain if needed
python scripts/train_random_forest_model.py
```

### Debug Commands
```bash
# Verbose test output
npm test -- --verbose

# Jest debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Coverage details
npm run test:coverage -- --verbose
```

## Roadmap

### Phase 1 (Current) ✅
- Unit tests for validation
- Integration tests for API
- Basic CI/CD pipeline
- Model performance monitoring

### Phase 2 (Next)
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] A/B testing framework

### Phase 3 (Future)
- [ ] Chaos engineering
- [ ] Load testing
- [ ] Multi-region deployment
- [ ] Blue-green deployments

## Best Practices

### Test Writing
1. **AAA Pattern:** Arrange, Act, Assert
2. **Descriptive Names:** Clear test intentions
3. **Single Responsibility:** One assertion per test
4. **Mock External Dependencies:** Predictable tests
5. **Test Edge Cases:** Error scenarios

### CI/CD
1. **Fail Fast:** Early error detection
2. **Parallel Jobs:** Faster feedback
3. **Artifact Caching:** Speed optimization
4. **Environment Parity:** Staging = Production
5. **Rollback Strategy:** Quick recovery

### Monitoring
1. **Proactive Alerts:** Before user impact
2. **Actionable Metrics:** Clear next steps
3. **Historical Trends:** Performance tracking
4. **Automated Reports:** Regular insights
5. **Escalation Paths:** Clear ownership 