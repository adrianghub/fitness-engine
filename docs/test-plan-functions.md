
# Plan Testów: Fitness Engine Cloud Functions

**Wersja:** 1.0
**Data:** 2025-04-27

### 1. Podsumowanie projektu

Projekt "Fitness Engine Cloud Functions" stanowi backend aplikacji mobilnej lub webowej, odpowiedzialny za kluczowe procesy biznesowe związane z zarządzaniem użytkownikami, wyzwaniami (challenges), przeciwnikami (opponents) oraz mechanizmami progresji i punktacji. Projekt opiera się na platformie Firebase, wykorzystując Firebase Cloud Functions do implementacji logiki po stronie serwera oraz Firestore jako bazę danych. Kluczowe funkcjonalności obejmują personalizację użytkownika, generowanie wyzwań i przeciwników, mechanizmy awansu użytkownika na wyższe poziomy, codzienną aktualizację wyzwań (w tym nakładanie kar i utrzymanie rankingów), a także obsługę zakończenia i rezygnacji z wyzwań. Projekt korzysta z TypeScript dla bezpieczeństwa typów oraz z Genkit AI do generowania treści.

### 2. Zakres testów

Zakres testów obejmuje wszystkie funkcje zaimplementowane w ramach modułu `functions`, w tym funkcje HTTP, triggery Firestore oraz funkcje zaplanowane (scheduled functions). Testy skoncentrują się na weryfikacji logiki biznesowej, interakcji z bazą danych Firestore oraz poprawności działania w środowisku chmurowym.

**Komponenty wchodzące w zakres testów:**

*   **Handlers (Logika Biznesowa):**
    *   `personalization.ts`: Logika personalizacji użytkownika.
    *   `generateChallenges.ts`: Generowanie nowych wyzwań dla użytkowników.
    *   `generateOpponents.ts`: Generowanie przeciwników.
    *   `promoteUser.ts`: Logika awansu użytkownika na wyższy poziom.
    *   `refreshChallenges.ts`: Codzienne odświeżanie wyzwań (kary, nowe wyzwania, aktualizacja przeciwników, rankingi). **(Priorytet: Wysoki - Krytyczna ścieżka)**
    *   `completeChallenge.ts`: Obsługa zakończenia wyzwania. **(Priorytet: Wysoki - Krytyczna ścieżka)**
    *   `expireChallenge.ts`: Obsługa wygaśnięcia wyzwania. **(Priorytet: Wysoki - Krytyczna ścieżka)**
    *   `resignChallenge.ts`: Obsługa rezygnacji z wyzwania.
    *   `manageUniversalChallenges.ts`: Zarządzanie uniwersalnymi wyzwaniami.
    *   `manualLevelUp.ts`: Ręczne wyzwalanie awansu (HTTP).
    *   `seedChallengeTemplates.ts`: Seedowanie szablonów wyzwań (HTTP).
    *   `seedUniversalChallenges.ts`: Seedowanie uniwersalnych wyzwań (HTTP).
*   **Firestore Triggers:**
    *   `onUserProfileComplete`: Trigger po zakończeniu konfiguracji profilu. **(Priorytet: Wysoki - Krytyczna ścieżka)**
*   **Scheduled Functions:**
    *   `dailyChallengeAndOpponentUpdate`: Codzienna funkcja aktualizacyjna. **(Priorytet: Wysoki - Krytyczna ścieżka)**
*   **Utils:**
    *   `challenges.ts`: Funkcje pomocnicze związane z wyzwaniami.
    *   `date-utils.ts`: Funkcje pomocnicze związane z datami (np. sprawdzanie wygaśnięcia).
    *   `opponents.ts`: Funkcje pomocnicze związane z przeciwnikami.
    *   `parseAIResponse.ts`: Parsing odpowiedzi z AI.
*   **Services:**
    *   `ai.ts`: Integracja z modelem AI (Genkit AI).
*   **Data:**
    *   Weryfikacja poprawności struktury danych statycznych (`challenge-templates.ts`, `opponents.ts`, `universal-challenges.ts`).
*   **Type Safety:** Weryfikacja poprawności generowania i używania typów (`models.ts`).

**Komponenty poza zakresem testów w tym planie:**

