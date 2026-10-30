# Kampagnenvoraussetzungen — öffentlicher Check vom 21. Oktober 2026

**Die Startvoraussetzungen sind weiterhin offen. Die Kampagne bleibt gemäss Projektvorgabe pausiert.** Dieser Check erteilt keine Freigabe und hat keine Einstellungen geändert. Der aktuelle Meta-Kontostatus wurde nicht abgefragt; Quelle für den dokumentierten Status und Zeitplan ist der [Kampagnenplan](META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md#9-decisions-log-and-next-steps).

Direkte öffentliche HTTP-GET-Abrufe am **21.10.2026, 16:09–16:10 UTC**; HTML und strukturierte Angebotsdaten wurden gelesen, Seitenskripte nicht ausgeführt. Keine Anmeldung, Auswahl einer Buchung, Formulareinsendung, Testmessung oder E-Mail. Der Web-Lesedienst lieferte teilweise ältere Kopien und konnte die neue Landingpage nicht öffnen; die folgenden aktuellen Befunde stammen deshalb aus erfolgreichen direkten HTTP-Abrufen.

| Voraussetzung | Aktuell belegbarer Befund | Noch nötig |
| --- | --- | --- |
| Treatwell-Angebot CHF 170 / 90 Minuten | Die [öffentliche Treatwell-Seite](https://www.treatwell.ch/ort/beauty-face-lift/) antwortete mit HTTP 200. Die dort benannte Leistung «Gesichtsbehandlung - Hydra4Face + Microneedling» hat **1 Std. 30 Min.**, den angezeigten Preis **CHF 200** und **CHF 250 durchgestrichen**. Die strukturierten Angebotsdaten bestätigen CHF 200 und 90 Minuten. | Die öffentliche Darstellung bestätigt die passende Dauer, aber **nicht den Kampagnenpreis CHF 170**. Im ausgelesenen Menü und den strukturierten Angeboten wurde kein separates CHF-170-Kombi-Angebot gefunden. Das beweist keine Abwesenheit im Betreiberkonto; Preis und buchbare Kampagnenleistung müssen dort geprüft beziehungsweise angepasst werden. Keine Verfügbarkeit oder Buchung wurde geprüft. |
| Alte Website weiterleiten | [beautyfacelift.ch](https://beautyfacelift.ch/) liefert weiterhin **HTTP 200**, Inhalt der bisherigen Website und `canonical=https://beautyfacelift.ch/`. Die geprüften Startseitenvarianten führen zur alten Domain, nicht zur neuen; siehe unten. | Die geplante 301-Weiterleitung auf die neue Website ist für die Startseite **nicht umgesetzt**. Die [bestehende Umstellungsanleitung](OLD-SITE-SHUTDOWN.md) bleibt offen. Vor Änderungen Sicherung und E-Mail-Erhalt sicherstellen; in diesem Check wurden weder DNS noch Postfachzustand geprüft. |
| Landingpage und Kampagnentermine abgleichen | Die [live Kombi-Landingpage](https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/) antwortete mit HTTP 200 und zeigt **CHF 170 statt CHF 250**, **1 Std. 30 Min.** sowie **gültig bis 14. November 2026**. Dies stimmt mit den [Repository-Konstanten](../../src/pages/lp/aquafacial-microneedling/index.astro) überein. Der dokumentierte pausierte Anzeigenzeitraum ist **15. Oktober bis 13. November 2026**; der Start liegt bereits in der Vergangenheit. | Der Nutzer muss den gültigen Start-/Endzeitraum festlegen. Danach müssen Anzeigenzeitplan, sichtbares Angebotsende, Seite und Anzeigenmaterial geprüft und gegebenenfalls gemeinsam angepasst werden. Hier wurde kein neues Datum gewählt oder bestehendes Datum verändert. |

Geprüfte Weiterleitungsketten der alten Startseite:

| Aufruf | Tatsächliche HTTP-Antwort / Ziel |
| --- | --- |
| `https://beautyfacelift.ch/` | 200, alte Website, Canonical auf dieselbe URL |
| `http://beautyfacelift.ch/` | 301 → `https://beautyfacelift.ch/` → 200 |
| `https://www.beautyfacelift.ch/` | 301 → `https://beautyfacelift.ch/` → 200 |
| `http://www.beautyfacelift.ch/` | 301 → `https://www.beautyfacelift.ch/` → 301 → `https://beautyfacelift.ch/` → 200 |

Dies ist kein vollständiger Test aller alten Unterseiten. Die separate Voraussetzung **Cockpit Phase 1 vor Kampagnenstart** bleibt bestehen, einschliesslich der [Datenschutz-, Betriebs- und Freigabeschritte](LEAD-COCKPIT-PLAN.md). Erst nach Klärung dieser Punkte kann ein konkreter Start zur ausdrücklichen Freigabe vorgelegt werden. Keine Kampagnenaktivierung, Meta-Änderung oder Erweiterung des Umfangs folgt aus diesem Dokument.
