# Lupango SuiteCRM Skill

[English](README.md) · [Instalacja](docs/INSTALLATION.md) · [Współtworzenie](CONTRIBUTING.md)

Niezależny projekt społecznościowy, niepowiązany oficjalnie z SalesAgility, OpenAI ani OpenCode. Identyfikator instalowanego skilla pozostaje `suitecrm-expert-skill`.

Samodzielny skill do SuiteCRM 8: administracja, rozwój, integracje, migracje, diagnostyka i utrzymanie. Wersja 2.0.0 usuwa obsługę samodzielnych instalacji 7.x. Zachowuje wyłącznie odziedziczone komponenty używane przez 8.x oraz niezbędny kontekst przenoszenia dostosowań do 8. Nie wymaga prywatnego GPT ani połączenia z żywym CRM.

Wydanie **2.1.0** dodaje katalog potwierdzonych przypadków (format, bez niezweryfikowanych wpisów), rejestr przeglądów i szczegółowe checklisty środowiskowe. Rubryka jakości odpowiedzi i aktualne zadania 2.x znajdują się w `tests/behavior/rubric.md`.

## Gotowe paczki

- `dist/suitecrm-expert-skill-openai.zip` — instrukcje, indeksy i dokumentacja; działa bez shella.
- `dist/suitecrm-expert-skill-opencode.zip` — ta sama treść plus wyszukiwanie i inspekcja lokalnego projektu przez Node.js.
- `dist/manifest.json` — SHA-256 ZIP-ów, lista i hashe plików, rozmiary i liczby wpisów.

Obie paczki zawierają folder `suitecrm-expert-skill/` z `SKILL.md` w środku. Nie instaluj obu w tym samym środowisku jako konkurencyjnych kopii. Wersje źródłowe sprzed scalenia pozostają w sąsiednich katalogach, bez nadpisania.

## Instalacja

**OpenAI:** przekaż wariant OpenAI do dostępnego w Twoim środowisku importu skills. Dostępność importu i wynik skanowania trzeba potwierdzić w aplikacji; lokalny build nie dowodzi przyjęcia paczki przez usługę. Dla projektu Codex możesz rozpakować folder skilla do `.agents/skills/suitecrm-expert-skill/` i wywołać `$suitecrm-expert-skill`.

**OpenCode:** rozpakuj wariant OpenCode do `.opencode/skills/suitecrm-expert-skill/` w wybranym projekcie. Potwierdź wykrycie skilla w swojej instalacji. Nie dodawaj automatycznych uprawnień do shella, produkcji ani CRM. Dostępne narzędzia i autoryzację określa środowisko użytkownika.

Nic nie zostało automatycznie zainstalowane, opublikowane ani podłączone do CRM.

## Użycie

- „Użyj SuiteCRM Expert Skill: scheduler działa ręcznie, ale nie automatycznie. Sprawdź udostępniony projekt.”
- „Zaprojektuj walidację Account w SuiteCRM 8 obejmującą UI, API i import.”
- „Pomóż skonfigurować raport sprzedaży według handlowca w SuiteCRM 8.”
- „Przygotuj plan odzyskania danych po błędnej synchronizacji n8n.”

W katalogu źródłowym (Node.js 20+; bez zależności npm):

```text
npm run search -- --scope suitecrm-8 --limit 3 "save handlers"
npm run search -- --scope legacy-in-8 --limit 3 "logic hooks"
node runtime/inspect-suitecrm.mjs C:/path/to/application
```

W zainstalowanym wariancie OpenCode narzędzia znajdują się w `scripts/`. Inspektor czyta wyłącznie znane pliki metadanych i sprawdza obecność elementów architektury; nie wykonuje PHP, nie czyta `.env` ani logów, nie diagnozuje stanu serwera na żywo. Rozróżnia kandydatów wersji z różnych plików, ponieważ wersja legacy wewnątrz 8.x może być inna niż wydanie produktu.

## Budowanie i sprawdzanie

```text
npm run build
npm run validate
npm test
npm run benchmark
npm run docs:check
```

Build jest lokalny i powtarzalny: sprawdza hashe korpusu, linki autorskie, buduje każdy ZIP dwukrotnie i porównuje bajty z oczekiwanym drzewem. `npm test` wymaga uprzedniego builda, ponieważ testuje także gotowe archiwa. `docs:check` oznacza kontrolę lokalnej integralności, nie sprawdzenie aktualności online.

Wyniki i ograniczenia są w `VALIDATION.md`. Raporty odpowiedzi modeli są w `tests/behavior/`, wynik wyszukiwania w `tests/evidence/retrieval.json`. Nie przeniesiono ocen PASS starych projektów jako wyniku nowego wydania.

## Pochodzenie i utrzymanie

Korpus ma 226 dokumentów z przypiętego korpusu OpenAI 8. Wśród nich pozostają 22 odwołania do legacy używanego przez 8.x. Każde ma wskazany dokument 8.x uzasadniający jego obecność w `references/legacy-in-8-index.md` i `provenance.json`. Źródło: SuiteDocs commit `663619ebfbdc28ba828cbe6a34fc685460b920a9`, pobrany 2026-09-06. Snapshot nie stanowi dowodu bieżącego wsparcia.

`source-import.json` dokumentuje pochodzenie i zmianę zakresu; pełne snapshoty 7.x usunięto także z tego projektu. `references/provenance.json` przypisuje każdą zachowaną stronę do źródła. Prywatna instrukcja GPT, hasło uchylające poufność i placeholder Actions nie są dystrybuowane. Historyczne raporty w `tests/behavior/` dotyczą wersji 1.0.0 i nie są dowodem jakości zawężonego wydania.

Procedurę aktualizacji opisuje `MAINTENANCE.md`. Importer pełnej dokumentacji 7.x usunięto, aby nie przywracał wyłączonego zakresu. Do normalnego użycia i budowania wystarcza ten katalog.

Kod i oryginalne instrukcje projektu korzystają z licencji MIT w `skill/suitecrm-expert-skill/LICENSE-MIT.md`. Dokumentacja SuiteDocs zachowuje GFDL-1.3-or-later i atrybucję w `references/NOTICE.md` oraz `references/LICENSE-GFDL.md`. Przechowywanie bajtów przy checkout reguluje `.gitattributes`.
