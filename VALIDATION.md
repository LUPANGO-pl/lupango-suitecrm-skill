# Walidacja wydania 2.1.0 — SuiteCRM 8

Data: 2026-09-12. Uzupełnienie procedur i utrzymania; bez zmiany korpusu oficjalnego ani runtime.

| Kontrola | Wynik |
| --- | --- |
| Oficjalny quick_validate.py | PASS: Skill is valid! |
| Build i validate | PASS: 253 pliki rdzenia, 226 dokumentów, 2 ZIP-y; powtarzalność i zgodność bajtowa |
| npm test | 43 przypadki: 41 PASS, 0 FAIL, 2 SKIP — dowiązania plikowe Windows (EPERM) |
| npm run benchmark | 24 przypadki; hit@3 = 1, recall@10 = 1, MRR = 0.9375 |
| npm run docs:check | PASS: lokalna integralność dokumentów i linków, bez sprawdzania aktualności online |
| git diff --check | PASS |

Pierwszy build wykrył CRLF w zmienionym SKILL.md; przywrócono wymagane LF i ponowiono build z wynikiem PASS. Pierwsze próby użycia lokalnej biblioteki YAML i zapisu raportu benchmarku zablokowały uprawnienia środowiska; powtórzenie z zatwierdzonym dostępem zakończyło się powodzeniem.

## Artefakty 2.1.0

| Wariant | Pliki | Rozmiar ZIP | SHA-256 |
| --- | ---: | ---: | --- |
| openai | 253 | 555048 B | `e47cbee985b378fa9efe108c3cb1557ebd683c2d90ff350ece923d56e774de10` |
| opencode | 255 | 561754 B | `b26b33f9464c72182c60354179f1141532cd0f17ca57555f108446da393f70dd` |

Manifest: [dist/manifest.json](dist/manifest.json). Poprzednie paczki i manifest zachowano w `dist/archive/2.0.1/`.

## Zakres sprawdzenia

Sprawdzono routing nowych referencji, rozdzielenie hipotez od potwierdzonych przypadków, warunkowe stosowanie checklist oraz rozróżnienie przeglądu redakcyjnego od weryfikacji produktu. Dodano [rubrykę i zadania 2.x](tests/behavior/rubric.md). Nie wykonano nowej serii odpowiedzi modeli, niezależnej ewaluacji ani prób na żywym CRM; rubryka i scenariusze nie są dowodem poprawy odpowiedzi. Katalog nie zawiera jeszcze potwierdzonych przypadków.

Nie instalowano ani nie publikowano skilla. Historyczne wyniki poniżej odnoszą się wyłącznie do wskazanych starszych wydań.

---
# Archiwum: walidacja wydania 2.0.1 — SuiteCRM 8

Zakres ograniczono do SuiteCRM 8 i odziedziczonych komponentów używanych przez 8. Brak samodzielnej obsługi 7.x.

| Kontrola | Aktualny wynik |
| --- | --- |
| Oficjalny quick_validate.py | Skill is valid! |
| Build i npm run validate | PASS: 250 plików rdzenia, 226 dokumentów, 2 ZIP-y; powtarzalność i zgodność bajtowa |
| npm test | 43 przypadki: 41 PASS, 0 FAIL, 2 SKIP (dowiązania plikowe Windows) |
| npm run benchmark | 24 przypadki: hit@3 = 1, recall@10 = 1, MRR = 0.9375 |
| Wyszukiwanie samodzielnej dokumentacji 7.x | Brak wyników; test zaliczony |
| Legacy wewnątrz 8.x | Wszystkie 22 strony mają powiązany dokument 8.x z tej samej rewizji i zgodnym hashem |
| Próba importu lub przemianowania źródła 7.x | Odrzucana przez walidator; test zaliczony |
| Rozpakowany ZIP OpenCode | Wyszukiwanie 8.x i inspekcja działają z niezależnego katalogu |

Aktualne artefakty zastępują ZIP-y 1.0.0 pod tymi samymi nazwami:

| Wariant | Pliki | Rozmiar ZIP | SHA-256 |
| --- | ---: | ---: | --- |
| OpenAI | 250 | 550 453 B | `8de3f7f45ff5872b5b7a4cd2239176aaa7857f956d3de4654a3fe8d4474ab552` |
| OpenCode | 252 | 557 159 B | `11b2d7fce345d18fa47a8cff7e3807e41cc19e7ba6ef2c8e37c860b85d27e671` |

Manifest: `dist/manifest.json`. Usunięto 180 stron 7.x, trzy źródłowe snapshoty z połączonego projektu, osobny indeks i playbook oraz importer. Oryginalne materiały użytkownika w sąsiednich projektach pozostawiono bez zmian. Treści zachowanych oficjalnych stron nie modyfikowano. Kontekst 7→8 pozostaje tylko dla migracji dostosowań i zrozumienia odziedziczonego wykonania w 8.

Nie wykonano nowej serii odpowiedzi modeli ani testów na żywym CRM. Historyczne raporty zachowania 1.0.0 nie potwierdzają jakości zmienionego zakresu 2.0.0. Nie instalowano paczek w aplikacjach użytkownika. Powiązanie strony legacy z dokumentacją 8.x uzasadnia jej obecność, lecz nie dowodzi poprawności każdego historycznego przykładu dla każdego wydania 8. Wymagane jest potwierdzenie aktywnej ścieżki i wydania. Aktualności dokumentacji nie sprawdzano online podczas tej redukcji zakresu.

