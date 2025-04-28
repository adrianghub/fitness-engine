## Plan Testów Projektu: FitnessEngine

**Data:** 2025-04-28
**Wersja:** 1.1

### 1. Podsumowanie Projektu

Projekt FitnessEngine to aplikacja webowa stworzona w technologii React z wykorzystaniem bibliotek takich jak TanStack Router, TanStack Query, Tailwind CSS oraz zestawu komponentów UI. Backend aplikacji bazuje na platformie Google Firebase, wykorzystując Firebase Authentication do zarządzania użytkownikami, Firestore jako bazę danych NoSQL oraz Cloud Functions do realizacji logiki biznesowej po stronie serwera (np. personalizacja profilu, akcje związane z wyzwaniami, pobieranie cytatów).

Główne funkcjonalności aplikacji obejmują:

*   **Autentykacja:** Logowanie użytkowników (obecnie tylko przez Google). Zabezpieczenie tras wymagających uwierzytelnienia.
*   **Personalizacja Profilu:** Proces pierwszego logowania, w którym użytkownik uzupełnia dane takie jak nazwa wyświetlana, poziom zaawansowania, dostępny sprzęt i cele fitness. Dane te są zapisywane w Firestore.
*   **Zarządzanie Wyzwaniami:** Wyświetlanie różnych typów wyzwań (codzienne, uniwersalne, regularne, nieukończone, zakończone) na pulpicie nawigacyjnym. Śledzenie postępu wyzwań w toku za pomocą pływającego timera i na stronie szczegółów wyzwania. Umożliwienie użytkownikom rozpoczęcia, ukończenia, rezygnacji i ponowienia wyzwań.
*   **Tablica Liderów:** Wyświetlanie rankingu użytkowników i wirtualnych przeciwników na podstawie zdobytych punktów.
*   **Wsparcie Offline:** Wykorzystanie persystencji Firestore i kolejkowania operacji zapisu, aby aplikacja działała w trybie offline w pewnym zakresie.
*   **UI/UX:** Nowoczesny interfejs użytkownika z wykorzystaniem komponentów UI, animacji (motion/react), powiadomień (sonner) i okien dialogowych.

### 2. Zakres Testów

Poniżej przedstawiono zakres testów z priorytetyzacją obszarów. W zakresie tym skupiamy się na funkcjonalności i interakcjach na poziomie modułów i tworzonych w projekcie komponentów, pomijając testowanie podstawowych, gotowych komponentów UI.

**Krytyczne (High Priority):**

*   **Autentykacja:**
    *   Pomyślne logowanie przez Google.
    *   Wylogowanie.
    *   Dostęp do chronionych tras tylko po zalogowaniu (test `createProtectedLoader`).
    *   Poprawne przekierowania po zalogowaniu (do personalizacji dla nowych użytkowników, do dashboardu dla istniejących).
    *   Obsługa błędów logowania (interfejs użytkownika i logowanie błędów).
*   **Personalizacja Profilu:**
    *   Pomyślne przejście przez wszystkie kroki formularza personalizacji (`PersonalizationForm`, `DisplayNameStep`, `FitnessLevelStep`, `EquipmentStep`, `GoalsStep`).
    *   Poprawne zapisanie danych profilu w Firestore (via Cloud Function `completeUserProfileEndpoint`).
    *   Walidacja danych wejściowych w każdym kroku formularza (test `FormValidator`).
    *   Poprawne przekierowanie po zakończeniu personalizacji.
    *   Zabezpieczenie trasy personalizacji (dostępna tylko dla niekompletnych profili).
