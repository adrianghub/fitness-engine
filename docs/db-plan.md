# Schemat bazy danych dla FitnessEngine (Firestore)

## 1. Kolekcje

### 1.1. Kolekcja: `users`
- **Klucz dokumentu**: `userId` (generowany przez Firebase Auth)
- **Pola**:
  - `email` (string, wymagane) - Email użytkownika z Google Auth.
  - `displayName` (string, opcjonalne) - Wyświetlana nazwa użytkownika (nick).
  - `level` (string, wymagane) – Poziom zaawansowania użytkownika. Wartości: "beginner", "intermediate", "advanced". Określany podczas personalizacji, wpływa na dobór wyzwań i przeciwników.
  - `fitnessGoals` (array of string, opcjonalne) - Cele fitness użytkownika (np. "budowa masy", "redukcja wagi"). Zbierane podczas personalizacji.
  - `equipment` (array of string, opcjonalne) – Lista dostępnego sprzętu użytkownika (np. "hantle", "mata"). Zbierane podczas personalizacji.
  - `points` (number, wymagane, domyślnie 0) - Całkowita suma punktów zdobytych przez użytkownika.
  - `isProfileComplete` (boolean, wymagane, domyślnie false) - Wskazuje, czy użytkownik ukończył formularz personalizacji. Używane do przekierowania po pierwszym logowaniu.
  - `createdAt` (timestamp, opcjonalne) - Czas utworzenia dokumentu.
  - `updatedAt` (timestamp, opcjonalne) - Czas ostatniej aktualizacji dokumentu.

**Indeksy (`collectionGroup: users`)**:
- `email ASC, points DESC`: Używany do wyszukiwania użytkownika po emailu i sortowania po punktach (choć leaderboard jest w osobnej kolekcji, ten indeks może być używany w innych kontekstach).
- `isProfileComplete ASC, updatedAt ASC`: Używany przez Cloud Functions (np. `onUserProfileComplete` trigger lub zadania cykliczne) do wyszukiwania użytkowników z niekompletnym profilem.

---

### 1.2. Kolekcja: `challengeTemplates`
- **Klucz dokumentu**: `challengeTemplateId` (automatycznie generowany lub predefiniowany)
- **Pola**:
  - `title` (string, wymagane) - Nazwa wyzwania (np. "10 pompek").
  - `description` (string, wymagane) - Szczegółowy opis wyzwania.
  - `level` (string, wymagane) – Poziom zaawansowania, do którego szablon pasuje. Wartości: "beginner", "intermediate", "advanced".
  - `equipment` (array of string, wymagane) – Lista wymaganego sprzętu do wykonania wyzwania.
  - `points` (number, wymagane) - Bazowa liczba punktów za ukończenie tego wyzwania.
  - `expectedTime` (number, wymagane) - Sugerowany/oczekiwany czas wykonania wyzwania w minutach (używany do ustawienia timera w `userChallenges`).
  - `isUniversal` (boolean, wymagane, domyślnie false) - Wskazuje, czy jest to wyzwanie uniwersalne (zawsze dostępne).
  - `createdAt` (timestamp, opcjonalne) - Czas utworzenia szablonu.
  - `updatedAt` (timestamp, opcjonalne) - Czas ostatniej aktualizacji szablonu.

**Indeksy (`collectionGroup: challengeTemplates`)**:
- `level ASC`: Używany do filtrowania szablonów wyzwań według poziomu zaawansowania.

---

### 1.3. Kolekcja: `userChallenges`
- **Klucz dokumentu**: `userChallengeId` (automatycznie generowany)
- **Pola**:
  - `userId` (string, wymagane) – Odniesienie do dokumentu w kolekcji `users`.
  - `challengeTemplateId` (string, wymagane) – Odniesienie do dokumentu w kolekcji `challengeTemplates`.
  - `status` (string, wymagane) – Aktualny status wyzwania dla danego użytkownika. Wartości: "not-started", "in-progress", "completed", "uncompleted".
  - `type` (string, wymagane) – Typ przypisania wyzwania. Wartości: "daily", "regular", "universal".
  - `assignedAt` (timestamp, wymagane) - Data i czas przypisania wyzwania użytkownikowi.
  - `startedAt` (timestamp, opcjonalne) - Data i czas rozpoczęcia wyzwania (dla statusu `in-progress`). Używane do timera.
  - `finishedAt` (timestamp, opcjonalne) - Data i czas zakończenia wyzwania (dla statusu `completed` lub `uncompleted`).
  - `pointsEarned` (number, wymagane) - Liczba punktów zdobytych przez użytkownika za *to konkretne* wykonanie (może być 0 jeśli nieukończone/ukarane).
  - `retryCount` (number, wymagane, domyślnie 0) - Liczba prób ponownego rozpoczęcia wyzwania w danym dniu (resetowana przy codziennym odświeżeniu).
  - `expectedEndTime` (timestamp, opcjonalne) - Czas, do którego wyzwanie powinno zostać ukończone, jeśli jest w statusie `in-progress`.

