import type { UniversalChallenge } from "@/types/models";

export const UNIVERSAL_CHALLENGES: Omit<
  UniversalChallenge,
  "createdAt" | "updatedAt" | "points"
>[] = [
  {
    title: "Wypij 8 Szklanek Wody",
    description: "Wypij co najmniej 8 szklanek wody w ciągu dnia",
    status: "not-started",
  },
  {
    title: "5 Minut Głębokiego Oddychania",
    description: "Ćwicz głębokie oddychanie przez 5 minut",
    status: "not-started",
  },
  {
    title: "Zrób 8,000 Kroków",
    description: "Przejdź co najmniej 8,000 kroków w ciągu dnia",
    status: "not-started",
  },
  {
    title: "Stretching",
    description: "Wykonaj 10 minut stretchingu",
    status: "not-started",
  },
];