*   **Akcje Wyzwań (Integracja z Cloud Functions):**
    *   Pomyślne rozpoczęcie wyzwania (zmiana statusu, ustawienie `startedAt`, aktualizacja flagi `hasActive` w Firestore, test logiki po stronie Cloud Function).
    *   Pomyślne ukończenie wyzwania (zmiana statusu, przyznanie punktów, aktualizacja leaderboardu, test logiki po stronie Cloud Function `completeChallengeEndpoint`).
    *   Rezygnacja z wyzwania (zmiana statusu, obsługa liczby ponowień, test logiki po stronie Cloud Function `resignChallengeEndpoint`).
    *   Ponowienie nieukończonego wyzwania (zmiana statusu na `in-progress`, reset timera).
*   **Wyświetlanie List Wyzwań (Dashboard):**
    *   Poprawne wyświetlanie wyzwań różnych typów (`DailyChallenge`, `UniversalChallengesList`, `RegularChallengesList`, `UncompletedChallengesList`, `CompletedChallengesList`).
    *   Poprawne wyświetlanie danych wyzwań na kartach (`ChallengeCard`).
    *   Obsługa stanów ładowania i pustych list wyzwań (skeletons, komunikaty).

**Wysoki Priorytet (High Priority):**

*   **Strona Szczegółów Wyzwania (`/challenges/$id`, `ChallengeDetails`, `ChallengeDetailsCard`):**
    *   Poprawne ładowanie szczegółów wyzwania (`useChallengeDetails`, loader).
    *   Wyświetlanie wszystkich szczegółów wyzwania, w tym opisu, punktów, czasu itp.
    *   Renderowanie odpowiednich przycisków akcji w zależności od statusu wyzwania.
    *   Obsługa nieznalezionego wyzwania (error boundary/komunikat).
*   **Timer Wyzwania (`useChallengeTimer`, `FloatingChallengeTimer`, `ChallengeTimer`):**
    *   Poprawne odliczanie czasu dla wyzwania w toku.
    *   Poprawne obliczanie i wyświetlanie paska postępu postępu.
    *   Obsługa stanu wygaśnięcia czasu (UI feedback, wywołanie Cloud Function `checkChallengeExpirationEndpoint`).
    *   Widoczność pływającego timera (`FloatingChallengeTimer`) tylko, gdy istnieje aktywne wyzwanie i użytkownik nie jest na stronie szczegółów tego wyzwania.
    *   Działanie przycisku "Continue" na pływającym timerze.
    *   Obsługa różnych formatów `startedAt` (Timestamp, Date, object).
*   **Tablica Liderów (`Leaderboard`, `useLeaderboardQuery`, `LeaderboardService`):**
    *   Poprawne ładowanie i wyświetlanie danych leaderboardu.
    *   Sortowanie wpisów według punktów.
    *   Poprawne wyświetlanie rankingu, nazw i punktów.
    *   Wyróżnianie wpisu bieżącego użytkownika.
    *   Działanie przycisku "Back to Dashboard".
    *   Działanie funkcji scroll-to-user (`useScrollToUser`) i scroll-to-top.
*   **Wsparcie Offline (`FirestoreService`, persystencja Firebase):**
    *   Testowanie kolejkowania operacji zapisu (`create`, `update`, `delete`) podczas bycia offline.
    *   Testowanie synchronizacji kolejki po przejściu online.
    *   Testowanie dostępu do danych po przejściu offline (dzięki persystencji Firestore).
*   **Obsługa Okien Dialogowych i Powiadomień:**
    *   Prawidłowe wyświetlanie i interakcja z oknem potwierdzenia (`ConfirmationDialog`).
    *   Wyświetlanie powiadomień (toasts) po pomyślnych lub niepomyślnych akcjach (np. ukończenie wyzwania) za pomocą `sonner`.
    *   Działanie Error Boundary (`__root.tsx`) dla nieprzewidzianych błędów.

**Średni Priorytet (Medium Priority):**

*   **Witryna Powitalna (`WelcomeDialog`, `useWelcomeDialog`, `ProfileStep`, `QuickTourStep`):**
    *   Wyświetlanie dialogu tylko dla użytkowników, którzy jeszcze go nie widzieli.
    *   Prawidłowe przejście między krokami.
    *   Zapisanie stanu "widziane" w Local Storage.
    *   Działanie przycisku zamknięcia.
