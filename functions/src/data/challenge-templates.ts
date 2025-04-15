/**
 * Challenge templates data for the fitness app
 *
 * This file contains templates for all the fitness challenges
 * that can be assigned to users. These are seeded into the database
 * when running the seedChallengeTemplates function.
 */

import type { ChallengeLevel, ChallengeTemplate } from "@/types/models";

const ALL_LEVELS: Record<string, ChallengeLevel> = {
  all: "all",
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

const UNIVERSAL_CHALLENGES = [
  {
    title: "Wypij 8 Szklanek Wody",
    description: "Wypij co najmniej 8 szklanek wody w ciągu dnia",
    level: ALL_LEVELS.all,
    points: 30,
    equipment: [],
    expectedTime: "Cały dzień",
  },
  {
    title: "5 Minut Głębokiego Oddychania",
    description: "Ćwicz głębokie oddychanie przez 5 minut",
    level: ALL_LEVELS.all,
    points: 150,
    equipment: [],
    expectedTime: "5 min",
  },
  {
    title: "Zrób 8,000 Kroków",
    description: "Przejdź co najmniej 8,000 kroków w ciągu dnia",
    level: ALL_LEVELS.all,
    points: 120,
    equipment: [],
    expectedTime: "Cały dzień",
  },
  {
    title: "Stretching",
    description: "Wykonaj 10 minut stretchingu",
    level: ALL_LEVELS.all,
    equipment: [],
    points: 80,
    expectedTime: "10 min",
  },
];

const BEGINNER_CHALLENGES = [
  {
    title: "Wyzwanie: 20 Przysiadów Klasycznych",
    description:
      "Wykonaj 20 pełnych przysiadów (biodra poniżej kolan) z poprawną techniką, utrzymując proste plecy.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 15,
    expectedTime: "2 min",
  },
  {
    title: "Wyzwanie: 15 Pompek na Kolanach",
    description:
      "Wykonaj 15 pompek opierając się na kolanach. Utrzymuj prostą linię od głowy do kolan.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 20,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 30 Sekund Deski (Plank)",
    description:
      "Utrzymaj pozycję deski (plank) na przedramionach przez 30 sekund. Ciało w linii prostej, brzuch napięty.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 25,
    expectedTime: "2 min",
  },
  {
    title: "Wyzwanie: 20 Wykroków (10 na nogę)",
    description:
      "Wykonaj 20 wykroków w przód (po 10 na każdą nogę), schodząc nisko i utrzymując stabilność.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 30,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 15 Wznosów Bioder (Glute Bridge)",
    description:
      "Leżąc na plecach, wykonaj 15 wznosów bioder, mocno spinając pośladki u góry.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 20,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 30 Pajacyków (Jumping Jacks)",
    description: "Wykonaj 30 dynamicznych pajacyków.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 10,
    expectedTime: "2 min",
  },
  {
    title: "Wyzwanie: 10 Pompek Klasycznych",
    description:
      "Wykonaj 10 klasycznych pompek z poprawną techniką. Jeśli to za trudne, wróć do pompek na kolanach.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 40,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 45 Sekund Deski (Plank)",
    description:
      "Utrzymaj pozycję deski (plank) na przedramionach przez 45 sekund.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 45,
    expectedTime: "2 min",
  },
  {
    title: "Wyzwanie: 15 Przyciągań Kolan do Klatki w Leżeniu",
    description:
      "Leżąc na plecach, przyciągnij naprzemiennie kolana do klatki piersiowej 15 razy (łącznie).",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 25,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 1 Minuta Marszu w Miejscu z Wysokim Unoszeniem Kolan",
    description:
      "Maszeruj w miejscu przez 1 minutę, unosząc kolana jak najwyżej.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 15,
    expectedTime: "2 min",
  },
  {
    title: "Wyzwanie: 10 Spokojnych Burpees (Bez Pompki i Wyskoku)",
    description:
      "Wykonaj 10 uproszczonych burpees: zejdź do pozycji deski, wróć do przysiadu i wstań. Bez pompki i wyskoku.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 50,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 20 Przysiadów Sumo",
    description:
      "Wykonaj 20 przysiadów z szerokim rozstawem stóp (sumo squat), schodząc nisko.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 35,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 15 Odwodzeń Nogi w Bok Stojąc (na stronę)",
    description:
      "Stojąc prosto, wykonaj 15 odwodzeń nogi w bok, utrzymując napięty brzuch. Powtórz na drugą stronę.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 30,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 1 Minuta Krzesełka przy Ścianie (Wall Sit)",
    description:
      "Utrzymaj pozycję przysiadu opierając plecy o ścianę przez 1 minutę. Uda równolegle do podłogi.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 60,
    expectedTime: "2 min",
  },
  {
    title: "Wyzwanie: 10 Negatywnych Pompek",
    description:
      "Zacznij w pozycji do pompki i bardzo powoli (3-5 sekund) opuszczaj ciało do ziemi. Wróć do pozycji startowej w dowolny sposób. Wykonaj 10 powtórzeń.",
    level: ALL_LEVELS.beginner,
    equipment: ["bodyweight"],
    points: 55,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 15 Przyciągań Gumy do Klatki (Banded Rows)",
    description:
      "Używając gumy oporowej (zaczepionej stabilnie), wykonaj 15 przyciągnięć gumy do klatki piersiowej, ściągając łopatki.",
    level: ALL_LEVELS.beginner,
    equipment: ["resistance-bands"],
    points: 40,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 20 Wznosów Bioder z Gumą (Banded Glute Bridge)",
    description:
      "Załóż gumę oporową nad kolanami i wykonaj 20 wznosów bioder, rozpychając kolana na zewnątrz.",
    level: ALL_LEVELS.beginner,
    equipment: ["resistance-bands"],
    points: 45,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 15 Odwodzeń Nogi w Bok z Gumą (Banded Lateral Walk Prep)",
    description:
      "Załóż gumę oporową wokół kostek. Stojąc, wykonaj 15 odwodzeń nogi w bok. Powtórz na drugą stronę.",
    level: ALL_LEVELS.beginner,
    equipment: ["resistance-bands"],
    points: 50,
    expectedTime: "4 min",
  },
  {
    title:
      "Wyzwanie: 10 Wyciskań Gumy Nad Głowę Stojąc (Banded Overhead Press)",
    description:
      "Stań na gumie oporowej, chwyć drugi koniec. Wykonaj 10 wyciśnięć gumy nad głowę.",
    level: ALL_LEVELS.beginner,
    equipment: ["resistance-bands"],
    points: 60,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 15 Uginanie Ramion z Gumą (Banded Bicep Curl)",
    description:
      "Stań na gumie oporowej, chwyć końce. Wykonaj 15 uginanie ramion na biceps.",
    level: ALL_LEVELS.beginner,
    equipment: ["resistance-bands"],
    points: 35,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 10 Wiosłowań Hantlą w Opadzie (na stronę)",
    description:
      "Używając lekkiej hantli, wykonaj 10 wiosłowań w opadzie tułowia. Powtórz na drugą stronę.",
    level: ALL_LEVELS.beginner,
    equipment: ["dumbbells"],
    points: 70,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 15 Przysiadów Kielichowych z Hantlą (Goblet Squat)",
    description:
      "Trzymając lekką hantlę przy klatce piersiowej, wykonaj 15 przysiadów.",
    level: ALL_LEVELS.beginner,
    equipment: ["dumbbells"],
    points: 75,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 10 Martwych Ciągów na Prostych Nogach z Hantlami",
    description:
      "Trzymając lekkie hantle, wykonaj 10 martwych ciągów na prostych nogach (RDL), czując rozciąganie w tyłach ud.",
    level: ALL_LEVELS.beginner,
    equipment: ["dumbbells"],
    points: 80,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 3 Zwisów na Drążku po 15 Sekund",
    description:
      "Zawiśnij swobodnie na drążku do podciągania 3 razy, za każdym razem utrzymując zwis przez 15 sekund. Odpocznij między seriami.",
    level: ALL_LEVELS.beginner,
    equipment: ["pull-up-bar"],
    points: 50,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 10 Wznosów Kolan w Zwisie na Drążku",
    description:
      "W zwisie na drążku, unieś kolana w kierunku klatki piersiowej 10 razy.",
    level: ALL_LEVELS.beginner,
    equipment: ["pull-up-bar"],
    points: 90,
    expectedTime: "4 min",
  },
];

const ADVANCED_CHALLENGES = [
  {
    title: "Wyzwanie: 100 Pompek Klasycznych",
    description:
      "Wykonaj 100 klasycznych pompek. Podziel na serie, ale staraj się minimalizować odpoczynek.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight"],
    points: 500,
    expectedTime: "9 min",
  },
  {
    title: "Wyzwanie: 50 Burpees na Czas",
    description:
      "Wykonaj 50 pełnych burpees (z pompką i wyskokiem) tak szybko, jak potrafisz. Zapisz swój czas.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight"],
    points: 800,
    expectedTime: "10 min",
  },
  {
    title: "Wyzwanie: 10 Minut AMRAP (Podciągnięcia, Pompki, Przysiady)",
    description:
      "Wykonaj jak najwięcej rund (AMRAP) w ciągu 10 minut: 5 Podciągnięć, 10 Pompek, 15 Przysiadów.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight", "pull-up-bar"],
    points: 1200,
    expectedTime: "10 min",
  },
  {
    title: "Wyzwanie: 3 Minuty Deski (Plank)",
    description:
      "Utrzymaj pozycję deski (plank) na przedramionach przez 3 minuty. Możesz robić krótkie przerwy, jeśli konieczne, ale dąż do ciągłości.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight"],
    points: 600,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 5 Pompek w Staniu na Rękach przy Ścianie (HSPU)",
    description:
      "Wykonaj 5 pompek w staniu na rękach, opierając pięty o ścianę dla stabilności.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight"], // Wall needed
    points: 1000,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 5 Przysiadów na Jednej Nodze (Pistol Squat) na Stronę",
    description:
      "Wykonaj 5 pełnych przysiadów na jednej nodze (pistoletów) na każdą stronę. Utrzymaj równowagę i kontrolę.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight"],
    points: 900,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 30 Sekund L-Sit w Zwisie na Drążku",
    description:
      "W zwisie na drążku, unieś proste nogi do poziomu i utrzymaj pozycję L-sit przez 30 sekund.",
    level: ALL_LEVELS.advanced,
    equipment: ["pull-up-bar"],
    points: 750,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 10 Podciągnięć na Drążku (Nachwytem)",
    description:
      "Wykonaj 10 pełnych podciągnięć nachwytem z nienaganną techniką.",
    level: ALL_LEVELS.advanced,
    equipment: ["pull-up-bar"],
    points: 850,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 1 Muscle-Up (Bar Muscle-Up)",
    description: "Wykonaj jedno pełne przejście siłowe na drążku (muscle-up).",
    level: ALL_LEVELS.advanced,
    equipment: ["pull-up-bar"],
    points: 1500,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 20 Pompek na Poręczach (Dips)",
    description: "Wykonaj 20 pełnych pompek na poręczach.",
    level: ALL_LEVELS.advanced,
    equipment: ["dip-bars"],
    points: 700,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 30 Sekund L-Sit na Poręczach",
    description:
      "W podporze na poręczach, unieś proste nogi do poziomu i utrzymaj pozycję L-sit przez 30 sekund.",
    level: ALL_LEVELS.advanced,
    equipment: ["dip-bars"],
    points: 800,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 5 Dipów z Dodatkowym Obciążeniem (Weighted Dips)",
    description:
      "Wykonaj 5 pompek na poręczach z dodatkowym obciążeniem (np. hantla między nogami, kamizelka obciążeniowa).",
    level: ALL_LEVELS.advanced,
    equipment: ["dip-bars", "dumbbells"], // Or other weight
    points: 1100,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 10 Przysiadów ze Sztangą (Ciężar Własny Ciała)",
    description:
      "Wykonaj 10 pełnych przysiadów ze sztangą na plecach z obciążeniem równym (lub zbliżonym) do Twojej masy ciała.",
    level: ALL_LEVELS.advanced,
    equipment: ["barbell"],
    points: 1300,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 5 Martwych Ciągów (1.5x Ciężar Ciała)",
    description:
      "Wykonaj 5 powtórzeń martwego ciągu z obciążeniem równym (lub zbliżonym) do 1.5-krotności Twojej masy ciała.",
    level: ALL_LEVELS.advanced,
    equipment: ["barbell"],
    points: 1400,
    expectedTime: "9 min",
  },
  {
    title: "Wyzwanie: 10 Wyciskań Sztangi Leżąc (Ciężar Własny Ciała)",
    description:
      "Wykonaj 10 powtórzeń wyciskania sztangi leżąc na ławce (jeśli dostępna, inaczej floor press) z obciążeniem równym (lub zbliżonym) do Twojej masy ciała.",
    level: ALL_LEVELS.advanced,
    equipment: ["barbell"],
    points: 1250,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 8 Wyciskań Żołnierskich Sztangi (Strict Press)",
    description:
      "Wykonaj 8 ścisłych wyciśnięć sztangi nad głowę stojąc (bez użycia nóg) ze znacznym obciążeniem.",
    level: ALL_LEVELS.advanced,
    equipment: ["barbell"],
    points: 1150,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 10 Thrusters ze Sztangą (umiarkowany ciężar)",
    description:
      "Wykonaj 10 powtórzeń Thruster: Przysiad przedni ze sztangą płynnie przechodzący w wyciśnięcie sztangi nad głowę.",
    level: ALL_LEVELS.advanced,
    equipment: ["barbell"],
    points: 1000,
    expectedTime: "5 min",
  },
  {
    title:
      "Wyzwanie: 20 Przysiadów Bułgarskich z Ciężkimi Hantlami (10 na nogę)",
    description:
      "Trzymając ciężkie hantle, wykonaj 10 przysiadów bułgarskich na każdą nogę.",
    level: ALL_LEVELS.advanced,
    equipment: ["dumbbells"],
    points: 950,
    expectedTime: "9 min",
  },
  {
    title: "Wyzwanie: 15 Wiosłowań Hantlą w Opadzie (Ciężka Hantla, na stronę)",
    description:
      "Używając ciężkiej hantli, wykonaj 15 wiosłowań w opadzie tułowia na każdą stronę.",
    level: ALL_LEVELS.advanced,
    equipment: ["dumbbells"],
    points: 850,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 10 Spacerów Farmera z Ciężkimi Hantlami (15 metrów)",
    description:
      "Trzymając bardzo ciężkie hantle w opuszczonych rękach, przejdź 15 metrów. Odłóż, odpocznij chwilę i wróć. Powtórz 5 razy (łącznie 10 przejść).",
    level: ALL_LEVELS.advanced,
    equipment: ["dumbbells"],
    points: 1100,
    expectedTime: "10 min",
  },
  {
    title:
      "Wyzwanie: 5 Podciągnięć z Dodatkowym Obciążeniem (Weighted Pull-ups)",
    description:
      "Wykonaj 5 podciągnięć nachwytem z dodatkowym obciążeniem (np. hantla między nogami, kamizelka).",
    level: ALL_LEVELS.advanced,
    equipment: ["pull-up-bar", "dumbbells"], // Or other weight
    points: 1350,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 10 Podciągnięć Podchwytem (Chin-ups)",
    description: "Wykonaj 10 pełnych podciągnięć podchwytem.",
    level: ALL_LEVELS.advanced,
    equipment: ["pull-up-bar"],
    points: 800,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 50 Pompek z Gumą Oporową (Mocna Guma)",
    description: "Używając mocnej gumy oporowej na plecach, wykonaj 50 pompek.",
    level: ALL_LEVELS.advanced,
    equipment: ["resistance-bands"],
    points: 650,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 10 Minut EMOM (Co Minutę przez Minutę)",
    description:
      "Przez 10 minut, na początku każdej minuty wykonaj: 3 Podciągnięcia + 6 Pompek + 9 Przysiadów. Odpoczywaj przez resztę minuty.",
    level: ALL_LEVELS.advanced,
    equipment: ["bodyweight", "pull-up-bar"],
    points: 1450,
    expectedTime: "10 min",
  },
  {
    title: "Wyzwanie: Maksymalna Liczba Pompek na Poręczach w Jednej Serii",
    description:
      "Wykonaj jak najwięcej pompek na poręczach (dipów) w jednej, nieprzerwanej serii do upadku mięśniowego.",
    level: ALL_LEVELS.advanced,
    equipment: ["dip-bars"],
    points: 900,
    expectedTime: "4 min",
  },
];