*   Testy interfejsu użytkownika (UI) aplikacji klienckiej.
*   Testy infrastruktury chmurowej poza funkcjami (np. konfiguracja Firebase Security Rules, konfiguracja baz danych - choć interakcje będą testowane).
*   Testy Genkit AI jako zewnętrznego serwisu (skupiamy się na integracji i parsowaniu odpowiedzi).

### 3. Strategie testowania

Zastosujemy kombinację strategii testowania, aby zapewnić wysoką jakość kodu i stabilność działania w środowisku chmurowym.

*   **Testy jednostkowe (Unit Tests):**
    *   Skupią się na testowaniu pojedynczych funkcji lub metod w izolacji (np. funkcje pomocnicze w `utils`, specyficzne fragmenty logiki w handlerach).
    *   Wykorzystają mocki i stuby dla zewnętrznych zależności (np. wywołania do Firestore, usług AI, daty/czasu).
    *   Celem jest weryfikacja poprawności logiki, obliczeń (np. punktacji, kar), walidacji danych wejściowych i obsługi przypadków brzegowych.
    *   **Metryka:** Pokrycie kodu (Code Coverage).

*   **Testy integracyjne (Integration Tests):**
    *   Skupią się na testowaniu interakcji między różnymi komponentami (np. handler wywołujący usługę AI, trigger Firestore wywołujący handler).
    *   Wykorzystają Firebase Emulator Suite do testowania funkcji Cloud Functions i ich interakcji z emulowanymi usługami Firebase (Firestore, Auth, Scheduled Functions).
    *   Celem jest weryfikacja poprawności przepływu danych między komponentami i ich wspólnego działania.

*   **Testy end-to-end (E2E Tests):**
    *   Zasymulują pełne ścieżki użytkownika lub procesy systemowe (np. użytkownik kończy profil -> system generuje wyzwania -> użytkownik kończy wyzwanie -> punkty są przyznawane -> awans na poziom).
    *   Będą uruchamiane na dedykowanym środowisku testowym (staging).
    *   Wykorzystają bezpośrednie wywołania funkcji HTTP oraz manipulacje w emulowanym lub testowym Firestore, aby wyzwolić triggery i zaplanowane funkcje.
    *   **Szczególna uwaga na krytyczne ścieżki:** Pełny cykl życia wyzwania (generacja -> zakończenie/rezygnacja/wygaśnięcie), proces codziennej aktualizacji, ścieżka awansu użytkownika.

*   **Testy wydajnościowe (Performance Tests):**
    *   Skupią się na identyfikacji potencjalnych wąskich gardeł wydajnościowych, w szczególności dla funkcji wywoływanych często lub przetwarzających duże ilości danych (np. `dailyChallengeAndOpponentUpdate`, `generateChallenges`).
    *   Zmierzą czas wykonania funkcji, zużycie pamięci i CPU pod obciążeniem.
    *   Wykorzystają narzędzia do testowania obciążenia wywołujące funkcje HTTP/Firebase APIs oraz monitoring Google Cloud.

*   **Testy bezpieczeństwa (Security Tests):**
    *   Skoncentrują się na weryfikacji poprawności implementacji mechanizmów bezpieczeństwa:
        *   Autoryzacja i uwierzytelnianie: Czy funkcje wymagające uwierzytelnienia blokują nieautoryzowany dostęp? (Implikowane przez Firebase Auth/App Check, ale testowane na poziomie funkcji).
        *   Kontrola dostępu do danych: Czy funkcje modyfikują dane w Firestore zgodnie z uprawnieniami użytkownika? (Weryfikacja działania funkcji w kontekście Security Rules - *zakładając ich istnienie, nawet jeśli nie widać ich w kodzie*).
        *   Bezpieczeństwo danych wejściowych: Czy dane wejściowe są poprawnie walidowane i oczyszczane, aby zapobiec atakom (np. wstrzyknięcie)?
        *   Testowanie rate limiting (jeśli zaimplementowane).
        *   Testowanie uprawnień Cloud Functions.
    *   Obszary wysokiego ryzyka bezpieczeństwa: Każda funkcja modyfikująca dane użytkownika, wyzwań, punktacji, czy mająca dostęp do zewnętrznych serwisów (AI).

*   **Testy danych (Data Tests):**
    *   Weryfikacja poprawności danych statycznych używanych przez funkcje (np. szablony wyzwań).
    *   Weryfikacja spójności danych w Firestore po operacjach funkcji (np. czy punkty są poprawnie sumowane, czy status wyzwania jest aktualny).

