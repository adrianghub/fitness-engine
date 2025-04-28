# Stos technologiczny dla FitnessEngine

## 1. Przegląd

FitnessEngine to aplikacja webowa PWA zbudowana w oparciu o nowoczesny stos technologiczny, skoncentrowany wokół ekosystemu Google Firebase. Taki wybór umożliwia szybkie wdrożenie MVP, skalowalność oraz minimalizację kosztów utrzymania dzięki wykorzystaniu usług serverless.

## 2. Kluczowe technologie

### 2.1 Frontend

*   **Framework/Biblioteka:** React 19
    *   Do budowy interfejsu użytkownika.
*   **Build Tool:** Vite 6.x
    *   Szybkie środowisko deweloperskie i narzędzie do budowania aplikacji.
*   **Język:** TypeScript 5.x
    *   Zapewnia bezpieczeństwo typów i lepszą konserwację kodu.
*   **Stylizacja:** Tailwind CSS 4.x
    *   Utility-first CSS framework dla szybkiego stylizowania.
    *   Integracja z Vite (`@tailwindcss/vite`).
*   **Komponenty UI:** Shadcn/ui (oparte na Radix UI)
    *   Gotowe, dostępne komponenty UI do budowy interfejsu użytkownika.
*   **Zarządzanie stanem i danymi:**
    *   TanStack Query 5.x: Do zarządzania asynchronicznym stanem (pobieranie danych z Firestore/Functions).
    *   TanStack Store 0.7.x: Podstawowe zarządzanie stanem aplikacji.
*   **Routing:** TanStack Router 1.x
    *   Routing po stronie klienta z funkcjami code-splitting.
*   **Animacje:**
    *   `motion` (Framer Motion) 12.x: Biblioteka do tworzenia płynnych animacji.
    *   `tw-animate-css` 1.x: Utility klasy Tailwind do animacji.
*   **Inne:**
    *   `sonner` 2.x: Komponenty do wyświetlania powiadomień (toasts).
    *   `next-themes` 0.4.x: Zarządzanie motywami (jasny/ciemny - potencjalnie poza MVP, ale obecne w zależnościach).
    *   `i18next`, `react-i18next`, `i18next-browser-languagedetector` (obecne w zależnościach): Obsługa internacjonalizacji (i18n). W strukturze widać plik `pl.json`, co sugeruje implementację języka polskiego.

#### 2.1.1 Elementy wizualne (Rekomendacje / Wdrożone w UI)