*   **Real-time Sync (`useChallengeSyncFirestore`):**
    *   Testowanie aktualizacji UI i zapytań `react-query` w odpowiedzi na zmiany w Firestore (np. flaga `hasActive`).
*   **Wyświetlanie Informacji o Użytkowniku (`UserGreetings`, `UserFitnessGoals`):**
    *   Poprawne wyświetlanie nazwy użytkownika, poziomu i celów fitness na dashboardzie.

**Niski Priorytet (Low Priority):**

*   **Nagłówek (`Header`):**
    *   Poprawne wyświetlanie logo/nazwy i przycisku wylogowania (jeśli użytkownik zalogowany).
*   **Strony ładowania (`Loader`, `LoadingScreen`):**
    *   Poprawne wyświetlanie wskaźników ładowania w odpowiednich momentach.
*   **Lokalizacja (i18n):**
    *   Podstawowe sprawdzenie, czy teksty są wyświetlane w wybranym języku (PL jako fallback).
*   **Logowanie (logger):**
    *   Weryfikacja, czy logi są generowane w trybie deweloperskim.

**Poza Zakresem Testów:**

*   Testowanie gotowych komponentów UI z zewnętrznych bibliotek (np. sonner).
*   Testowanie infrastruktury Firebase (poza logiką Cloud Functions).
*   Testowanie API ZenQuotes.
*   Testowanie kompatybilności z konkretnymi, niepopularnymi wersjami przeglądarek/systemów operacyjnych.
*   Testy bezpieczeństwa na poziomie infrastruktury chmurowej.
*   Testy obciążeniowe dla Cloud Functions.

### 3. Strategie Testowania

*   **Testy jednostkowe:** Skoncentrowane na izolowanych funkcjach, hookach (zwłaszcza tych z logiką, np. `useChallengeTimer`, `useLoginForm`, `useWelcomeDialog`), walidacjach (`validations.ts`), oraz metodach `FirestoreService` (z mockowaniem wywołań Firebase SDK). Testowanie niestandardowych komponentów UI z mockowaniem ich wewnętrznych zależności. Narzędzia: Jest, React Testing Library. Mockowanie: Jest built-in mocks, potential Mock Service Worker (MSW).
*   **Testy integracyjne:** Skupione na interakcjach między modułami frontendowymi (np. hook -> komponent, hook -> hook, hook -> react-query) oraz integracji frontend-Cloud Functions/Firestore (mockowanie tylko zewnętrznych systemów lub użycie emulatorów). Testy integracji Cloud Functions <-> Firestore powinny być testowane po stronie backendu. Narzędzia: Jest, React Testing Library, Firebase Emulators.
*   **Testy End-to-End (E2E):** Symulacja pełnych ścieżek użytkownika przez aplikację. Testowanie przepływów:
    *   Pierwszy użytkownik (logowanie -> personalizacja -> dashboard).
    *   Powracający użytkownik (logowanie -> dashboard).
    *   Użytkownik w trakcie wyzwania (logowanie -> strona wyzwania).
    *   Cykl życia wyzwania (start -> in-progress -> complete/resign/uncompleted).
    *   Nawigacja między kluczowymi stronami (dashboard, leaderboard, challenge details).
    *   Testowanie w trybie offline (E2E symulacja).
    Narzędzia: Cypress lub Playwright.
*   **Testy Wydajnościowe:** Pomiar czasów ładowania stron (szczególnie dashboardu i leaderboardu), czasu odpowiedzi interfejsu po akcjach użytkownika (kliknięcia w przyciski, wypełnianie formularza), płynności animacji. Narzędzia: Browser Developer Tools (Performance, Network), Lighthouse.
*   **Testy Bezpieczeństwa:** Sprawdzenie, czy mechanizmy uwierzytelnienia działają poprawnie (np. próba dostępu do `/dashboard` bez logowania), czy dane użytkownika są niedostępne dla innych użytkowników (wymaga testowania z wieloma użytkownikami), podstawowa walidacja danych po stronie Cloud Functions.
*   **Testy Regresji:** Po każdej większej zmianie lub przed wydaniem, uruchomienie zestawu kluczowych testów jednostkowych, integracyjnych i E2E, aby upewnić się, że istniejące funkcjonalności nie zostały zepsute.