*   **Testy regresji (Regression Tests):**
    *   Zestaw kluczowych testów (głównie E2E i integracyjnych na krytyczne ścieżki), które będą regularnie uruchamiane po każdej zmianie w kodzie, aby upewnić się, że nowe zmiany nie wprowadziły defektów w istniejących, działających funkcjonalnościach.

### 4. Wymagane środowiska testowe

*   **Środowisko lokalne (Development/Debugging):**
    *   Lokalne uruchomienie Firebase Emulator Suite (Authentication, Firestore, Cloud Functions, Scheduled Functions).
    *   Wykorzystywane do szybkich testów jednostkowych, integracyjnych i debugowania.
    *   Wymaga Node.js v22+, Firebase Tools.
*   **Środowisko deweloperskie (Development/Feature Testing):**
    *   Dedykowany projekt Firebase w chmurze (lub środowisko nieprodukcyjne w ramach większego projektu) dla zespołu deweloperskiego/QA.
    *   Używane do testowania nowych funkcjonalności w realistycznym środowisku chmurowym.
    *   Może być używane do testów wydajnościowych i bezpieczeństwa w mniejszej skali.
*   **Środowisko stagingowe (Staging/Pre-production):**
    *   Środowisko jak najbardziej zbliżone do produkcyjnego, z własnym projektem Firebase.
    *   Używane do pełnych testów E2E, testów wydajnościowych pod obciążeniem i testów bezpieczeństwa przed wdrożeniem na produkcję.
    *   Dostępne dla wszystkich interesariuszy do testów akceptacyjnych.
*   **Środowisko produkcyjne (Production):**
    *   Główne środowisko aplikacji.
    *   Minimalne testy dymne (smoke tests) po wdrożeniu, monitorowanie wydajności i błędów.

### 5. Narzędzia testowe

*   **Testy jednostkowe/integracyjne:**
    *   **Vitest:** Framework testowy.
    *   **`firebase-functions-test`:** Oficjalna biblioteka do mockowania i testowania funkcji Firebase.
    *   **TypeMoq lub inne biblioteki do mockowania/stubowania:** W zależności od potrzeb.
*   **Testy integracyjne/E2E:**
    *   **Firebase Emulator Suite:** Niezbędny do lokalnego testowania pełnego stosu Firebase.
    *   **Custom Node.js scripts:** Do wywoływania funkcji HTTP i interakcji z emulowanym/testowym Firestore w celach E2E.
    *   **HTTP client (np. `axios`, `fetch`):** Do wywoływania funkcji HTTP.
*   **Testy wydajnościowe:**
    *   **Firebase Performance Monitoring:** Wbudowane narzędzie Firebase.
    *   **Google Cloud Monitoring/Logging:** Do analizy metryk i logów funkcji.
    *   **Narzędzia do testowania obciążenia (np. Artillery, k6):** Do symulowania dużego ruchu na funkcjach HTTP/API.
*   **Testy bezpieczeństwa:**
    *   **Manual Review:** Przegląd kodu i konfiguracji (Firebase Security Rules).
    *   **Zautomatyzowane skanery bezpieczeństwa (opcjonalnie):** Do analizy kodu lub środowiska chmurowego.
    *   **Testowanie uprawnień:** Weryfikacja, czy funkcje są wywoływane z odpowiednimi uprawnieniami.
*   **Linting/Typing:**
    *   **ESLint:** Analiza statyczna kodu (już zaimplementowana).
    *   **TypeScript Compiler:** Weryfikacja poprawności typów (już zaimplementowana).
*   **Zarządzanie testami i błędami:**
    *   **System śledzenia błędów (np. Jira, Asana, GitHub Issues):** Do raportowania, priorytetyzacji i śledzenia defektów.
    *   **System zarządzania testami (opcjonalnie, np. TestRail, Zephyr):** Do zarządzania przypadkami testowymi i cyklami testowymi.

### 6. Przypadki testowe (Przykładowe 10-15 najważniejszych)

Poniżej przedstawiono przykładowe, kluczowe przypadki testowe obejmujące krytyczne ścieżki i obszary ryzyka.

