import type { PersonalizationData } from "@/types/personalization-data";

export const generateFitnessGoalsPrompt = (data: PersonalizationData) => {
  return `Jako ekspert fitness, przeanalizuj profil użytkownika i zaproponuj cele treningowe.

<user-profile>
- Poziom Doświadczenia: ${data.level}
- Dostępny Sprzęt: ${data.equipment.join(", ")}
- Opis Celów: ${data.goalsDescription || "Nie podano"}
</user-profile>

Na podstawie tych informacji:
1. Zdefiniuj maksymalnie 3 konkretne, mierzalne cele fitness, które są zgodne z opisem użytkownika i jego poziomem doświadczenia.
2. Upewnij się, że cele są zgodne z dostępnym sprzętem i poziomem doświadczenia użytkownika.
3. Każdy cel powinien być nie dłuższy niż 10 słów.

Odpowiedź dodaj do znacznika <fitness-goals> w formacie JSON:
<fitness-goals>
{
  "goals": ["cel1", "cel2", "cel3"]
}
</fitness-goals>`;
};