### 4. Wymagane Środowiska Testowe

*   **Środowisko deweloperskie (Local):**
    *   Lokalne uruchomienie aplikacji React (`npm run dev`).
    *   Uruchomione Firebase Emulators (Auth, Firestore, Functions).
    *   Wymagane do testów jednostkowych, integracyjnych oraz lokalnych testów E2E/manualnych.
*   **Środowisko stagingowe:**
    *   Wdrożona wersja aplikacji połączona z dedykowanym projektem Firebase (nie produkcyjnym).
    *   Dostępne publicznie (lub w ramach sieci wewnętrznej/VPN).
    *   Wymagane do testów E2E, wydajnościowych, bezpieczeństwa oraz testów manualnych w warunkach zbliżonych do produkcyjnych.
*   **Środowisko produkcyjne:**
    *   Testy przeprowadzane po wdrożeniu produkcyjnym w celu weryfikacji kluczowych funkcjonalności (Smoke Testing, Health Check).

**Dodatkowe wymagania środowiskowe:**

*   Dostęp do przeglądarek desktopowych (Chrome, Firefox, Edge, Safari - zależnie od wymagań projektu).
*   Dostęp do urządzeń mobilnych lub emulatorów/symulatorów dla testów responsywności.
*   Możliwość symulowania warunków sieciowych (np. w narzędziach deweloperskich przeglądarek) dla testów offline/wydajności.

### 5. Narzędzia Testowe

*   **Zarządzanie Testami/Błędami:** Jira, Asana, Trello lub GitHub Issues.
*   **Testy Jednostkowe/Integracyjne:** Jest, React Testing Library.
*   **Mockowanie:** Jest mocks, Mock Service Worker (MSW), typowane moki Firebase SDK.
*   **Testy E2E:** Cypress lub Playwright.
*   **Testy Wydajnościowe:** Browser Developer Tools (Performance/Network Tab), Google Lighthouse.
*   **Testy API/Functions:** Postman, curl.
*   **Analiza Kodu/Statyczna:** ESLint, Prettier, TypeScript compiler.
*   **Środowiska Developerskie Firebase:** Firebase CLI (do uruchamiania emulatorów), Firebase Console (do weryfikacji danych i logów).

### 6. Przypadki Testowe (Przykłady)

Poniżej znajduje się 10-15 kluczowych przypadków testowych obejmujących krytyczne i wysokopriorytetowe obszary, z uwzględnieniem wyłączenia testowania prymitywnych komponentów UI.