| ID     | Moduł/Funkcja           | Opis przypadku testowego                                                                 | Dane wejściowe/Warunki wstępne                                                                 | Oczekiwany rezultat                                                                                                | Priorytet | Typ Testu        | Uwagi                                        |
| :----- | :---------------------- | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :-------- | :--------------- | :------------------------------------------- |
| FC-001 | `onUserProfileComplete` | Weryfikacja triggera po zakończeniu profilu użytkownika.                               | Nowy użytkownik kończy proces konfiguracji profilu (dokument użytkownika w Firestore jest aktualizowany). | Trigger uruchamia się; generowane są początkowe wyzwania i przeciwnicy dla użytkownika w Firestore.                | Wysoki    | Integracyjny     | Test na emulatorze lub środowisku dev/staging |
| FC-002 | `dailyUpdate`           | Weryfikacja kar za niewykonane wyzwania podczas codziennej aktualizacji.                | Użytkownik ma aktywne wyzwania, które wygasły bez zakończenia.                                 | Funkcja nalicza odpowiednie kary punktowe, status wyzwań jest aktualizowany na "uncompleted" lub "failed" (jeśli retries exhausted). | Wysoki    | Integracyjny/E2E | Test zaplanowanej funkcji.                   |
| FC-003 | `dailyUpdate`           | Weryfikacja generowania nowych wyzwań po codziennej aktualizacji.                        | Użytkownik ma mniej niż maksymalna liczba aktywnych wyzwań po naliczeniu kar.                | Funkcja generuje nowe wyzwania dla użytkownika do osiągnięcia limitu.                                              | Wysoki    | Integracyjny/E2E | Zależny od FC-002.                           |
| FC-004 | `completeChallenge`     | Pomyślne zakończenie wyzwania przez użytkownika.                                         | Użytkownik wysyła żądanie zakończenia aktywnego wyzwania z poprawnymi danymi.                   | Punkty są naliczane poprawnie; status wyzwania zmienia się na "completed"; potencjalnie triggeruje awans poziomu. | Wysoki    | Integracyjny/E2E | Weryfikacja obliczeń punktowych.             |
| FC-005 | `completeChallenge`     | Zakończenie wyzwania z niepoprawnymi danymi (np. poza zakresem, nieprawidłowy format). | Użytkownik wysyła żądanie zakończenia wyzwania z danymi, które nie przechodzą walidacji.    | Funkcja odrzuca żądanie, zwraca błąd walidacji. Stan wyzwania pozostaje niezmieniony.                               | Wysoki    | Integracyjny     | Negatywny przypadek testowy.                 |
| FC-006 | `expireChallenge`       | Weryfikacja wygaśnięcia wyzwania wyzwalanego przez klienta (w ciągu dnia).             | Klient wyzwala funkcję `expireChallenge` dla wyzwania, którego czas minął.                 | Funkcja weryfikuje czas na serwerze, zwiększa licznik prób (`retries`). Status zmienia się na "uncompleted".     | Wysoki    | Integracyjny/E2E | Weryfikacja logiki retry.                    |
| FC-007 | `expireChallenge`       | Wygaśnięcie wyzwania po 3 próbach (`retries`).                                          | Użytkownik ma wyzwanie oznaczone jako "uncompleted" z 3 próbami (`retries = 3`).            | Funkcja `expireChallenge` nie pozwala na kolejną próbę, wyzwanie pozostaje "uncompleted" do daily update.        | Wysoki    | Integracyjny     | Negatywny przypadek retry.                   |
| FC-008 | `promoteUser`           | Pomyślny awans użytkownika na wyższy poziom.                                             | Użytkownik spełnia kryteria awansu (np. wystarczająca liczba punktów, wywołanie `promoteUser` z triggera lub manualnie). | Poziom użytkownika jest zwiększany; potencjalnie generowane są nowe wyzwania; dane użytkownika są aktualizowane. | Wysoki    | Integracyjny/E2E | Weryfikacja logiki progów punktowych.        |
| FC-009 | `dailyUpdate`           | Weryfikacja aktualizacji rankingów (Leaderboard) podczas codziennej aktualizacji.        | Istnieją użytkownicy z różną punktacją i poziomami.                                        | Rankingi użytkowników w Firestore są aktualizowane na podstawie ich punktacji/poziomu.                           | Wysoki    | Integracyjny/E2E | Weryfikacja sortowania i struktury rankingów. |
| FC-010 | `seedChallengeTemplates` | Pomyślne seedowanie szablonów wyzwań poprzez endpoint HTTP.                             | Wywołanie endpointu HTTP `seedChallengeTemplates` z poprawnymi danymi autoryzacyjnymi.    | Dane szablonów wyzwań są dodawane/aktualizowane w Firestore.                                                        | Średni    | E2E              | Weryfikacja dostępu HTTP i operacji Firestore. |
| FC-011 | `resignChallenge`       | Rezygnacja z aktywnego wyzwania.                                                         | Użytkownik wysyła żądanie rezygnacji z aktywnego wyzwania.                                     | Status wyzwania zmienia się na "resigned". Potencjalnie naliczana jest kara (jeśli logika przewiduje).         | Średni    | Integracyjny     |                                              |
| FC-012 | `generateChallenges`    | Generowanie wyzwań dla użytkownika z konkretnymi danymi personalizacji.                | Użytkownik ma zdefiniowane dane personalizacji (np. cel, preferencje).                        | Generowane wyzwania są zgodne z danymi personalizacji użytkownika (lub są to uniwersalne, jeśli brak personalizacji). | Średni    | Integracyjny     | Weryfikacja logiki doboru wyzwań.            |
| FC-013 | `dailyUpdate`           | Weryfikacja aktualizacji wyników przeciwników.                                          | Użytkownicy mają zróżnicowaną częstotliwość treningów.                                        | Wyniki/punkty przeciwników są aktualizowane zgodnie z logiką opartą na aktywności użytkowników.                  | Średni    | Integracyjny/E2E | Weryfikacja algorytmu aktualizacji przeciwników. |
| FC-014 | `services/ai.ts`        | Weryfikacja integracji z usługą AI i parsowania odpowiedzi.                             | Wywołanie funkcji korzystającej z AI (np. `personalization`, `generateChallenges`).        | Usługa AI zwraca odpowiedź w oczekiwanym formacie; funkcja `parseAIResponse` poprawnie przetwarza dane.         | Średni    | Integracyjny     | Obszar potencjalnych błędów formatowania/timeoutów. |
| FC-015 | Różne funkcje           | Testowanie funkcji z pustymi/null/niepoprawnymi ID użytkowników/wyzwań/danych.         | Wywołanie funkcji z nieprawidłowymi lub brakującymi identyfikatorami.                       | Funkcja zwraca odpowiedni błąd (np. 400 Bad Request, 404 Not Found) i nie powoduje błędów serwera (np. 500). | Wysoki    | Integracyjny     | Testy negatywne i przypadków brzegowych.     |

