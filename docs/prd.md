# Dokument wymagań produktu (PRD) - FitnessEngine

## 1. Przegląd produktu

FitnessEngine to aplikacja webowa PWA, której celem jest zwiększenie motywacji i systematyczności w realizacji treningów fitness. Aplikacja zapewnia użytkownikom spersonalizowane wyzwania treningowe, element rywalizacji z fikcyjnymi przeciwnikami oraz jasny system śledzenia postępów. MVP koncentruje się na dostarczeniu podstawowych funkcjonalności, które pomogą użytkownikom utrzymać motywację i regularność w ćwiczeniach.

Aplikacja wykorzystuje nowoczesny stos technologiczny, w tym:
*   **Frontend:** Vite, React 19, TypeScript 5, Tailwind CSS, Shadcn/ui
*   **Backend:** Firebase (Auth, Firestore, Functions) - Autentykacja przez Google Auth, przechowywanie danych w Firestore, logika biznesowa i zadania cykliczne w Cloud Functions.
*   **Type Safety:** TypeSync do generowania typów Firestore.
*   **Hosting:** Firebase Hosting.
*   **CI/CD:** GitHub Actions.

## 2. Problem użytkownika

Utrzymanie motywacji i systematyczności w treningach jest trudne. Użytkownicy często porzucają swoje cele fitness z powodu:
- Braku spersonalizowanego planu treningowego dostosowanego do ich poziomu
- Niewystarczającego elementu rywalizacji, który motywowałby do regularnych ćwiczeń
- Trudności w jasnym śledzeniu postępów, co powoduje brak widocznych efektów i spadek zaangażowania
- Monotonii treningów prowadzącej do utraty zainteresowania

FitnessEngine rozwiązuje te problemy, oferując różnorodne wyzwania dostosowane do poziomu zaawansowania użytkownika, element rywalizacji z algorytmicznie generowanymi przeciwnikami oraz przejrzysty system śledzenia wyników i serwerowy system zarządzania cyklem życia wyzwań.

## 3. Wymagania funkcjonalne

### 3.1 Autentykacja
- Implementacja prostego procesu rejestracji i logowania za pomocą konta Google w oparciu o Firebase Auth.
- Zbieranie dodatkowych danych przy pierwszej rejestracji: poziom zaawansowania, cele fitness oraz dostępność sprzętu.

### 3.2 Personalizacja
- Formularz wyboru poziomu zaawansowania (początkujący, średniozaawansowany, zaawansowany) z opisem każdego poziomu.
- Możliwość zmiany poziomu zaawansowania w ustawieniach aplikacji (out of MVP scope).
- Dostosowanie wyświetlanych wyzwań do wybranego poziomu zaawansowania użytkownika.
- Unikalny nick użytkownika (displayName) z walidacją unikalności w bazie danych.
- Możliwość określenia celów fitness (fitnessGoals) oraz dostępności sprzętu (equipment) dla lepszego dopasowania (użycie tych danych w MVP skupia się głównie na początkowym doborze wyzwań i opisie profilu; pełna personalizacja wyzwań na ich podstawie jest poza MVP).
- Automatyczne generowanie początkowego zestawu wyzwań po ukończeniu personalizacji.
- Automatyczne generowanie fikcyjnych przeciwników dopasowanych do poziomu użytkownika.
- System awansu na wyższy poziom po osiągnięciu wymaganej liczby punktów i utrzymaniu 1. miejsca w rankingu przez określony czas (szczegóły mechanizmu awansu mogą być doprecyzowane, ale funkcjonalność awansu jest w MVP).
- Reset punktów i odświeżenie wyzwań/przeciwników po zmianie/awansie na wyższy poziom.

### 3.3 Wyzwania treningowe i ich cykl życia
- Zestaw predefiniowanych wyzwań treningowych dla każdego poziomu zaawansowania.
- Codzienny, automatyczny **proces odświeżania wyzwań** zarządzany po stronie serwera (Firebase Functions):
    - Losowanie nowej puli wyzwań na dany dzień dla każdego użytkownika, z uwzględnieniem jego poziomu zaawansowania.
    - Wyznaczanie jednego "Wyzwania na dziś" (daily challenge) spośród puli.
    - Dołączanie uniwersalnych wyzwań (universal_challenges) do puli.
    - Zapobieganie powtarzaniu się tych samych wyzwań (poza uniwersalnymi) kolejnego dnia.
    - Przetwarzanie wyzwań z poprzedniego dnia:
        - Wyzwania w statusie `in-progress` lub `not-started` są oznaczane jako `uncompleted`.
        - Naliczanie kar punktowych za nieukończone wyzwania z poprzedniego dnia (szczegóły systemu kar w dokumentacji funkcji).