| ID     | Moduł/Funkcja           | Opis Przypadku Testowego                                   | Kroki Testowe                                                                                                                               | Dane Wejściowe/Pre-warunki                                                                 | Oczekiwany Rezultat                                                                                                                               | Priorytet |
| :----- | :---------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :-------- |
| TC-001 | Authentication          | Pomyślne logowanie przez Google dla nowego użytkownika.   | 1. Otwórz stronę logowania. 2. Kliknij przycisk do logowania przez Google. 3. Zaloguj się kontem Google nieużywanym wcześniej w aplikacji.            | Nowe konto Google. Aplikacja w stanie niezalogowanym.                                        | Użytkownik zostaje pomyślnie zalogowany i przekierowany do strony personalizacji (`/personalization`).                                          | Krytyczny |
| TC-002 | Authentication          | Dostęp do chronionej trasy bez logowania.                 | 1. Wyczyść dane przeglądarki (cookies, local storage) lub użyj incognito. 2. Spróbuj przejść bezpośrednio do `/dashboard`.                  | Brak aktywnej sesji użytkownika.                                                          | Użytkownik zostaje przekierowany do `/login` ze zmienną `redirect` ustawioną na `/dashboard`.                                                | Krytyczny |
| TC-003 | Personalizacja Profilu  | Pomyślne ukończenie personalizacji i przekierowanie.     | 1. Zaloguj się jako nowy użytkownik (przekierowanie na `/personalization`). 2. Uzupełnij dane w każdym kroku formularza personalizacji. 3. Kliknij przycisk "Next" lub "Start Your Journey" w odpowiednich krokach.                  | Użytkownik zalogowany, profil nieukończony (`isProfileComplete: false`).                   | Dane profilu zostają zapisane w Firestore (via Cloud Function). Użytkownik zostaje przekierowany do `/dashboard`. Flaga `isProfileComplete` jest `true`. | Krytyczny |
| TC-004 | Personalizacja Profilu  | Walidacja pól w formularzu personalizacji.                 | 1. Przejdź do kroku 1 personalizacji. 2. Pozostaw pole tekstowe "Display Name" puste i kliknij "Next". 3. Przejdź do kroku 2. Nie wybieraj przycisku radiowego dla poziomu i kliknij "Next". | Użytkownik na stronie personalizacji.                                                        | Przycisk "Next" jest nieaktywny, a pod polem "Display Name" pojawia się komunikat o błędzie. Przycisk "Next" jest nieaktywny na kroku 2.   | Wysoki    |
| TC-005 | Dashboard/Challenges    | Wyświetlanie wyzwań na dashboardzie.                       | 1. Zaloguj się jako użytkownik z przypisanymi różnymi typami wyzwań (daily, regular, universal, uncompleted, completed).                    | Użytkownik zalogowany, profil ukończony. Dane wyzwań istnieją w Firestore.             | Karty wyzwań (`ChallengeCard`) są grupowane i wyświetlane poprawnie według ich typów i statusów. Informacje na kartach są poprawne. Przyciski akcji są odpowiednie dla statusu wyzwania.             | Krytyczny |
| TC-006 | Challenge Details       | Rozpoczęcie wyzwania z dashboardu.                         | 1. Zaloguj się. 2. Na dashboardzie znajdź kartę wyzwania w statusie "not-started". 3. Kliknij przycisk "Start Exercise" na tej karcie.         | Użytkownik zalogowany. Wyzwanie w statusie "not-started".                               | Użytkownik zostaje przekierowany na stronę szczegółów wyzwania (`/challenges/$id`). Status wyzwania w Firestore zmienia się na "in-progress". Timer zaczyna odliczanie. | Krytyczny |
| TC-007 | Challenge Details/Timer | Timer wyzwania w toku i jego wygaśnięcie.                  | 1. Rozpocznij wyzwanie z krótkim, zdefiniowanym czasem (`expectedTime`). 2. Obserwuj timer (`ChallengeTimer`) na stronie szczegółów. 3. Czekaj do upływu czasu.   | Wyzwanie w statusie "in-progress" z ustawionym `startedAt` i krótkim `expectedTime`.     | Timer odlicza poprawnie, format czasu jest prawidłowy. Po upływie czasu, timer zatrzymuje się na 00:00. Wywołana zostaje Cloud Function sprawdzająca wygaśnięcie. Status wyzwania aktualizuje się w UI (na uncompleted lub completed - zależnie od logiki CF). | Krytyczny |
| TC-008 | Challenge Details       | Ukończenie wyzwania w toku.                                | 1. Rozpocznij wyzwanie. 2. Kliknij przycisk "Complete Challenge" na stronie szczegółów. 3. Potwierdź akcję w oknie dialogowym potwierdzenia.                                      | Wyzwanie w statusie "in-progress".                                                      | Pojawia się okno dialogowe potwierdzenia (`ConfirmationDialog`). Po potwierdzeniu (kliknięcie przycisku akcji w dialogu), wywoływana jest Cloud Function do ukończenia wyzwania. Status wyzwania zmienia się na "completed". Punkty zostają przyznane. Użytkownik zostaje przekierowany (domyślnie do Leaderboardu). | Krytyczny |
| TC-009 | Challenge Details       | Rezygnacja z wyzwania w toku (z ponowieniami).              | 1. Rozpocznij wyzwanie (np. dzienne z domyślnymi ponowieniami). 2. Kliknij przycisk "Give Up" na stronie szczegółów. 3. Potwierdź akcję w oknie dialogowym.                             | Wyzwanie w statusie "in-progress". Użytkownik ma dostępne ponowienia (`retriesLeft > 0`). | Pojawia się okno dialogowe potwierdzenia (`ConfirmationDialog`) z informacją o ponowieniach. Po potwierdzeniu (kliknięcie przycisku akcji), status wyzwania zmienia się na "uncompleted". Liczba `retriesLeft` jest zmniejszona. Użytkownik zostaje przekierowany do dashboardu. | Wysoki    |
| TC-010 | Challenge Details       | Ponowienie nieukończonego wyzwania.                        | 1. Ukończ przypadek TC-009. 2. Na dashboardzie znajdź kartę nieukończonego wyzwania. 3. Kliknij przycisk "Try Again" na tej karcie.                               | Wyzwanie w statusie "uncompleted" z `retriesLeft > 0`.                                    | Status wyzwania zmienia się na "in-progress". `startedAt` jest aktualizowane na obecny czas. Użytkownik zostaje przekierowany na stronę szczegółów wyzwania. | Wysoki    |
| TC-011 | Universal Challenges    | Ukończenie wyzwania uniwersalnego.                         | 1. Na dashboardzie znajdź kartę nieukończonego wyzwania uniwersalnego. 2. Kliknij przycisk "Mark as done". 3. Potwierdź w oknie dialogowym potwierdzenia.                       | Użytkownik zalogowany. Wyzwanie uniwersalne w statusie innym niż "completed".    | Pojawia się okno dialogowe potwierdzenia (`ConfirmationDialog`). Po potwierdzeniu (kliknięcie przycisku akcji), status wyzwania zmienia się na "completed". Wyzwanie jest wizualnie oznaczone jako ukończone na liście. Punkty zostają przyznane. | Wysoki    |
| TC-012 | Leaderboard             | Wyświetlanie tablicy liderów i podświetlanie użytkownika.   | 1. Zaloguj się jako użytkownik z punktami. 2. Przejdź do `/leaderboard`.                                                                   | Użytkownik zalogowany. Dane w kolekcji `leaderboard` w Firestore.                         | Tablica liderów (`Leaderboard`) ładuje się poprawnie, wyświetlając ranking użytkowników i przeciwników. Wpis bieżącego użytkownika jest podświetlony. Działają funkcje przewijania (`useScrollToUser`).        | Krytyczny |
| TC-013 | Offline Mode            | Kolejkowanie i synchronizacja operacji zapisu w trybie offline. | 1. Zaloguj się. 2. Przejdź do dashboardu. 3. Przełącz tryb offline w narzędziach deweloperskich przeglądarki. 4. Spróbuj rozpocząć wyzwanie (kliknij przycisk "Start Exercise"). 5. Przełącz tryb online. | Użytkownik zalogowany.                                                                    | Akcja rozpoczęcia wyzwania nie następuje od razu (może pojawić się komunikat o kolejkowaniu). Po przejściu online, operacja zostaje wykonana (status wyzwania zmienia się). Toast potwierdza synchronizację. | Wysoki    |
| TC-014 | UI/UX                   | Witryna Powitalna dla nowego użytkownika.                     | 1. Wyczyść Local Storage. 2. Zaloguj się. 3. Ukończ personalizację.                                                                         | Brak wpisu `hasSeenWelcome` w Local Storage.                                              | Po ukończeniu personalizacji, pojawia się okno dialogowe (`WelcomeDialog`). Można przejść między krokami (klikając "Next") lub zamknąć dialog (klikając przycisk zamknięcia). Zamknięcie zapisuje stan w Local Storage. | Średni    |
| TC-015 | Routing/Protected       | Próba dostępu do strony personalizacji z ukończonym profilem. | 1. Zaloguj się jako użytkownik z ukończonym profilem. 2. Spróbuj przejść bezpośrednio do `/personalization` (np. wpisując URL).                               | Użytkownik zalogowany, profil ukończony (`isProfileComplete: true`).                      | Użytkownik zostaje przekierowany do `/dashboard`.                                                                                               | Wysoki    |

