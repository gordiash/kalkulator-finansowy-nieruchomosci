# Dokumentacja Workspace

Witaj w dokumentacji workspace projektów finansowych!

## 📚 Spis Treści

- [Architektura Projektów](./architecture.md)
- [Przewodnik Dewelopera](./development-guide.md)
- [API Backend](./api-documentation.md)
- [Kalkulator Frontend](./calculator-frontend.md)
- [Wspólne Pakiety](./shared-packages.md)
- [Konwencje Kodowania](./coding-conventions.md)
- [Testowanie](./testing.md)
- [Deployment](./deployment.md)

## 🚀 Szybki Start

### Wymagania

- Node.js 18+ 
- npm 9+
- TypeScript 5+

### Instalacja

```bash
# Sklonuj repozytorium
git clone <repository-url>
cd workspace

# Zainstaluj zależności
npm install

# Zbuduj pakiety shared
npm run build --workspace=packages/shared

# Uruchom wszystkie aplikacje
npm run dev
```

### Pierwsze Kroki

1. **Backend API** - Dostępny pod `http://localhost:3001`
2. **Frontend Kalkulator** - Dostępny pod `http://localhost:3000`
3. **Dokumentacja API** - Dostępna pod `http://localhost:3001/docs`

## 🏗️ Architektura

```
workspace/
├── apps/                      # Aplikacje
│   ├── kalkulator-finansowy/  # React frontend
│   └── gus-backend/          # Node.js API
├── packages/                  # Pakiety wspólne
│   └── shared/               # Typy i utilities
├── tools/                    # Narzędzia deweloperskie
│   ├── eslint.config.js      # Konfiguracja ESLint
│   └── prettier.config.js    # Konfiguracja Prettier
└── docs/                     # Dokumentacja
```

## 🛠️ Narzędzia

- **TypeScript** - Bezpieczeństwo typów
- **ESLint** - Analiza kodu
- **Prettier** - Formatowanie kodu
- **Jest** - Testowanie
- **Tailwind CSS** - Stylowanie
- **React** - Frontend framework
- **Express** - Backend framework

## 📞 Wsparcie

- **Issues** - Zgłaszaj problemy w repozytorium
- **Dokumentacja API** - `/docs` endpoint
- **Code Review** - Wszystkie zmiany wymagają review 