### 7. Harmonogram testów (Propozycja)

Proponowany harmonogram testów, zakładający cykl deweloperski oparty na sprintach:

*   **Sprint 1-2: Setup i Testy Jednostkowe:**
    *   Konfiguracja środowisk testowych (lokalne emulatory, środowisko dev).
    *   Napisanie i uruchomienie testów jednostkowych dla kluczowej logiki w `handlers` i `utils`.
    *   Skupienie na pokryciu kodu dla najbardziej złożonych fragmentów (np. obliczenia punktów, logiki dat).
*   **Sprint 3-4: Testy Integracyjne:**
    *   Testowanie interakcji funkcji z Firestore i innymi usługami Firebase (na emulatorze i środowisku dev).
    *   Testowanie triggerów Firestore i funkcji HTTP.
    *   Testowanie przepływu danych między handlerami.
*   **Sprint 5: Testy E2E i Wydajnościowe:**
    *   Przygotowanie środowiska stagingowego.
    *   Napisanie i uruchomienie testów E2E dla krytycznych ścieżek.
    *   Podstawowe testy wydajnościowe na środowisku dev/staging.
*   **Sprint 6 i dalej: Testy Regresji i Bezpieczeństwa, Optymalizacja:**
    *   Regularne uruchamianie zestawu testów regresji po każdej większej zmianie/nowej funkcjonalności.
    *   Rozszerzone testy wydajnościowe i bezpieczeństwa na środowisku staging.
    *   Monitorowanie środowiska produkcyjnego po wdrożeniach.
    *   Ciągłe dodawanie nowych przypadków testowych w miarę rozwoju projektu.

### 8. Zarządzanie błędami

