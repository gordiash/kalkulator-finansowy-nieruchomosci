# Technology Stack & Build System

## Core Technologies

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5** - Static typing throughout the codebase
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Backend & Database
- **Next.js API Routes** - TypeScript-based backend
- **Prisma 6.12.0** - Database ORM with MySQL
- **MySQL** - Primary database
- **Supabase** - Authentication and additional services

### Machine Learning
- **Python** - ML environment (scikit-learn, pandas, numpy)
- **LightGBM + Random Forest + CatBoost** - Ensemble model
- **Pickle** - Model serialization

### Analytics & Monitoring
- **Google Analytics 4** - Web analytics
- **Facebook Pixel** - Conversion tracking
- **Hotjar** - User behavior analytics

## Build System & Commands

### Development
```bash
npm run dev              # Start development server
npm run dev:https        # Start with HTTPS (experimental)
```

### Building
```bash
npm run build            # Full production build (includes Prisma generate)
npm run build:clean      # Clean build (removes .next first)
npm run build:fast       # Fast build without linting
npm run build:vercel     # Vercel-specific build with debug
npm run start            # Start production server
```

### Testing
```bash
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests
```

### Linting & Quality
```bash
npm run lint             # ESLint check
npm run lhci             # Lighthouse CI
npm run analyze          # Bundle analyzer
```

### Database & ML
```bash
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema changes
npm run train:valuation  # Train ML valuation model
npm run model:report     # Generate model performance report
npm run model:retrain    # Retrain Random Forest model
```

### Data Management
```bash
npm run market:refresh   # Refresh market data
npm run cities:normalize # Normalize city names
npm run cities:apply     # Apply city normalization
```

### Utilities
```bash
npm run clean            # Clean build artifacts
npm run clean:vercel     # Vercel-specific cleanup
```

## Key Configuration Files

- `next.config.js` - Next.js configuration with security headers
- `tsconfig.json` - TypeScript configuration with path aliases
- `tailwind.config.ts` - Tailwind CSS with custom accessibility colors
- `jest.config.mjs` - Jest testing configuration
- `eslint.config.mjs` - ESLint with accessibility rules
- `prisma/schema.prisma` - Database schema
- `middleware.ts` - Authentication and security middleware

## Environment Variables

Required for production:
```bash
NEXT_PUBLIC_SITE_URL=https://www.kalkulatorynieruchomosci.pl
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=XXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=XXXXXXXX
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
DATABASE_URL=mysql://xxx
AIRTABLE_BASE_ID=appXXXXXXXXXX
AIRTABLE_TABLE_NAME=Newsletter
AIRTABLE_ACCESS_TOKEN=patXXXXXXXXXX
```

## Deployment

- **Platform**: Vercel
- **Auto-deploy**: Push to main branch
- **Build Command**: `npm run build` (includes Prisma generation)
- **Node Version**: Specified in `.nvmrc`

## Performance Optimizations

- Static generation for better SEO
- Bundle splitting and code optimization
- Image optimization with Next.js Image component
- Security headers in middleware and next.config.js
- Lighthouse score target: 95+ in all categories