**Indeksy (`collectionGroup: userChallenges`)**:
- `type ASC, userId ASC, assignedAt ASC`: Używany do pobierania wyzwań konkretnego typu dla użytkownika, sortowanych chronologicznie.
- `userId ASC, assignedAt ASC`: Używany do pobierania wszystkich wyzwań użytkownika, sortowanych chronologicznie.
- `userId ASC, assignedAt ASC, status ASC`: Używany do pobierania wyzwań użytkownika wg daty i statusu.
- `userId ASC, assignedAt DESC`: Używany do pobierania najnowszych wyzwań użytkownika.
- `userId ASC, status ASC`: Kluczowy indeks do szybkiego wyszukiwania wyzwań użytkownika według statusu (np. wszystkie `in-progress` lub `uncompleted`).
- `userId ASC, status ASC, assignedAt ASC`: Używany do filtrowania po statusie i sortowania wg daty przypisania.
- `userId ASC, status ASC, finishedAt DESC`: Używany do pobierania ukończonych/nieukończonych wyzwań, sortowanych wg daty zakończenia.
- `userId ASC, type ASC`: Używany do filtrowania wyzwań użytkownika według typu.
- `userId ASC, type ASC, status ASC`: Używany do filtrowania wyzwań użytkownika według typu i statusu.
- `userId ASC, type ASC, status ASC, assignedAt DESC`: Używany do filtrowania według typu i statusu, sortowany wg daty przypisania (najnowsze).

---

### 1.4. Kolekcja: `opponents`
- **Klucz dokumentu**: `opponentId` (automatycznie generowany)
- **Pola**:
  - `name` (string, wymagane) - Imię fikcyjnego przeciwnika.
  - `currentPoints` (number, wymagane) - Aktualna liczba punktów fikcyjnego przeciwnika. Aktualizowana cyklicznie przez Cloud Functions.
  - `level` (string, wymagane) – Poziom zaawansowania przeciwnika. Wartości: "beginner", "intermediate", "advanced". Przeciwnicy generowani są dla konkretnego poziomu.
  - `lastUpdated` (timestamp, wymagane) - Czas ostatniej aktualizacji punktów przeciwnika.

**Indeksy (`collectionGroup: opponents`)**:
- `level ASC, currentPoints DESC`: Używany do pobierania przeciwników na danym poziomie i sortowania ich po punktach dla leaderboardu.

---

### 1.5. Kolekcja: `leaderboard`
- **Klucz dokumentu**: `leaderboardId` (unikalny, np. połączenie `entityType` i `entityId`)
- **Pola**:
  - `entityType` (string, wymagane) – Typ encji. Wartości: "user" lub "opponent".
  - `entityId` (string, wymagane) – Odniesienie do `userId` (kolekcja `users`) lub `opponentId` (kolekcja `opponents`).
  - `level` (string, wymagane) - Poziom zaawansowania encji ("beginner", "intermediate", "advanced"). Pozwala budować rankingi per poziom.
  - `name` (string, wymagane) - Wyświetlana nazwa encji (z `displayName` lub `name`). Denormalizacja dla łatwiejszego wyświetlania.
  - `points` (number, wymagane) - Aktualna liczba punktów encji. Synchronizowana z `users.points` lub `opponents.currentPoints` przez Cloud Functions.
  - `lastUpdated` (timestamp, wymagane) - Czas ostatniej aktualizacji wpisu w leaderboardzie.

**Indeksy (`collectionGroup: leaderboard`)**:
- `entityType ASC, level ASC, points DESC`: Kluczowy indeks dla leaderboardu - pozwala filtrować po typie (opcjonalnie), poziomie i sortować po punktach malejąco.
- `userId ASC, points DESC`: (Zgodnie z `firestore.indexes.json`) - Używany do szybkiego wyszukiwania pozycji konkretnego użytkownika w rankingu globalnym/po punktach (mimo że leaderboard jest per poziom, ten indeks jest obecny w definicji Firestore).

---

## 2. Relacje między kolekcjami

1.  `users` ↔ `userChallenges`: relacja jeden-do-wielu; każdy użytkownik może mieć wiele przypisanych wyzwań (`userChallenges.userId` odnosi się do `users.userId`).
2.  `challengeTemplates` ↔ `userChallenges`: relacja jeden-do-wielu; jeden szablon wyzwania może być podstawą wielu przypisań wyzwań użytkowników (`userChallenges.challengeTemplateId` odnosi się do `challengeTemplates.challengeTemplateId`). W `challengeTemplates` przechowywane są zarówno szablony wyzwań regularnych, jak i uniwersalnych (`isUniversal`).
3.  `users` oraz `opponents` są agregowani w kolekcji `leaderboard` poprzez pola `entityId`, `entityType`, `level`, `name` i `points`. Kolekcja `leaderboard` służy jako zdenormalizowany widok do szybkiego pobierania danych rankingowych.

---

## 3. Indeksy

Pełna lista indeksów kolekcji i collectionGroup zdefiniowanych w `firestore.indexes.json`:

- Kolekcja `users`:
    - **CollectionGroup `users`**:
        - `email ASC, points DESC`
        - `isProfileComplete ASC, updatedAt ASC`