*   **Identyfikacja:** Błędy są identyfikowane podczas manualnych testów lub automatycznych uruchomień testów (jednostkowych, integracyjnych, E2E, wydajnościowych, bezpieczeństwa). Logi z Google Cloud Logging i monitoringu są kluczowym źródłem informacji.
*   **Raportowanie:** Błędy są zgłaszane w systemie śledzenia błędów (np. Jira) z dokładnym opisem, krokami reprodukcji, danymi wejściowymi/kontekstem, środowiskiem, oczekiwanym vs rzeczywistym rezultatem, oraz załącznikami (screenshoty, logi, ID transakcji Firebase).
*   **Priorytetyzacja:** Błędy są priorytetyzowane na podstawie wpływu na użytkownika i funkcjonalność (Krytyczny, Wysoki, Średni, Niski) oraz częstotliwości występowania. Krytyczne błędy (np. blokujące kluczowe funkcjonalności, naruszenia bezpieczeństwa) mają najwyższy priorytet.
*   **Śledzenie:** Błędy są śledzone od momentu zgłoszenia przez proces analizy, naprawy, testowania i wdrożenia na produkcję.
*   **Retestowanie:** Po naprawieniu błędu, inżynier QA retestuje poprawkę w odpowiednim środowisku, aby potwierdzić usunięcie defektu.
*   **Zamknięcie:** Błąd jest zamykany po pomyślnym retestowaniu i wdrożeniu poprawki na produkcję (jeśli dotyczy).

### 9. Kryteria akceptacji

Testy dla danej wersji lub zestawu funkcjonalności mogą być uznane za zakończone, a kod gotowy do wdrożenia na kolejne środowisko (lub produkcję), gdy spełnione zostaną następujące kryteria:

*   Wszystkie przypadki testowe o priorytecie **Wysoki** zostały wykonane i zakończyły się sukcesem, LUB wszelkie zidentyfikowane błędy o priorytecie Krytycznym/Wysokim zostały naprawione i pomyślnie przetestowane, LUB zidentyfikowane błędy o priorytecie Wysokim/Krytycznym zostały zaakceptowane przez interesariuszy projektu z uzasadnieniem.
*   Minimum 90% przypadków testowych o priorytecie **Średni** zostało wykonanych i zakończyło się sukcesem.
*   Docelowe pokrycie kodu przez testy jednostkowe (np. >80% linii/gałęzi dla kluczowych modułów) zostało osiągnięte.
*   Testy regresji dla krytycznych ścieżek zakończyły się sukcesem.
*   Testy wydajnościowe nie wykazały rażących problemów ani pogorszenia wydajności poniżej ustalonych progów.
*   Testy bezpieczeństwa nie wykazały krytycznych ani wysokich podatności.
*   Wszystkie zidentyfikowane błędy zostały zgłoszone w systemie śledzenia błędów i są odpowiednio priorytetyzowane.

### 10. Metryki jakości

Podczas procesu testowego będą zbierane i analizowane następujące metryki jakości:

*   **Liczba wykonanych przypadków testowych:** W stosunku do planowanej liczby.
*   **Wskaźnik zdawalności testów (Pass Rate):** Procent przypadków testowych, które zakończyły się sukcesem. Mierzony dla każdego typu testu i ogółem.
*   **Pokrycie kodu (Code Coverage):** Procent kodu źródłowego pokrytego przez testy jednostkowe. Wskaźnik linii i gałęzi.
*   **Liczba znalezionych defektów:** Klasyfikowane według priorytetu (Krytyczny, Wysoki, Średni, Niski).
*   **Trend defektów:** Zmiany w liczbie i priorytecie defektów w czasie (np. w kolejnych sprintach).
*   **Średni czas odpowiedzi funkcji:** Dla kluczowych funkcji HTTP/wywoływanych często (mierzone w testach wydajnościowych i monitoringu).
*   **Zużycie zasobów przez funkcje:** Pamięć, CPU (mierzone w testach wydajnościowych i monitoringu).
*   **Liczba błędów na środowisku produkcyjnym:** Monitorowane po wdrożeniu.

---

Ten plan testów stanowi solidną podstawę do weryfikacji jakości projektu Fitness Engine Cloud Functions. Jest elastyczny i może być dostosowany w miarę ewolucji projektu, pojawienia się nowych wymagań lub zmiany priorytetów. Kluczem do sukcesu będzie ścisła współpraca między zespołem QA i deweloperami oraz regularna komunikacja z interesariuszami.