- **Zarządzanie statusami wyzwań** (not-started, in-progress, completed, uncompleted).
- Implementacja **serwerowego systemu timera wyzwań**:
    - Użytkownik może "rozpocząć" wyzwanie, zmieniając jego status na `in-progress`.
    - Wyzwania w statusie `in-progress` mają określony czas na ukończenie.
    - Klient wyświetla dynamiczny timer odliczający pozostały czas.
    - W przypadku upływu czasu na wyzwanie w statusie `in-progress` **w ciągu dnia**, status zmienia się na `uncompleted`. Użytkownik może **ponowić próbę** tego wyzwania (domyślnie do 3 razy dziennie).
    - Penalizacja za nieukończenie następuje **wyłącznie** podczas nocnego odświeżania, niezależnie od tego, czy wyzwanie stało się `uncompleted` przez upływ czasu w ciągu dnia, czy było `not-started` lub `in-progress` w momencie nocnego resetu.

### 3.4 Rejestracja wyników
- Możliwość rejestrowania postępów poprzez ukończenie wyzwania (`completeChallenge` Cloud Function).
- Przydzielanie punktów za ukończone wyzwania.
- Zmiana statusu wyzwania na `completed` po jego pomyślnym ukończeniu.

### 3.5 Rywalizacja
- Implementacja mechanizmu rywalizacji z fikcyjnymi przeciwnikami.
- Algorytm generujący wyniki fikcyjnych przeciwników.
- **Codzienna, automatyczna aktualizacja danych** użytkowników i fikcyjnych przeciwników w bazie danych (Firestore) podczas nocnego odświeżania (szczegóły w dokumentacji funkcji `dailyChallengeAndOpponentUpdate`). Proces ten obejmuje:
    - Aktualizację punktów użytkowników (dodanie punktów za ukończone, odjęcie kar za nieukończone wyzwania z poprzedniego dnia).
    - Aktualizację pozycji użytkowników w rankingu.
    - Aktualizację/generowanie wyników fikcyjnych przeciwników (niektórzy zwiększają wyniki, niektórzy mogą zostać zastąpieni nowymi).

### 3.6 Tablica wyników
- Wyświetlanie rankingu z wynikami użytkownika i fikcyjnych przeciwników (oparte o kolekcję `leaderboard` w Firestore, indeksowaną dla szybkiego odczytu).
- Prezentacja pozycji użytkownika na tle innych uczestników tego samego poziomu zaawansowania.

### 3.7 Elementy motywacyjne
- Integracja z API ZenQuotes do wyświetlania motywacyjnych cytatów na ekranie szczegółów wyzwania.
- Progresja wyzwań (zmiana zestawów) wraz z wzrostem poziomu użytkownika.
- Progresja przeciwników (zmiana charakterystyk) wraz z wzrostem poziomu użytkownika.
- Codzienna aktualizacja wyników przeciwników wzmacniająca element rywalizacji.

## 4. Granice produktu

### 4.1 Co wchodzi w zakres MVP:
- Autentykacja przez Google Auth (Firebase).
- Podstawowa personalizacja (wybór poziomu zaawansowania, zebranie podstawowych danych o celach i sprzęcie).
- Predefiniowane wyzwania na każdym poziomie, w tym uniwersalne.
- Serwerowy system zarządzania cyklem życia wyzwań: statusy, timer (wyświetlany po stronie klienta), serwerowa weryfikacja upływu czasu, system ponownych prób w ciągu dnia (do 3), penalizacja za nieukończenie podczas nocnego resetu.
- Rejestracja wyników i przyznawanie punktów.
- Podstawowa rywalizacja z fikcyjnymi przeciwnikami (generowanymi algorytmicznie).
- Prosta tablica wyników.
- Automatyczna, cykliczna (codzienna) aktualizacja danych (odświeżanie wyzwań, przeciwników, punktów, pozycji w rankingu) realizowana przez Cloud Functions.
- Motywacyjne cytaty z API ZenQuotes.

### 4.2 Co NIE wchodzi w zakres MVP:
- Rozbudowane funkcje społecznościowe (interakcje między użytkownikami, zapraszanie znajomych, rywalizacja między realnymi użytkownikami).
- Zaawansowana personalizacja wyzwań (tworzenie własnych wyzwań przez użytkownika, automatyczne generowanie treści wyzwań w oparciu o AI poza predefiniowanymi szablonami).
- Integracja z zewnętrznymi aplikacjami fitness (np. Strava, Google Fit).
- Zaawansowane statystyki i wykresy postępów (poza aktualnym rankingiem i punktami).
- System powiadomień push.
- Panel administracyjny do zarządzania treścią wyzwań, użytkownikami itp.
- Szczegółowe plany treningowe generowane przez AI (mimo istnienia `ai.ts`, pełne wykorzystanie AI do generowania planów wykracza poza MVP).