### 7. Harmonogram Testów (Propozycja)

Harmonogram testów jest ściśle powiązany z cyklem życia deweloperskiego projektu (np. w sprintach). Poniższy harmonogram jest sugestią i powinien być dostosowany do konkretnych faz rozwoju.

*   **Faza 1: Testowanie Jednostkowe i Integracyjne (W trakcie rozwoju)**
    *   Deweloperzy piszą testy jednostkowe i podstawowe testy integracyjne dla swoich modułów, hooków i niestandardowych komponentów.
    *   QA wspiera w pisaniu testów integracyjnych, zwłaszcza tych obejmujących przepływ danych między komponentami/hookami a usługami.
    *   Czas: Ciągły proces podczas developmentu.

*   **Faza 2: Testowanie Funkcjonalne (QA Build / Po zakończeniu sprintu)**
    *   Wdrożenie na środowisko stagingowe.
    *   QA wykonuje testy manualne oparte na przypadkach testowych (sekcja 6).
    *   QA tworzy dodatkowe przypadki testowe dla specyficznych scenariuszy i edge cases.
    *   Czas: 1-3 dni na moduł/sprint (zależnie od złożoności).

*   **Faza 3: Testowanie E2E i Niefunkcjonalne**
    *   Implementacja kluczowych testów E2E.
    *   Testy wydajnościowe kluczowych ścieżek (czas ładowania stron, płynność interakcji).
    *   Testy bezpieczeństwa (zwłaszcza uwierzytelnienia i autoryzacji).
    *   Testowanie offline mode E2E.
    *   Czas: 2-4 dni na sprint/po integracji większej funkcjonalności.

