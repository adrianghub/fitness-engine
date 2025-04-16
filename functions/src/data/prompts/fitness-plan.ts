import type { ChallengeTemplate } from "../../types/models";
import type { PersonalizationData } from "../../types/personalization-data";

export function generateFitnessPlanPrompt(
  data: PersonalizationData,
  availableChallenges: (ChallengeTemplate & { id: string })[]
): string {
  return `Jako ekspert fitness, przeanalizuj profil użytkownika i stwórz spersonalizowany plan treningowy.

<user-profile>
- Poziom Doświadczenia: ${data.level}
- Dostępny Sprzęt: ${data.equipment.join(", ")}
- Opis Celów: ${data.goalsDescription || "Nie podano"}
</user-profile>

<available-challenges>
${availableChallenges.map((c) => `- ${c.id}: ${c.title}: ${c.description} (Poziom: ${c.level})`).join("\n")}
</available-challenges>

Na podstawie tych informacji:
1. Zdefiniuj maksymalnie 3 konkretne, mierzalne cele fitness, które są zgodne z opisem użytkownika i jego poziomem doświadczenia
2. Stwórz listę 5 regularnych wyzwań z dostępnej listy szablonów i sprzętu, które najlepiej pomogą w osiągnięciu tych celów, zwróć tylko i wyłącznie "id" wyzwań. Te wyzwania będą wykorzystane jako rekomendowane wyzwania regularne w planie treningowym użytkownika.
3. Możesz zaproponować 1-2 wyzwania z wyższego/niższego poziomu niż poziom użytkownika (np. jeśli użytkownik jest początkujący, możesz zaproponować wyzwanie z poziomu średnio-zaawansowanego lub jeśli zaawansowany, możesz zaproponować np. wyzwanie dla początkujących), jeśli sprzęt pasuje do wymagań wyzwania

Odpowiedź dodaj do znacznika <fitness-plan> w formacie JSON:
<fitness-plan>
  {
    "goals": ["cel1", "cel2", "cel3"],
    "recommendedChallenges": ["challengeId1", "challengeId2", ...]
  }
</fitness-plan>

Pamiętaj, aby odpowiedź była w języku polskim, wewnątrz znacznika <fitness-plan> w formacie JSON.`;
}
