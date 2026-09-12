# Utrzymanie SuiteCRM Expert Skill

Jedno źródło treści to `skill/suitecrm-expert-skill/`. Narzędzia wykonawcze są w `runtime/`. Nie edytuj plików wewnątrz ZIP; po zmianie zbuduj oba warianty.

Po istotnej zmianie SuiteCRM lub wykazanym błędzie:

1. Ustal zadanie, wydanie i źródło wymagające aktualizacji. Pobierz oficjalną dokumentację w oddzielnym katalogu roboczym, zapisz commit albo datę oraz adres źródła. Zmiana snapshotu nie potwierdza automatycznie aktualności wszystkich zaleceń.
2. Porównaj potrzebne strony z obecnym korpusem. Dozwolone zakresy: `suitecrm-8`, `shared-api-v8`, `legacy-in-8` i `current-online`. Nie importuj samodzielnej dokumentacji 7.x. Dla legacy w 8 wymagaj powiązanego dokumentu 8.x z tej samej rewizji i potwierdzenia faktycznej ścieżki wykonania przed implementacją.
3. Zaktualizuj odpowiednie strony, hashe, tożsamość źródła, mapę legacy i indeks. Walidator wymaga dla każdego `legacy-in-8` pola `legacyEvidence` z istniejącą stroną 8.x i jej hashem. Zachowaj atrybucję i licencje; nie duplikuj całych podręczników.
4. Zmień procedurę tylko w zakresie wykazanego problemu. Dodaj scenariusz sprawdzający zachowanie, nie wystąpienie określonych słów. Nie przenoś prywatnych danych klienta do przykładu.
5. Uruchom build, validate, test, benchmark i docs:check. Przejrzyj wyniki odpowiedzi w obu trybach: bez narzędzi oraz z narzędziami. Porównując modele, zachowaj ten sam model, narzędzia, dane i warunki; ujawnij wcześniejszą ekspozycję ewaluatora.
6. Zaktualizuj wersję w package.json, metadata SKILL.md, changelog i raport walidacji. Ponownie zbuduj ZIP-y, zachowaj poprzednie wydanie do wycofania. Instalację i publikację wykonuj dopiero w zakresie autoryzacji użytkownika.

Autorskie procedury i testy nie są oficjalną dokumentacją produktu. Narzędzia lokalne nie zapewniają dostępu do Actions. Prawdziwe kontrakty integracji z żywym CRM dodaje się jako osobny zakres z uwierzytelnianiem, kontrolą uprawnień, testami i jasno określonymi skutkami operacji.

## Przeglądy i regresje od 2.1.0

- Aktualizuj [rejestr przeglądów](skill/suitecrm-expert-skill/references/playbook-review.md) dla zmienionych procedur: data, zakres, dowód i ograniczenia. Przegląd redakcyjny nie oznacza kontroli aktualności online.
- Po potwierdzonym incydencie dodaj zanonimizowany przypadek według [formatu katalogu](skill/suitecrm-expert-skill/references/playbooks/known-issues.md), wraz z dowodem przyczyny i sprawdzeniem naprawy. Nie dodawaj niepotwierdzonych hipotez jako znanych usterek.
- Oceniaj odpowiedzi według [rubryki 2.x](tests/behavior/rubric.md), zachowując rzeczywiste odpowiedzi i warunki prób. Przy braku wykonania wpisz „nie wykonano”; scenariusz nie jest wynikiem.
- Po istotnym wydaniu produktu i okresowo, np. kwartalnie, przejrzyj zaległe wyzwalacze aktualizacji oraz przypadki. Odświeżaj tylko materiały wymagające zmiany, z jawnym dowodem weryfikacji.