*   **Faza 4: Testy Regresji**
    *   Uruchomienie pełnego zestawu testów jednostkowych i integracyjnych.
    *   Uruchomienie zestawu kluczowych testów E2E (Smoke & Critical Path tests).
    *   Czas: 0.5-1 dzień przed każdym większym wdrożeniem.

*   **Faza 5: Testy Akceptacyjne (UAT - User Acceptance Testing)**
    *   Jeśli wymagane, przedstawienie aplikacji użytkownikom biznesowym/końcowym do weryfikacji zgodności z wymaganiami.
    *   Czas: Zależny od dostępności interesariuszy.

### 8. Zarządzanie Błędami

*   **Identyfikacja:** Błędy mogą być identyfikowane przez deweloperów (podczas testów jednostkowych/integracyjnych), QA (testy funkcjonalne, E2E, niefunkcjonalne) lub użytkowników końcowych (po wdrożeniu produkcyjnym).
*   **Raportowanie:** Błędy będą raportowane w wybranym narzędziu do zarządzania projektami (np. Jira/GitHub Issues). Każdy błąd powinien zawierać:
    *   Jasny tytuł i opis.
    *   Kroki do reprodukcji.
    *   Środowisko testowe (local, staging, prod).
    *   Specyfikacja przeglądarki/urządzenia.
    *   Załączniki (screenshoty, filmy, logi z konsoli przeglądarki).
    *   Priorytet i/lub poziom ważności.
    *   Przypisanie do odpowiedniego modułu/komponentu.
