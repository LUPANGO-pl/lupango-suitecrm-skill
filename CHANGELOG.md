# Changelog

## 2.1.0 — 2026-09-12

- Przygotowano dystrybucję społecznościową jako Lupango SuiteCRM Skill: angielski README, instrukcje instalacji, dokumenty współtworzenia, formularze zgłoszeń oraz workflow CI i szkiców wydań. Identyfikator skilla pozostaje bez zmian.

- Dodano format katalogu potwierdzonych problemów SuiteCRM 8, bez fikcyjnych przypadków.
- Dodano rejestr przeglądów autorskich procedur z zakresem, dowodami, ograniczeniami i wyzwalaczami aktualizacji.
- Dodano warunkowe checklisty uploadu/PHP, bazy danych, Composer i wdrożeń z wieloma replikami; routing z diagnostyki i operacji.
- Dodano rubrykę oceny odpowiedzi i aktualny zestaw 12 zadań dla zakresu 2.x. Nie przenoszono historycznych ocen modeli.
- Zachowano zakres SuiteCRM 8 i przypięty korpus dokumentacji; przebudowano oba warianty. Wyniki i ograniczenia: VALIDATION.md.

## 2.0.1 — 2026-09-12

- Rozszerzono bezpieczny inspektor projektu o obecność manifestów i typowych powierzchni customizacji, bez odczytu konfiguracji, nazw customizacji ani sekretów.
- Doprecyzowano discovery: lokalny wzorzec należy znaleźć i ocenić przed nową implementacją; kolejne komendy mają klasyfikację ryzyka.
- Core modification nie jest deklarowane na podstawie samej obecności plików — wymaga porównania z czystym wydaniem dokładnie zainstalowanej wersji.

## 2.0.0 — 2026-09-07

- Zakres ograniczony do SuiteCRM 8 na polecenie użytkownika; brak samodzielnego wsparcia 7.x.
- Usunięto 180 stron 7.x, pełne kopie snapshotów, osobny indeks, playbook i importer 7.x.
- Pozostawiono 22 dokumenty legacy powiązane z dowodami w dokumentacji 8.x; nowa mapa i procedura ograniczają użycie do aktywnej ścieżki w 8.
- Zaktualizowano metadane, wyszukiwanie, walidację pochodzenia i testy; ponownie zbudowano oba ZIP-y. Wyniki: VALIDATION.md.

## 1.0.0 — 2026-09-07

- Jeden samodzielny SuiteCRM Expert Skill: procedury 7/8, administracja, rozwój, integracje AI/API, diagnostyka, operacje i cutover.
- Wspólny korpus 406 dokumentów, osobne źródła i indeks 7.x; brak duplikowania całego korpusu GPT 8.x.
- Wariant OpenAI bez shella i OpenCode z opcjonalnym wyszukiwaniem oraz inspektorem Node.js.
- Powtarzalne ZIP-y z kontrolą bajtów, hashy i linków; raport wyszukiwania oraz rzeczywiste odpowiedzi sześciu scenariuszy.
- Usunięte zależności od prywatnego GPT, placeholdera Actions, brakującego dodatku i hasła uchylającego poufność.
- Szczegółowe wyniki i ograniczenia wydania: VALIDATION.md.
