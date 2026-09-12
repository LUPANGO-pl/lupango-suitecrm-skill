# Mapa przeniesionych kompetencji

**Aktualizacja 2.0.0:** poniższa tabela opisuje historyczne scalenie 1.0.0. Polecenie użytkownika ograniczające zakres do SuiteCRM 8 zastępuje wiersze o pełnej obsłudze 7.x. Snapshoty 21–23, indeks i playbook 7.x usunięto. Pozostają 22 dokumenty `legacy-in-8` z jawnym dowodem 8.x, opisane w `references/legacy-in-8-index.md` i `references/playbooks/legacy-in-8.md`. Dawne wyniki odpowiedzi dla 7.x nie są kryterium akceptacji 2.0.0.

Źródła: oryginalna instrukcja GPT i 20 Knowledge w `SUITECRM_EXPERT_GPT_CODEX_PACKAGE`; ogólny skill OpenCode zawiera identyczne Knowledge; pełne skills SuiteCRM 8 OpenAI/OpenCode. `SKILL.md` znajduje się w `skill/suitecrm-expert-skill/`. Nazwy playbooków, indeksów i polityki źródeł odnoszą się do jego katalogu `references/`; tooling, runtime, tests i dokumentacja utrzymania należą do katalogu projektu.

| Źródło / kompetencja | Cel i decyzja | Dowód lub scenariusz |
| --- | --- | --- |
| GPT Role, Primary objective, Language, Behavioral rules | SKILL.md: doradztwo/wykonanie, język, odbiorca, brak wymyślania produktu | independent-results scenariusze 3, 5 |
| GPT Core scope: użytkownik i administrator | playbooks/administration.md; pełne źródła użytkownika 7 i 8 | independent-results 3; retrieval seven-reports/campaigns |
| GPT Version-awareness, Knowledge 03 | source-policy.md, discovery, suitecrm-7.md | unified.test: izolacja zakresów; independent-results 1 |
| GPT Diagnostics, Knowledge 02, 11 | diagnostics.md i operations.md; przyczyna wymaga dowodów | scenariusz HTTP 500 w tests/behavior/scenarios.md |
| Knowledge 04, 12, OpenCode 8 kontrakt frontend/backend | customization-routing.md, suitecrm-7.md, testing-verification.md | independent-results 1 |
| Knowledge 05, 15: deployment, scheduler, poczta i wydajność | operations.md, production-safety.md | scenariusze operacyjne w scenarios.md; inspector tests |
| Knowledge 06: API/middleware/AI | integrations.md, integration-recovery.md | independent-results 2, 5 |
| Knowledge 07 i GPT Security | security.md, rdzeń oraz proporcjonalne production-safety.md | independent-results 2, 6; testy sekretów inspektora |
| Knowledge 08, 15: migration/cutover/rollback | upgrades-migrations.md, cutover.md | scenariusz cutover w scenarios.md |
| Knowledge 09 i GPT Response format | elastyczna odpowiedź w SKILL.md; bez sztywnego układu | independent-results 3, 5 |
| Knowledge 10: compatibility | source-policy.md: weryfikacja konkretnego wydania; lista technologii nie oznacza wsparcia | independent-results 4 |
| Knowledge 01: routing i freshness | source-policy.md, dwa indeksy, provenance | testy hasha, linków i źródeł |
| Knowledge 13 | scenariusze i wyniki w tests/behavior; poprawiono kryterium „zawsze logic hook” | independent-results 1, matched-comparison |
| Knowledge 14 | MAINTENANCE.md poza paczką użytkową | procedura utrzymania; nie jest oceną modelu |
| Knowledge 20 i 24 | nie kopiowano drugiego korpusu 8/community; istniejące przypięte strony OpenAI | validateSource i source-import |
| Knowledge 21–23 | 180 stron 7.x, osobne pochodzenie i indeks | hashe oryginałów i stron; benchmark 7.x |
| OpenAI 8: źródła, bezpieczeństwo, praca bez shella | wspólny rdzeń i korpus; brak skryptów w OpenAI ZIP | archive parity; independent-results |
| OpenAI 8/OpenCode 8: search i inspekcja | runtime/search-docs.mjs z bazy OpenAI (port OpenCode), nowy przenośny inspektor Node zachowujący value-free discovery | testy search i inspect; benchmark 28 przypadków |
| OpenAI 8: ZIP i walidacja | odziedziczona biblioteka ZIP, nowe dwa warianty i weryfikacja provenance | zip.test, unified.test i npm run validate |
| GPT Confidentiality / hasło | hasło i blokadę przeglądu własnej instrukcji pominięto; ochrona sekretów pozostaje | independent-results 6 |
| Actions placeholder, brakujący addendum | brak fikcyjnych narzędzi; istniejąca polityka źródeł zastępuje brakujący link | walidacja drzewa i linków |

Wiersze odsyłające wyłącznie do scenarios.md oznaczają przygotowane przypadki dalszej walidacji, nie wykonane testy zachowania. Nie używać mapy jako deklaracji zaliczenia wszystkich scenariuszy na żywym CRM.