## 5. Historyjki użytkowników

### US-001: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę się zarejestrować w aplikacji za pomocą mojego konta Google, aby szybko rozpocząć korzystanie z aplikacji.
- Kryteria akceptacji:
  - Użytkownik może zalogować się za pomocą konta Google.
  - Dane użytkownika (UID, email, displayName) są poprawnie zapisywane w Firebase Auth i profilu użytkownika w Firestore.
  - Po pierwszym logowaniu użytkownik jest przekierowany do formularza personalizacji.

### US-002: Wypełnienie formularza początkowej personalizacji
- Opis: Jako nowy użytkownik, po pierwszym logowaniu chcę wypełnić formularz personalizacji, aby otrzymać wyzwania dopasowane do mojego poziomu.
- Kryteria akceptacji:
  - Formularz zawiera wybór poziomu zaawansowania (początkujący, średniozaawansowany, zaawansowany) z opisem.
  - Formularz zawiera pola do wprowadzenia dodatkowych informacji (cele fitness, dostępność sprzętu).
  - Wprowadzony nick (`displayName`) jest unikalny (walidacja).
  - Po wypełnieniu formularza dane są zapisywane w profilu użytkownika w Firestore.
  - Automatycznie generowany jest początkowy zestaw wyzwań i przeciwników dla użytkownika.
  - Użytkownik jest przekierowany do ekranu wyzwań.

### US-003: Logowanie istniejącego użytkownika
- Opis: Jako istniejący użytkownik, chcę szybko zalogować się do aplikacji przy każdym uruchomieniu.
- Kryteria akceptacji:
  - Aplikacja automatycznie rozpoznaje zalogowanego użytkownika (jeśli sesja jest aktywna).
  - Użytkownik jest od razu przekierowany do ekranu wyzwań po pomyślnym logowaniu.
  - Sesja użytkownika jest utrzymywana przez odpowiedni czas.

### US-004: Przeglądanie listy wyzwań
- Opis: Jako zalogowany użytkownik, chcę zobaczyć listę wyzwań dostępnych na dziś, dostosowanych do mojego poziomu zaawansowania.
- Kryteria akceptacji:
  - Lista pokazuje wyzwania (losowe + uniwersalne) dopasowane do poziomu użytkownika z opisem i liczbą punktów do zdobycia.
  - Wyzwania są wyświetlane ze statusem (nierozpoczęte, w trakcie, zakończone, nieukończone).
  - Jedno wyzwanie jest wyraźnie oznaczone jako "Wyzwanie na dziś".
  - Lista wyzwań jest aktualizowana codziennie (po nocnym odświeżeniu).

### US-005: Rozpoczęcie wyzwania
- Opis: Jako zalogowany użytkownik, chcę wybrać i rozpocząć wyzwanie z listy, aby rozpocząć odliczanie czasu.
- Kryteria akceptacji:
  - Użytkownik może kliknąć w wyzwanie w statusie `not-started` lub `uncompleted` aby je rozpocząć.
  - Status wyzwania zmienia się z `not-started` lub `uncompleted` na `in-progress`.
  - Wyzwanie otrzymuje znacznik czasu rozpoczęcia i wyliczony czas zakończenia.
  - Użytkownik jest przekierowany na ekran szczegółów wyzwania.

### US-006: Wyświetlenie szczegółów wyzwania
- Opis: Jako użytkownik, chcę zobaczyć szczegóły rozpoczętego wyzwania wraz z motywującym cytatem i widocznym timerem.
- Kryteria akceptacji:
  - Ekran pokazuje opis wyzwania i liczbę punktów do zdobycia.
  - Wyświetlany jest motywujący cytat z API ZenQuotes.
  - Widoczny jest timer odliczający czas pozostały do zakończenia wyzwania w statusie `in-progress`.
  - Widoczny jest przycisk "Zakończ wyzwanie".

### US-007: Zakończenie wyzwania
- Opis: Jako użytkownik, chcę zakończyć wyzwanie przed upływem czasu i otrzymać punkty.
- Kryteria akceptacji:
  - Użytkownik może kliknąć przycisk "Zakończ wyzwanie".
  - Status wyzwania zmienia się na `completed`.
  - Punkty są dodawane do sumy punktów użytkownika w profilu.
  - Użytkownik jest przekierowany na ekran tablicy wyników lub listę wyzwań.