- Kolekcja `challengeTemplates`:
    - **CollectionGroup `challengeTemplates`**:
        - `level ASC`
- Kolekcja `userChallenges`:
    - **CollectionGroup `userChallenges`**:
        - `type ASC, userId ASC, assignedAt ASC`
        - `userId ASC, assignedAt ASC`
        - `userId ASC, assignedAt ASC, status ASC`
        - `userId ASC, assignedAt DESC`
        - `userId ASC, status ASC`
        - `userId ASC, status ASC, assignedAt ASC`
        - `userId ASC, status ASC, finishedAt DESC`
        - `userId ASC, type ASC`
        - `userId ASC, type ASC, status ASC`
        - `userId ASC, type ASC, status ASC, assignedAt DESC`
- Kolekcja `opponents`:
    - **CollectionGroup `opponents`**:
        - `level ASC, currentPoints DESC`
- Kolekcja `leaderboard`:
    - **CollectionGroup `leaderboard`**:
        - `entityType ASC, level ASC, points DESC`
        - `userId ASC, points DESC` (specyficzny indeks dla użytkowników w leaderboardzie globalnym/po punktach)

---

## 4. Zasady zabezpieczeń Firestore (firestore.rules)

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Użytkownicy mogą czytać i zapisywać tylko swoje dokumenty w kolekcji users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Tylko właściciel wyzwania (userId) może modyfikować swoje przypisania w userChallenges
    match /userChallenges/{docId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Szablony wyzwań – dostęp tylko do odczytu dla wszystkich
    match /challengeTemplates/{docId} {
      allow read: if true;
      // Modyfikacja tylko przez administratora lub zaufany kod (np. Cloud Functions)
      allow write: if false;
    }

    // Zasada dla kolekcji universalChallenges, nawet jeśli dane są w challengeTemplates z isUniversal=true
    // Może odnosić się do kolekcji używanej tylko przez admina/funkcje do zarządzania szablonami uniwersalnymi.
    match /universalChallenges/{docId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true; // Zapis tylko przez admina
    }

    // Fikcyjne postacie (opponents) – odczyt dla wszystkich, zapisywanie tylko przez admina/zaufany kod
    match /opponents/{docId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Leaderboard – tylko odczyt dla wszystkich, modyfikacja przez zabezpieczone procesy backendowe
    match /leaderboard/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```
*Uwaga: Obecność zasady dla `/universalChallenges/{docId}` w `firestore.rules` może sugerować istnienie dedykowanej kolekcji do zarządzania *szablonami* wyzwań uniwersalnych przez admina/funkcje, nawet jeśli w `models.yml` szablon ma pole `isUniversal`. Dla celów użytkownika, przypisane wyzwanie uniwersalne będzie dokumentem w `userChallenges` odwołującym się do szablonu z `challengeTemplates`.*

---

## 5. Dodatkowe uwagi projektowe

- Schemat został zaprojektowany z myślą o skalowalności i wydajności typowych dla aplikacji webowej.
- **Denormalizacja:** Zastosowano denormalizację (np. `points` w `users`, `name` i `points` w `leaderboard`) w celu optymalizacji zapytań odczytujących (np. dla leaderboardu i profilu użytkownika) kosztem minimalnego zwiększenia złożoności zapisu (wymaga aktualizacji w kilku miejscach przez Cloud Functions).
- **Modele Wyzwań:** Szablony wyzwań (`challengeTemplates`) są oddzielone od przypisanych wyzwań użytkowników (`userChallenges`). Szablony zawierają bazowe informacje, a `userChallenges` śledzą stan i postęp konkretnego użytkownika w danym wyzwaniu.
- **Uniwersalne Wyzwania:** Wyzwania uniwersalne są traktowane jako szczególny rodzaj szablonu (`isUniversal` w `challengeTemplates`) i przypisywane użytkownikom jako dokumenty w `userChallenges` z odpowiednim `type`.
- **Zarządzanie Cyklem Wyzwania:** Kluczowe pola w `userChallenges` (`status`, `startedAt`, `finishedAt`, `retryCount`, `expectedEndTime`) wspierają serwerową logikę timera, ponownych prób i penalizacji.
- **Rywalizacja i Ranking:** Kolekcje `opponents` i `leaderboard` są kluczowe dla elementu rywalizacji. `opponents` przechowuje dane fikcyjnych postaci, a `leaderboard` agreguje dane użytkowników i przeciwników dla wyświetlania rankingu per poziom.
- **Zasady Zabezpieczeń:** Reguły Firestore zapewniają kontrolę dostępu opartą na uwierzytelnionym użytkowniku (tylko własne dane) i chronią dane systemowe (szablony, przeciwnicy, leaderboard) przed nieuprawnionymi modyfikacjami z klienta.
- **Cloud Functions:** Firebase Functions są niezbędne do wykonania operacji wymagających uprawnień admina lub operacji cyklicznych/transakcyjnych (np. codzienne odświeżanie wyzwań i rankingu, penalizacje, generowanie przeciwników, promocja poziomu).