export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\\.(css|less|scss)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.venv/',
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    // Legacy/nieużywane moduły (Stripe/MySQL/panel klienta/Strapi)
    '<rootDir>/tests/auth.api.test.ts',
    '<rootDir>/tests/auth.lib.test.ts',
    '<rootDir>/tests/passwordReset.api.test.ts',
    '<rootDir>/tests/customerPortal.api.test.ts',
    '<rootDir>/tests/cancelSubscription.api.test.ts',
    '<rootDir>/tests/protectedMiddleware.test.ts',
    '<rootDir>/tests/blogPage.test.ts',
    '<rootDir>/tests/SubscriptionDashboard.test.tsx',
    '<rootDir>/tests/AccountSettings.test.tsx',
    '<rootDir>/tests/ValuationsTable.test.tsx',
    '<rootDir>/tests/ChangePasswordForm.test.tsx',
    '<rootDir>/tests/middleware.test.ts',
    '<rootDir>/tests/logout.test.ts',
    '<rootDir>/tests/stripe.webhook.test.ts',
    '<rootDir>/tests/api/user/valuations.test.ts',
    '<rootDir>/tests/calculations.api.test.ts',
    '<rootDir>/tests/ProfileForm.test.tsx',
    '<rootDir>/tests/api/user/profile.test.ts',
    '<rootDir>/tests/api/user/profile-put.test.ts',
    // Testy UI kalkulatora (do przeglądu i aktualizacji pod nowy API)
    '<rootDir>/tests/valuationCalculator.test.ts',
    '<rootDir>/tests/valuationE2E.test.ts'
  ],
  modulePathIgnorePatterns: ['<rootDir>/.venv/'],
  watchPathIgnorePatterns: ['<rootDir>/.venv/']
}; 