*   **Motyw kolorystyczny:** (Rekomendowane w poprzedniej wersji PRD, wdrożone w stylach Tailwind)
    *   Kolor główny (Primary): Głęboki odcień zieleni morskiej (#008080) - budowanie spokoju i skupienia.
    *   Kolor drugorzędny (Secondary): Jasnoszary (#F0F0F0) - czyste tło, separacja treści.
    *   Akcent (Accent): Koralowy (#FF7F50) - elementy interaktywne, wskaźniki postępu.
*   **Ikony:** Lucide (`lucide-react`) - proste, liniowe ikony.
*   **Animacje:** Płynne przejścia i subtelne animacje dla lepszego feedbacku i zaangażowania (wykorzystanie `motion` i `tw-animate-css`).

### 2.2 Backend (Firebase)

*   **Authentication:** Firebase Auth
    *   Uproszczona autentykacja, docelowo przez Google Auth (zgodnie z PRD).
*   **Database:** Firestore
    *   NoSQL database do przechowywania danych użytkowników, wyzwań, tablicy wyników itp.
    *   Struktura danych (`schema-definitions/models.yml`) i indeksy (`firestore.indexes.json`) są zdefiniowane dla efektywnych zapytań.
    *   Zasady bezpieczeństwa (`firestore.rules`) definiują dostęp do danych.
*   **Serverless Logic:** Firebase Functions (Node.js 22.x LTS)
    *   Wykorzystywane do logiki biznesowej i zadań wykonywanych po stronie serwera.
    *   **HTTP Endpoints:** (np. `seedChallengeTemplates`, `manualUserLevelUp` - zidentyfikowane w README i strukturze `functions/src/handlers/`)
    *   **Firestore Triggers:** (np. `onUserProfileComplete` - zidentyfikowane w README i strukturze `functions/src/handlers/`)
    *   **Scheduled Functions:** (np. `dailyChallengeAndOpponentUpdate` - zidentyfikowane w README i strukturze `functions/src/handlers/`) - Kluczowe dla automatycznego, codziennego odświeżania wyzwań, penalizacji, aktualizacji wyników przeciwników i zarządzania rankingiem/pozycjami użytkowników.
    *   Implementacja serwerowej logiki zarządzania cyklem życia wyzwań (timery, statusy, próby, penalizacje).

### 2.3 Type Safety

*   TypeSync (`typesync-cli`)
    *   Narzędzie do generowania typów TypeScript dla modeli Firestore na podstawie definicji schematu (`schema-definitions/models.yml`).
    *   Zapewnia spójność typów między frontendem a backendem (Admin SDK).

### 2.4 Hosting

*   Firebase Hosting
    *   Proste hostowanie aplikacji webowej.
    *   Konfiguracja rewrites do serwowania `index.html` dla wszystkich ścieżek routingowych.
*   **PWA:** Vite-plugin-PWA
    *   Konfiguracja do budowy Progressive Web App (PWA), w tym generowanie pliku manifestu (`public/manifest.json`) i Service Workera.

### 2.5 CI/CD

*   GitHub Actions
    *   Automatyzacja procesów build, testowania i deploymentu do Firebase (zgodnie ze `.github/workflows/firebase-deploy.yml`).

### 2.6 Testowanie

*   **Unit/Integration Tests:**
    *   Vitest: Szybki framework testowy (choć konkretne testy nie są włączone do kodu do analizy, jest to standardowy wybór w ekosystemie Vite).
    *   firebase-functions-test: Biblioteka do testowania Firebase Functions.
    *   TypeMoq: Biblioteka do mockowania (powszechnie używana z TypeScript).
*   **E2E Tests:**
    *   Firebase Emulator Suite: Umożliwia lokalne testowanie pełnego stosu Firebase.
    *   Niestandardowe skrypty Node.js/HTTP clients (`endpoints-test-http/enpoints-test.http` wskazuje na testowanie endpointów HTTP).
*   **Performance Tests:**
    *   Firebase Performance Monitoring (standardowa usługa Firebase).
    *   Google Cloud Monitoring/Logging (standardowe narzędzia GCP, integrujące się z Firebase Functions).
*   **Środowiska testowe:**
    *   Lokalne (Firebase Emulator Suite).
    *   Środowisko Development / Staging (wdrażane przez CI/CD, choć formalne środowiska staging mogą wykraczać poza MVP).

## 3. Uzasadnienie i Architektura

Wybór stosu technologicznego opiera się na kilku kluczowych zasadach:
*   **Serverless i Firebase Ecosystem:** Maksymalne wykorzystanie usług Firebase (Auth, Firestore, Functions, Hosting) w celu redukcji złożoności infrastruktury, przyspieszenia wdrożenia i obniżenia kosztów operacyjnych.
*   **Nowoczesny Frontend:** Wykorzystanie React 19, TypeScript, Vite i Tailwind/Shadcn do budowy responsywnego, wydajnego i łatwego w rozwoju interfejsu użytkownika.
*   **Serwerowa Logika Wyzwań:** Kluczowe mechanizmy motywacyjne, takie jak codzienne odświeżanie wyzwań, penalizacje i aktualizacje przeciwników, są zaimplementowane po stronie serwera (Firebase Functions), aby zapewnić spójność i niezawodność, niezależnie od aktywności użytkownika w aplikacji. Serwerowy timer wyzwań (weryfikowany po stronie serwera) zapobiega manipulacjom.
*   **PWA First:** Konfiguracja Vite-plugin-PWA umożliwia łatwą instalację aplikacji na urządzeniach mobilnych i potencjalne działanie offline (choć pełne wsparcie offline może wykraczać poza MVP).
*   **Testability:** Zaplanowane użycie narzędzi do testowania (Vitest, firebase-functions-test, Emulator Suite) wspiera tworzenie stabilnego i niezawodnego kodu.

## 4. Opcjonalne rozszerzenia (poza MVP)

*   **GenkitAI:** Integracja z frameworkiem Genkit AI (Firebase) do potencjalnego generowania bardziej spersonalizowanych lub dynamicznych treści wyzwań w przyszłości.
*   Pełne wsparcie offline PWA.
*   Bardziej zaawansowane metryki i analityka w Google Cloud.

Ten stos technologiczny jest dobrze dopasowany do wymagań MVP, zapewniając solidną podstawę dla przyszłego rozwoju projektu FitnessEngine.