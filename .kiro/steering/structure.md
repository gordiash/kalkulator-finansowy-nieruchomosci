# Project Structure & Organization

## Root Directory Structure

```
├── .kiro/                    # Kiro AI assistant configuration
├── docs/                     # Project documentation
├── models/                   # ML model files (.pkl, metadata)
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets (images, icons, manifest)
├── scripts/                  # Python ML scripts and utilities
├── src/                      # Main application source code
├── tests/                    # Test files (Jest, Playwright)
└── test-results/             # Test execution results
```

## Source Code Organization (`src/`)

### App Router Structure (`src/app/`)
Following Next.js 15 App Router conventions:

```
src/app/
├── api/                      # API endpoints
│   ├── calculate/           # Calculation endpoints
│   ├── valuation/           # ML valuation API
│   ├── valuation-ensemble/  # Advanced AI ensemble API
│   └── locations/           # Location autocomplete API
├── kalkulator-*/            # Calculator pages (Polish URLs)
├── admin/                   # Admin panel
├── panel/                   # User dashboard
├── blog/                    # Blog/content pages
├── globals.css              # Global styles
├── layout.tsx               # Root layout
├── page.tsx                 # Homepage
└── sitemap.ts               # SEO sitemap
```

### Components (`src/components/`)

```
src/components/
├── ui/                      # Base UI components (Radix UI based)
├── charts/                  # Chart components (Recharts)
├── calculation-details/     # Calculator-specific components
├── admin/                   # Admin panel components
├── blog/                    # Blog-related components
├── market/                  # Market analysis components
├── panel/                   # User panel components
├── ValuationCalculator.tsx  # AI valuation component
├── Header.tsx               # Site header
├── Footer.tsx               # Site footer
└── Navbar.tsx               # Navigation
```

### Business Logic (`src/lib/`)

```
src/lib/
├── supabase/               # Supabase client configuration
├── validators/             # Zod validation schemas
├── market/                 # Market data utilities
├── seo/                    # SEO utilities
├── fonts/                  # Font configurations
├── CalculationService.ts   # Core calculation logic
├── apiService.ts           # API client
├── auth.ts                 # Authentication utilities
├── prisma.ts               # Database client
├── analytics.ts            # Analytics tracking
└── utils.ts                # General utilities
```

### Type Definitions (`src/types/`)

```
src/types/
├── blog.ts                 # Blog-related types
├── css.d.ts                # CSS module declarations
└── markdown-it-attrs.d.ts  # Markdown plugin types
```

### Custom Hooks (`src/hooks/`)

```
src/hooks/
├── useLocations.ts         # Location autocomplete hook
├── useCookieConsent.ts     # Cookie consent management
├── useMediaQuery.ts        # Responsive design hook
└── useNewsletterPopup.ts   # Newsletter popup logic
```

## Machine Learning (`scripts/`)

```
scripts/
├── training/               # Model training scripts
├── preprocessing/          # Data preprocessing
├── market/                 # Market data scripts
├── reports/                # Analysis and reporting
├── train_valuation_model.py
├── predict_rf.py
├── ensemble_models.py
└── test_ensemble_with_real_data.py
```

## Testing Structure (`tests/`)

```
tests/
├── api/                    # API endpoint tests
├── e2e/                    # End-to-end tests (Playwright)
├── market/                 # Market data tests
├── __mocks__/              # Test mocks
├── *.test.tsx              # Component tests
├── *.test.ts               # Unit tests
└── *.integration.test.ts   # Integration tests
```

## Configuration Files

### Core Config
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration with security headers
- `tsconfig.json` - TypeScript configuration with path aliases
- `middleware.ts` - Authentication and security middleware

### Styling & UI
- `tailwind.config.ts` - Tailwind CSS with accessibility colors
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - Shadcn/ui component configuration

### Testing & Quality
- `jest.config.mjs` - Jest testing configuration
- `jest.setup.ts` - Test setup and mocks
- `eslint.config.mjs` - ESLint with accessibility rules
- `.lighthouserc.js` - Lighthouse CI configuration

### Database & ML
- `prisma/schema.prisma` - Database schema with real estate models
- `models/` - Trained ML models and metadata

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (`ValuationCalculator.tsx`)
- **Pages**: kebab-case following Polish URLs (`kalkulator-wyceny/`)
- **Utilities**: camelCase (`apiService.ts`)
- **Types**: camelCase with `.ts` extension
- **Tests**: `*.test.ts` or `*.test.tsx`

### Code Conventions
- **React Components**: PascalCase with TypeScript interfaces
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: Tailwind utility classes
- **API Routes**: RESTful conventions with Polish context

## Path Aliases

Configured in `tsconfig.json`:
```typescript
"@/*": ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/lib/*": ["./src/lib/*"]
"@/utils/*": ["./src/utils/*"]
"@/types/*": ["./src/types/*"]
"@/styles/*": ["./src/styles/*"]
```

## Key Architectural Patterns

1. **App Router**: Next.js 15 file-based routing
2. **Server Components**: Default for better performance
3. **API Routes**: TypeScript-based backend endpoints
4. **Component Composition**: Radix UI primitives with custom styling
5. **Type Safety**: Strict TypeScript throughout
6. **Database First**: Prisma schema drives type generation
7. **Security First**: Middleware-based authentication and headers