## Archiwum: wyniki wydania 1.0.0 przed ograniczeniem zakresu

Poniższe liczby i hashe dotyczą wyłącznie poprzedniego wydania. Obecne ZIP-y i wyniki podano powyżej.

Data: 2026-09-07. Środowisko: Windows, Node.js 24.14.0. Poniższe wyniki dotyczą lokalnie wykonanych kontroli, a nie uruchomienia zmian na serwerze SuiteCRM.

| Kontrola | Wynik |
| --- | --- |
| Oficjalny `skill-creator/scripts/quick_validate.py` | `Skill is valid!`; Python 3.12 + lokalny PyYAML 6.0.3 |
| `npm run build` | PASS: każdy wariant zbudowany dwukrotnie, zgodne SHA-256; identyczność ZIP ze źródłami |
| `npm run validate` | PASS: 430 plików rdzenia, 406 dokumentów, 2 archiwa |
| `npm test` | 43 przypadki: 41 PASS, 0 FAIL, 2 SKIP |
| `npm run benchmark` | 28 zapytań: hit@3 = 1, recall@10 = 1, MRR = 0.922619; brak wyników z niewłaściwego zakresu |
| `npm run docs:check` | PASS: lokalna integralność korpusu i linków; bez kontroli aktualności online |
| Rozpakowany ZIP OpenCode | PASS: wyszukiwanie 7.x i inspekcja uruchomione z niezależnego katalogu roboczego |
| Niezależne użycie skilla | 6 rzeczywistych odpowiedzi, bez wykazanej usterki; `tests/behavior/independent-results.md` |
| Porównanie z bazą OpenAI 8 | 6 odpowiedzi bazowych; brak zaobserwowanej regresji, większa użyteczność dla raportu 7.x i dodatkowa szczegółowość recovery/AI; `tests/behavior/matched-comparison.md` |

Dwa SKIP dotyczą tworzenia dowiązań do plików zabronionego w tej konfiguracji Windows (`EPERM`). Testy odrzucania junctions w katalogach przeszły. Nie oznacza to sprawdzenia wszystkich zachowań symlinków na innych systemach.

## Gotowe artefakty

| Wariant | Pliki | Rozmiar ZIP | SHA-256 |
| --- | ---: | ---: | --- |
| OpenAI | 430 | 1 077 999 B | `a7cd9affc1a05448b9214996ebca5ebae0966c86f108bf59634e21ed74567524` |
| OpenCode | 432 | 1 084 486 B | `93f6b8e5e699481847429ceec14480e468bac1205ee0b0147fffca5ba499b11a` |

Manifest plików i hashy jest w `dist/manifest.json`. Testy odrzucają podmianę oczekiwanego wpisu ZIP obcym pustym plikiem, błędne oznaczenie źródła 7.x jako 8.x, niebezpieczne ścieżki i uszkodzone archiwa. Test transformacji sprawdza wszystkie 180 stron 7.x względem granic i bajtów znormalizowanych oryginalnych snapshotów. `.gitattributes` zachowuje bajty źródeł przy checkout na Windows.

## Zakres dowodów i ograniczenia

- Benchmark mierzy wyszukiwanie dokumentów przy wybranym zakresie, nie jakość odpowiedzi modelu. Oczekiwana strona schedulera 7.x to sekcja System w istniejącym snapshocie, nie wymyślony osobny dokument Schedulers.
- Porównanie zachowania wykonał ten sam ewaluator po wcześniejszej ekspozycji na nowy skill; nie było ślepe ani statystycznie replikowane. Raport ujawnia ten warunek. Wyniki 7.x są poprawą pokrycia względem bazy skupionej na 8.x, nie dowodem błędu poprzedniego skilla.
- Scenariusze HTTP 500, scheduler, poczta, cutover, migracja JS i lokalna edycja opisano do dalszej oceny w `tests/behavior/scenarios.md`; nie deklarujemy ich wykonania na podstawie samych checklist. Sześć zapisanych prób obejmuje poradę bez sieci/instancji. Końcowe poprawki linków routingu i proporcjonalności testów sprawdzono strukturalnie, nie nową pełną serią odpowiedzi modeli.
- Nie wykonano instalacji w koncie OpenAI/OpenCode użytkownika ani skanowania paczki przez usługę, nie podłączono Actions i nie testowano na żywym CRM. Brak tych działań nie blokuje lokalnego wydania instrukcji i narzędzi, ale nie uprawnia do deklaracji certyfikowanej kompatybilności usług lub produkcji.
- Korpus 8.x jest przypięty do znanego commita, a 7.x pochodzi z dostarczonych snapshotów o nieznanej rewizji upstream. Aktualne wsparcie, bezpieczeństwo i procedury konkretnego wydania wymagają osobnej weryfikacji źródeł przy użyciu skilla.
- Trzy problemy wykryte w niezależnym przeglądzie narzędzi poprawiono: obcy pusty wpis ZIP, mylne przypisanie legacy do 8.x i brak polityki końców linii. Dwa pierwsze mają testy regresji; zachowanie Git określa `.gitattributes`.

Wydanie jest gotowe do instalacji i praktycznych prób użytkownika. Nie przypisujemy mu oceny „10/10” ani gwarancji przewagi w każdym zadaniu.