### US-008: Przeglądanie tablicy wyników
- Opis: Jako użytkownik, chcę zobaczyć swoją pozycję w rankingu w porównaniu z fikcyjnymi przeciwnikami na moim poziomie zaawansowania.
- Kryteria akceptacji:
  - Tablica pokazuje ranking użytkownika i fikcyjnych przeciwników na tym samym poziomie.
  - Widoczna jest liczba punktów każdego uczestnika w rankingu.
  - Pozycja użytkownika jest wyraźnie oznaczona lub wyróżniona.
  - Ranking jest aktualizowany codziennie (po nocnym odświeżeniu).

### US-009: Obsługa wygaśnięcia wyzwania w ciągu dnia
- Opis: Jako użytkownik, jeśli nie ukończę wyzwania przed upływem timera w ciągu dnia, chcę móc spróbować ponownie.
- Kryteria akceptacji:
    - Jeśli timer wyzwania w statusie `in-progress` upłynie w ciągu dnia, status wyzwania zmienia się na `uncompleted`.
    - Użytkownik może kliknąć wyzwanie w statusie `uncompleted`, aby rozpocząć je ponownie (z nowym timerem).
    - Liczba prób ponownego rozpoczęcia wyzwania w ciągu dnia jest ograniczona (np. do 3 razy). Po wykorzystaniu wszystkich prób, wyzwanie pozostaje `uncompleted` do nocnego odświeżenia.
    - Za wyzwanie, które stało się `uncompleted` w ciągu dnia, nie są od razu naliczane kary punktowe.

### US-010: Codzienne odświeżenie danych (wyzwań i tablicy wyników)
- Opis: Jako użytkownik, chcę każdego ranka widzieć nowy zestaw wyzwań oraz zaktualizowane wyniki fikcyjnych przeciwników.
- Kryteria akceptacji:
  - Lista wyzwań (losowe + uniwersalne) jest automatycznie aktualizowana codziennie po nocnym odświeżeniu.
  - Nowe wyzwanie jest oznaczane jako "Wyzwanie na dziś".
  - Wyzwania z poprzedniego dnia, które nie zostały ukończone (`not-started`, `in-progress`, `uncompleted`), otrzymują status `uncompleted` i są brane pod uwagę przy naliczaniu kar.
  - Wyniki fikcyjnych przeciwników są aktualizowane codziennie (po nocnym odświeżeniu), odzwierciedlając ich "postępy".
  - Aktualizacja następuje cyklicznie, np. raz na 24 godziny w ustalonym momencie (np. o północy czasu Europe/Warsaw).

## 6. Metryki sukcesu

### 6.1 Kryteria techniczne:
- Pomyślne przejście procesu rejestracji i logowania za każdym razem.
- Brak krytycznych błędów uniemożliwiających korzystanie z podstawowych funkcji (przeglądanie/rozpoczynanie/kończenie wyzwań, przeglądanie rankingu).
- Poprawne działanie serwerowego systemu timera wyzwań i logiki ponownych prób w ciągu dnia.
- Poprawne działanie cyklicznego (codziennego) odświeżania danych (wyzwań, przeciwników, punktów, pozycji w rankingu) przez Cloud Functions, z opóźnieniem nie przekraczającym 1 godziny od zaplanowanego czasu.
- Poprawna prezentacja wszystkich predefiniowanych wyzwań, w tym wyzwań uniwersalnych.
- Poprawna funkcjonalność codziennej zmiany puli wyzwań i oznaczenia "Wyzwania na dziś".
- Poprawne naliczanie punktów za ukończone wyzwania.
- Poprawne naliczanie kar za nieukończone wyzwania podczas nocnego odświeżania.
- Wyświetlenie cytatu motywacyjnego przez co najmniej 80% użytkowników odwiedzających ekran szczegółów wyzwania.

### 6.2 Kryteria użytkowe:
- Wykonanie każdego z predefiniowanych wyzwań przynajmniej raz przez większość użytkowników.
- Zaangażowanie w element rywalizacji, mierzone liczbą użytkowników przeglądających tablicę wyników regularnie.
- Dążenie użytkowników do poprawy wyniku lub ukończenia wyzwań, mierzone liczbą ponownych prób wyzwań (`uncompleted`).
- Pozytywny feedback użytkowników odnośnie elementu rywalizacji i motywacji (zbierany poza MVP).
- Stworzenie listy co najmniej 10 usprawnień na podstawie własnych doświadczeń zespołu lub wczesnych testerów.

### 6.3 Długoterminowe metryki:
- Wzrost zaangażowania użytkowników w realizację wyzwań (częstotliwość logowania, liczba ukończonych wyzwań).
- Zwiększenie regularności treningów (np. seria dni z ukończonymi wyzwaniami).
- Procent użytkowników awansujących na wyższe poziomy.
- Wskaźnik retencji użytkowników.