const INTERMEDIATE_CHALLENGES = [
  {
    title: "Wyzwanie: 50 Pompek Klasycznych",
    description:
      "Wykonaj 50 klasycznych pompek z poprawną techniką. Możesz dzielić na serie.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 150,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 75 Przysiadów",
    description:
      "Wykonaj 75 pełnych przysiadów. Dbaj o technikę przez całe wyzwanie.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 160,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 5 Minut AMRAP (Pompki, Przysiady)",
    description:
      "Wykonaj jak najwięcej rund (AMRAP) w ciągu 5 minut: 5 Pompek, 10 Przysiadów.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 300,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 1 Minuta 30 Sekund Deski (Plank)",
    description:
      "Utrzymaj pozycję deski (plank) na przedramionach przez 1 minutę i 30 sekund.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 200,
    expectedTime: "3 min",
  },
  {
    title: "Wyzwanie: 50 Wykroków Zakrocznych (25 na nogę)",
    description:
      "Wykonaj 50 wykroków w tył (zakrocznych), po 25 na każdą nogę.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 180,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 25 Burpees",
    description: "Wykonaj 25 pełnych burpees (z pompką i wyskokiem).",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 400,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 30 Pompek 'Diamentowych'",
    description:
      "Wykonaj 30 pompek z dłońmi blisko siebie, tworząc kształt diamentu. Mocniej angażuje tricepsy.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 350,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 50 Przysiadów z Wyskoku",
    description: "Wykonaj 50 dynamicznych przysiadów zakończonych wyskokiem.",
    level: ALL_LEVELS.intermediate,
    equipment: ["bodyweight"],
    points: 450,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 30 Pompek z Gumą Oporową",
    description:
      "Załóż gumę oporową na plecy, trzymając końce pod dłońmi. Wykonaj 30 pompek z dodatkowym oporem.",
    level: ALL_LEVELS.intermediate,
    equipment: ["resistance-bands"],
    points: 250,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 5 Minut AMRAP (Wiosłowanie Gumą, Przysiady z Gumą)",
    description:
      "Wykonaj jak najwięcej rund (AMRAP) w ciągu 5 minut: 10 Wiosłowań Gumą Stojąc, 15 Przysiadów z Gumą nad kolanami.",
    level: ALL_LEVELS.intermediate,
    equipment: ["resistance-bands"],
    points: 320,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 5 Podciągnięć na Drążku (Nachwytem)",
    description:
      "Wykonaj 5 pełnych podciągnięć nachwytem. Broda powyżej drążka w górnej fazie.",
    level: ALL_LEVELS.intermediate,
    equipment: ["pull-up-bar"],
    points: 500,
    expectedTime: "4 min",
  },
  {
    title: "Wyzwanie: 10 Podciągnięć Australijskich (Inverted Rows)",
    description:
      "Ustaw drążek nisko lub użyj poręczy/stołu. Wykonaj 10 podciągnięć australijskich, przyciągając klatkę piersiową do drążka.",
    level: ALL_LEVELS.intermediate,
    equipment: ["pull-up-bar"],
    points: 280,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 10 Pompek na Poręczach (Dips)",
    description:
      "Wykonaj 10 pełnych pompek na poręczach, schodząc nisko i prostując ramiona u góry.",
    level: ALL_LEVELS.intermediate,
    equipment: ["dip-bars"],
    points: 480,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 20 Wznosów Nóg w Zwisie na Poręczach",
    description:
      "W podporze na poręczach, unieś proste nogi przed siebie 20 razy.",
    level: ALL_LEVELS.intermediate,
    equipment: ["dip-bars"],
    points: 380,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 15 Wyciskań Hantli Nad Głowę Stojąc",
    description:
      "Używając hantli o umiarkowanej wadze, wykonaj 15 wyciśnięć nad głowę stojąc.",
    level: ALL_LEVELS.intermediate,
    equipment: ["dumbbells"],
    points: 420,
    expectedTime: "5 min",
  },
  {
    title: "Wyzwanie: 20 Przysiadów Bułgarskich z Hantlami (10 na nogę)",
    description:
      "Trzymając hantle, wykonaj 10 przysiadów bułgarskich (tylna noga na podwyższeniu) na każdą nogę.",
    level: ALL_LEVELS.intermediate,
    equipment: ["dumbbells"],
    points: 550,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 12 Wiosłowań Sztangą w Opadzie Tułowia",
    description:
      "Używając sztangi o umiarkowanej wadze, wykonaj 12 wiosłowań w opadzie tułowia, przyciągając sztangę do brzucha.",
    level: ALL_LEVELS.intermediate,
    equipment: ["barbell"],
    points: 600,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 15 Martwych Ciągów Rumuńskich (RDL) ze Sztangą",
    description:
      "Używając sztangi o umiarkowanej wadze, wykonaj 15 martwych ciągów rumuńskich, skupiając się na pracy mięśni dwugłowych uda.",
    level: ALL_LEVELS.intermediate,
    equipment: ["barbell"],
    points: 650,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 3 Serie Negatywnych Podciągnięć (po 5 powtórzeń)",
    description:
      "Podskocz do górnej pozycji podciągnięcia i bardzo powoli (3-5 sekund) opuszczaj się w dół. Wykonaj 3 serie po 5 powtórzeń.",
    level: ALL_LEVELS.intermediate,
    equipment: ["pull-up-bar"],
    points: 350,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 2 Minuty Zwis na Drążku (Łącznie)",
    description:
      "Zawiśnij na drążku tak długo, jak potrafisz. Odpocznij i powtórz, aż łączny czas zwisu wyniesie 2 minuty.",
    level: ALL_LEVELS.intermediate,
    equipment: ["pull-up-bar"],
    points: 400,
    expectedTime: "9 min",
  },
  {
    title: "Wyzwanie: 3 Serie Negatywnych Dipów (po 8 powtórzeń)",
    description:
      "Wejdź do górnej pozycji dipa i bardzo powoli (3-5 sekund) opuszczaj się w dół. Wykonaj 3 serie po 8 powtórzeń.",
    level: ALL_LEVELS.intermediate,
    equipment: ["dip-bars"],
    points: 370,
    expectedTime: "8 min",
  },
  {
    title: "Wyzwanie: 20 Wyciskań Hantli Leżąc na Podłodze (Floor Press)",
    description:
      "Leżąc na podłodze z hantlami, wykonaj 20 wyciśnięć, opuszczając łokcie do podłogi.",
    level: ALL_LEVELS.intermediate,
    equipment: ["dumbbells"],
    points: 390,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 7 Minut AMRAP (Wykroki z Hantlami, Wiosłowanie Hantlą)",
    description:
      "Wykonaj jak najwięcej rund (AMRAP) w ciągu 7 minut: 10 Wykroków z Hantlami (5 na nogę), 10 Wiosłowań Hantlą w opadzie (na stronę).",
    level: ALL_LEVELS.intermediate,
    equipment: ["dumbbells"],
    points: 700,
    expectedTime: "7 min",
  },
  {
    title: "Wyzwanie: 10 Przysiadów ze Sztangą z Przodu (Front Squat)",
    description:
      "Trzymając sztangę z przodu na barkach, wykonaj 10 pełnych przysiadów.",
    level: ALL_LEVELS.intermediate,
    equipment: ["barbell"],
    points: 750,
    expectedTime: "6 min",
  },
  {
    title: "Wyzwanie: 10 Wyciskań Sztangi Nad Głowę Stojąc (Overhead Press)",
    description:
      "Używając sztangi o umiarkowanej wadze, wykonaj 10 wyciśnięć nad głowę stojąc.",
    level: ALL_LEVELS.intermediate,
    equipment: ["barbell"],
    points: 800,
    expectedTime: "5 min",
  },
];

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  ...UNIVERSAL_CHALLENGES,
  ...BEGINNER_CHALLENGES,
  ...ADVANCED_CHALLENGES,
  ...INTERMEDIATE_CHALLENGES,
];