*   **Priorytetyzacja:** Błędy będą priorytetyzowane w oparciu o ich wpływ na funkcjonalność i użyteczność aplikacji:
    *   **Bloker:** Uniemożliwia dalsze testowanie kluczowej funkcjonalności.
    *   **Krytyczny:** Poważna awaria funkcji, brak możliwości użycia kluczowej części aplikacji.
    *   **Wysoki:** Błąd wpływa na funkcjonalność, ale istnieje obejście lub inne części aplikacji działają poprawnie.
    *   **Średni:** Błąd w funkcjonalności, wpływający na UX, ale nie blokujący głównego przepływu.
    *   **Niski:** Błąd kosmetyczny, literówka, drobne problemy UX, które nie wpływają na funkcjonalność.
*   **Naprawa i Weryfikacja:** Deweloperzy naprawiają błędy zgodnie z priorytetem. QA weryfikuje naprawione błędy na odpowiednim środowisku, a następnie zamyka zgłoszenie.
*   **Regresja:** Po naprawie kluczowych błędów przeprowadzany jest mini-test regresji obszaru, którego dotyczył błąd.

### 9. Kryteria Akceptacji

Testy mogą zostać uznane za zakończone, a aplikacja gotowa do wdrożenia na wyższe środowisko lub produkcję, gdy zostaną spełnione następujące kryteria:

*   Wszystkie przypadki testowe o priorytecie "Krytyczny" i "Wysoki" przeszły pomyślnie na środowisku stagingowym.
*   Żaden błąd o statusie "Bloker" lub "Krytyczny" nie jest otwarty.
*   Liczba otwartych błędów o statusie "Wysoki" jest poniżej ustalonego progu (np. 0-2, zależnie od decyzji biznesowej).
*   Testy E2E dla kluczowych ścieżek przeszły pomyślnie.
*   Wyniki testów wydajnościowych dla kluczowych ścieżek mieszczą się w akceptowalnych granicach (np. czas ładowania strony < 3 sekundy na dobrym połączeniu, płynność < 50ms lag).
*   Testy bezpieczeństwa nie wykazały krytycznych luk w implementacji aplikacji.
*   Pokrycie testami jednostkowymi dla kluczowych modułów biznesowych i hooków wynosi co najmniej 80% (lub inny zdefiniowany cel).

### 10. Metryki Jakości

Podczas procesu testowego będą zbierane następujące metryki w celu oceny jakości oprogramowania i efektywności procesu testowania:

*   **Procent przejścia przypadków testowych:** (Liczba pomyślnych przypadków testowych / Całkowita liczba przypadków testowych) \* 100%. Mierzone dla różnych priorytetów.
*   **Liczba znalezionych błędów:** Całkowita liczba zgłoszonych błędów.
*   **Rozkład błędów według ważności:** Liczba błędów w kategoriach Bloker, Krytyczny, Wysoki, Średni, Niski.
*   **Średni czas do naprawy błędu (MTTR - Mean Time To Resolution):** Czas od zgłoszenia błędu do jego zamknięcia.
*   **Gęstość błędów:** Liczba błędów na jednostkę kodu (np. na 1000 linii kodu) lub na funkcjonalność.
*   **Pokrycie kodu testami:** Procent kodu pokrytego testami jednostkowymi/integracyjnymi (szczególnie dla logiki biznesowej i hooków).
*   **Czas wykonania testów automatycznych:** Czas potrzebny na wykonanie pełnego zestawu testów automatycznych (jednostkowych, integracyjnych, E2E).
*   **Czas ładowania kluczowych stron/komponentów.**

Metryki te będą regularnie analizowane, aby identyfikować obszary wymagające poprawy, zarówno w kodzie, jak i w procesie deweloperskim/testowym.

---

Ten plan testów, z naciskiem na logikę aplikacji i niestandardowe komponenty, stanowi solidną podstawę do zapewnienia jakości aplikacji FitnessEngine. Jest on elastyczny i powinien być aktualizowany w miarę ewolucji projektu i wymagań.