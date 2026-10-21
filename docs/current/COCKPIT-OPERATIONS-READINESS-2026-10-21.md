# Betriebsbereitschaft – Fortsetzung vom 21. Oktober 2026

**Arbeitsstand zur Prüfung. Keine Aktivierungs-, Migrations- oder Deploymentfreigabe.** Ausgangspunkt ist der geprüfte Kandidat `e842d192` in [Entwurfs-PR #62](https://github.com/lefteyep/beautyfacelift/pull/62), [CI erfolgreich](https://github.com/lefteyep/beautyfacelift/actions/runs/39634953255). Produktion bleibt `d019a003`. Diese Fortsetzung liest keine früheren Chats.

**Später bestätigter Kontoschritt:** Der Nutzer hat den vorbereiteten Zero Trust Free-Plan freigegeben und den Checkout selbst abgeschlossen; Dashboardnachweis: Free, 0 USD/Monat, Teamdomain `mediapaulo.cloudflareaccess.com`. Anschliessend wählte er für den konkreten Cockpit-Login ausdrücklich **«Nur als Entwurf behalten»**. Kein neuer IdP, keine Access-Policy oder Anwendung wurde gespeichert, kein Live-Login getestet. Der Speicherfehleralarm bleibt ebenfalls ausdrücklich Entwurf. [Access-Stand und genaue Entwurfswerte](COCKPIT-ACCESS-READINESS.md) sind massgeblich; die früheren Kontoprüfungen unten sind datierte Nachweise, keine Behauptung, dass die Free-Einschreibung noch aussteht.

## Aktueller Kontonachweis

Lesende Prüfung im vorhandenen Cloudflare-Konto am 21.10.2026; keine Datenbankinhalte mit Kundendaten geöffnet und keine Kontoeinstellung gespeichert:

| Punkt | Beobachtung | Konsequenz |
| --- | --- | --- |
| Projekt-D1 | `beautyfacelift-leads`, ID `8df484ca-625f-4250-be9a-3c09279ebdde` | Stimmt mit dem Kandidaten überein; kein neues Ziel verwenden |
| D1-Dashboard | 0 Tabellen, 12,29 kB; Abfrage-/Lese-/Schreibzähler der letzten 24 Stunden jeweils 0 | Keine Anwendungsmigration durch diese Prüfung. Dashboardzählung ersetzt keine spätere Schema-/Migrationsprüfung vor Freigabe |
| D1 Time Travel | Oberfläche bietet sieben Tage; sichtbares Fenster beginnt bei Erstellung am 20.10.2026 | Verfügbarkeit angezeigt, Wiederherstellung nicht ausgeführt. Keine Aussage über eine erfolgreich getestete Wiederherstellung |
| D1 Einstellungen | Region Western Europe, Jurisdiction None, Read replication Disabled | Kein Nachweis einer verbindlichen ausschliesslichen EU-/Schweiz-Verarbeitung; Vertrags-/Übermittlungsprüfung bleibt offen |
| Cloudflare-Browser | Im richtigen bestehenden Konto angemeldet | Lesender Dashboardzugang funktioniert |
| Cloudflare-Connector | `whoami` erneut interner Fehler | Keine API-Verbindung oder neuen Berechtigungen behaupten |
| Wrangler | Version 4.148.0 vorhanden; Anmeldung abgelaufen und Aktualisierung fehlgeschlagen | Kein Remote-CLI-Befehl ausgeführt. Kein Token ausgelesen, neu erstellt oder Rechteumfang erweitert |
| Cloudflare Alerts | Vorhandene Übersicht zeigt einen aktiven Passive-Origin-Alarm; neuer Custom-Alert-Dialog bietet Workers Logs | Vorhandenen Alarm nicht verändern. Seine Existenz beweist keine Erkennung von D1-Speicherfehlern |

Private Screenshots bleiben ausserhalb des Repositorys unter `output/coordination/pilot-evidence/`: `d1-time-travel-readonly.jpg` und `cloudflare-storage-alert-draft.jpg`. Keine Token, PINs oder Kontaktpayloads wurden gespeichert.

## Vorbereiteter Speicherfehleralarm

Im Konto wurde nur ein **ungespeicherter** Entwurf vorbereitet. Die Oberfläche generierte und akzeptierte [diese Abfrage](operations/lead-storage-alert.sql); ihre Vorschau zeigt derzeit null Treffer. Das ist erwartbar, weil der neue Marker noch nicht produktiv deployed ist, und beweist keinen funktionierenden Alarmempfang.

**Nutzerentscheidung am 21.10.2026: «Nur als Entwurf behalten».** Keine Aktivierung, kein Empfänger angelegt, keine Testbenachrichtigung. Der gespeicherte Vorschlag ist die SQL-/Verfahrensdatei; ein ungespeichertes Browserformular ist keine eingerichtete Benachrichtigung. Diese Entscheidung gilt, bis der Nutzer sie ausdrücklich ändert.

| Einstellung | Konkreter Vorschlag |
| --- | --- |
| Name | `beautyfacelift – Lead-Speicherfehler` |
| Quelle | Workers Logs, genau dieses Konto und `scriptName = beautyfacelift` |
| Signal | `message LIKE '%lead_storage_failed%'`, nur Anzahl zurückgeben |
| Auswertung | Threshold `>= 1`, Evaluation window `10m`, Automatic time range |
| Häufigkeit | Execution interval `10m`, Repeat alert interval `1h` |
| Vorgesehener Empfänger | `mediapaulo@gmail.com`; im Entwurf noch **nicht eingetragen**, kein zusätzlicher Verteiler |
| Versand | Cloudflare-eigene Benachrichtigung, unabhängig vom Resend-Versand des Workers; keine Anfrage-ID, Namen, Kontakt- oder Nachrichtentexte in Name/Beschreibung/Alarmabfrage |

Cloudflare dokumentiert [Abfragealarme](https://developers.cloudflare.com/notifications/monitors/) und kontoabhängige [SQL-Datenquellen](https://developers.cloudflare.com/analytics/sql-api/datasets/). Die tatsächliche Kontooberfläche bietet `logs.workersLogs`, `scriptName` und `message` an. Dies ist kein Codex-Heartbeat, kein Setup-Relay und kein koordinierender Ersatzmonitor. Eine Aktivierung oder Testbenachrichtigung folgt erst auf die ausdrückliche Entscheidung zum neuen Benachrichtigungsweg.

Vor einer Capture-Freigabe noch nachzuweisen:

1. Die gewählte Operatorperson und Vertretung übernehmen Empfang und Reaktion; Reaktionszeit und privater Incident-/Abgleichort werden festgelegt.
2. Cloudflare akzeptiert die endgültige Konfiguration mit ausschliesslich dem freigegebenen Agenturempfänger; Wiederholung, Speicherung/Sampling und Verfügbarkeit des Logsignals sind überprüft.
3. Eine ausdrücklich erlaubte, als synthetisch bezeichnete Testmeldung erreicht den Empfänger. Kein echtes Kontaktformular auslösen, D1-Ausfall nicht absichtlich in Produktion herbeiführen und keinen bestehenden Kundenfall als Test verwenden.
4. Der Operator bestätigt den Empfang und führt den privaten Anfrage-ID-Abgleich vor; ein vorhandener Alarm oder eine Vorschau mit null Treffern schliesst diese Prüfung nicht.
5. Auch Ausfall des Cloudflare-Log-/Alarmwegs und Mailboxzugangs werden in der vereinbarten manuellen Kontrolle berücksichtigt. Der zusätzliche Weg ist unabhängig von Resend, nicht von Cloudflare oder dem Empfängerpostfach.

## Getrennte D1-Wiederherstellungsprobe

Für die freigegebene Probe wurden genau zwei neue Datenbanken im bestehenden Konto erstellt. Die Namensliste vor Erstellung enthielt nur die bisherige Projektdatenbank und nach dem ersten Schritt das erste Testziel; keine gleichnamige Datenbank wurde übernommen oder geleert. Keine Worker-Bindung, Route, Domain, Cron, Access-Aktivierung oder Produktivkonfiguration wurde hinzugefügt; kein Tarifwechsel und keine Verwendung echter Anfragen oder Produktivexporte.

| Testziel | Bestätigte UUID | Stand der Probe |
| --- | --- | --- |
| `beautyfacelift-drill-2026-10-21` | `bf332224-68d3-42c8-be6c-20da9ba9cf4d` | Time Travel ausgeführt und Baseline wiederhergestellt; 8/8 Prüfungen |
| `beautyfacelift-drill-restore-2026-10-21` | `f4f0e5aa-01fe-4a80-922d-958ee3493703` | SQL-Export einmal importiert, anschliessend lesend vollständig verglichen; Baseline 8/8 |

**Nutzerfreigabe am 21.10.2026: «Isolierte Cloud-Probe erlauben».** Genau diese beiden neuen Testziele, synthetisches Time Travel und SQL-Export/-Import sind freigegeben. Die Testdatenbanken bleiben erhalten. Produktion, Worker-Deployment, E-Mails, Tarif und die Entscheidung zum inaktiven Alarm werden dadurch nicht verändert. Der folgende Ablauf wird gegen diese Freigabe ausgeführt; Ergebnisse sind vor Abschluss gesondert nachzuweisen.

Die Probe verwendet nur die geprüfte Migration und eindeutig synthetische SQL-Dateien aus `scripts/fixtures/d1-recovery/`; der zugehörige endliche Harness prüft lokal ihre Ausgangs-/Änderungsbedingungen.

Gespeichert: `01-seed.sql`, `02-change.sql`, `03-verify-baseline.sql`, `04-verify-change.sql`. Baseline: zwei Test-Leads/zwei Ereignisse, einschliesslich der Beziehung B → A; Änderung: weiterhin zwei Leads, drei Ereignisse, nur A.notes/A.updated_at geändert. Beide Verifier liefern acht Zeilen mit Prüfname, Erfolgsflag und Anzahl, keine Kontaktpayloads. **79 lokale Planprüfungen bestanden**; die tatsächliche lokale workerd/D1-Laufzeit akzeptiert beide vollständigen Zustände mit 8/8 und verwirft die Baseline nach der Änderung. Ein früher SQL-Entwurf überschritt D1s Grenze für verkettete SELECTs; die Verifier verwenden nun VALUES-Zeilen, und der Laufzeittest ist dauerhaft in der CI enthalten. Das bestätigt die Plan-SQL, nicht einen Remote-Restore.

Konkreter Ablauf nach Freigabe:

1. Neues Ziel erstellen und seine neue UUID sowie Kontoidentität privat protokollieren. Vor **jeder** Remoteaktion Namen und UUID mit dem Fallblatt vergleichen. Die Produktions-ID oben ist ausdrücklich ausgeschlossen.
2. Leeres Anwendungsschema bestätigen, nur `worker/migrations/0001_leads.sql` in dieses neue Ziel einspielen und den synthetischen Seed ausführen. Baseline-Prüfungen müssen sämtlich erfolgreich sein; FK-Prüfung darf keinen Befund liefern. Bei Teilfehler Zustand prüfen, kein blindes Wiederholen oder Zurücksetzen.
3. Einen aktuellen Time-Travel-Bookmark des Testziels notieren. Baseline-Zählungen/-Checks und Schema-/Kandidatenrevision erfassen; keine Rohpayloads in allgemeine Logs kopieren.
4. Die eng begrenzte synthetische Änderung ausführen; deren Prüfungen müssen erfolgreich und die Baseline-Prüfungen jetzt fehlschlagend sein. Andere Fixture-Zeilen bleiben unverändert.
5. Ausschliesslich das Testziel zum aufgezeichneten Bookmark wiederherstellen. Vor der endgültigen Restore-Aktion Ziel/Bookmark nochmals prüfen. Cloudflare überschreibt dabei die gewählte Datenbank; die aktuelle Restore-Antwort/den vorherigen Bookmark als mögliche Rückkehrreferenz sichern.
6. Baseline, kritische Zeilen/Ereignisse, Beziehungen und FK-Prüfung erneut vergleichen. Unklare Antwort zuerst untersuchen; keinen zweiten Restore blind auslösen.
7. Für die zusätzliche Export-/Importprobe einen synthetischen **SQL-Export** aus dem Testziel verwenden. Import nur in ein weiteres frisches, separat identifiziertes Testziel; keinen Roh-`.sqlite`-Export des lokalen Hilfstools importieren. Gleiche Prüfungen durchführen. Vorherige Löschungen/Korrekturen anhand eines synthetischen Registers wieder anwenden, bevor ein wiederhergestellter Bestand weiterverwendet würde.
8. Ergebnis, Ziel-IDs, Checks, Fehler und verbleibende Grenzen dokumentieren. Keine Testdatenbank löschen, keine Produktion wiederherstellen und keine reale Capture-/Mailfunktion einschalten. Eine spätere Bereinigung braucht eine gezielte Entscheidung.

### Tatsächlich ausgeführter Time-Travel-Nachweis

Ausführung im angemeldeten lokalen Chrome gegen die erste Test-UUID oben, auf Basis des Kandidaten `25a74b7`. Das leere Anwendungsschema wurde vor dem Schreiben geprüft. `0001_leads.sql` wurde als acht DDL-Anweisungen ausgeführt: zwei Tabellen und sechs Indizes. Dies testet die SQL-Migration, **nicht** die Wrangler-Migrationshistorie oder die Berechtigungen des GitHub-Deploy-Tokens.

| Schritt | Beobachtetes Ergebnis |
| --- | --- |
| Leerer Bestand vor Seed | 0 Leads / 0 Ereignisse |
| Seed und Baseline | 2 Leads / 2 Ereignisse; alle acht Prüfungen erfolgreich |
| Baseline-Bookmark | Privat vor der Änderung protokolliert |
| Kontrollierte Änderung | Nur Testfall A geändert, ein Ereignis ergänzt; 2 Leads / 3 Ereignisse; Änderungsprüfung 8/8 |
| Negative Gegenprobe | Baseline erkennt die geänderte Notiz, das zusätzliche Ereignis und die abweichende Ereigniszahl |
| Restore | Cloudflare bestätigt die Wiederherstellung zum protokollierten Bookmark und liefert eine Undo-Referenz; diese bleibt nur dokumentiert |
| Prüfung nach Restore | Wieder 2 Leads / 2 Ereignisse; Baseline 8/8, Beziehung B → A und Ereignis-Metadaten erhalten, FK-Prüfung ohne Befund |

Private Nachweise: `output/coordination/D1-CLOUD-DRILL-2026-10-21.md`, `pilot-evidence/d1-cloud-baseline.txt`, `d1-cloud-change.txt`, `d1-cloud-restore-response.txt`, `d1-cloud-restored.txt` und `d1-cloud-time-travel-verified.jpg`. Bookmarks sind Referenzen auf diese Testdatenbank; sie werden hier nicht als Produktions-Wiederherstellungspunkte verwendet.

**Aufgetretener und behobener Bedienfehler:** Die Dashboard-Konsole ist ein einzeiliges Eingabefeld und entfernt beim Einfügen rohe Zeilenumbrüche. Der erste Seed-Versuch scheiterte deshalb vor dem Schreiben mit einem Syntaxfehler. Danach wurden 0/0 Zeilen bestätigt, SQL-Kommentare entfernt und die geprüften Anweisungen mit Leerzeichen als eine Zeile eingegeben. Erst anschliessend wurde der Seed erfolgreich ausgeführt. Dieses Vorgehen gilt nur für diese bekannten Fixtures; beliebiges SQL mit mehrzeiligen Stringwerten darf nicht pauschal so umgeschrieben werden.

### SQL-Export/-Import und Nachprüfung

Der vollständige SQL-Export/-Import ist ebenfalls **tatsächlich ausgeführt und nachgeprüft**. Weil die Browseroberfläche keinen vollständigen SQL-Export anbietet und die lokale CLI-Anmeldung abgelaufen ist, nutzte der einmalige Betriebszweig `codex/d1-cloud-drill` den bereits vorhandenen GitHub-Cloudflare-Zugang. Keine Berechtigungen oder Secrets wurden ergänzt. Der geprüfte Workflow ist ausschliesslich manuell auf diesem exakten Zweig ausführbar, prüft Repository/Kandidaten-SHA/Versuch 1 und verwendet eine neue temporäre Konfiguration mit genau den beiden Test-IDs. Er gehört nicht in `master`; sein Produktionsjob wurde übersprungen.

Der [Ausführungslauf 39646257187](https://github.com/lefteyep/beautyfacelift/actions/runs/39646257187), Betriebsrevision `06fa06ed`, bestätigte Namen/IDs, den vollständigen Ausgangsbestand und das leere Ziel. Der vollständige SQL-Export wurde vor dem Import in einer lokalen SQLite-Instanz mit allen erwarteten Schemaobjekten, Spaltenwerten, Ereignissen und Sequenzwerten verglichen. Anschliessend erfolgte genau **ein** Importversuch mit unveränderten Exportbytes. Der Lauf stoppte danach wegen einer nicht eindeutig als JSON lesbaren CLI-Antwort; er ist deshalb **fehlgeschlagen**, kein grüner Ende-zu-Ende-Workflow.

Der Import wurde **nicht wiederholt**. Stattdessen wurden Quelle und Ziel anschliessend ausschliesslich lesend über die angemeldete Cloudflare-Konsole vollständig erfasst und unabhängig gegen dasselbe erwartete Modell sowie gegeneinander geprüft:

| Nachweis | Ergebnis |
| --- | --- |
| Quelle nach dem Import | Vollständiges Schema / alle Lead- und Ereignisfelder / Sequenz unverändert; Baseline 8/8 |
| Importziel | Vollständiger Bestand identisch mit Quelle und erwartetem Modell; Baseline 8/8 |
| Kritische Daten | Je 2 Leads und 2 Ereignisse; Beziehung B → A, Ereignis-Metadatum und Sequenzwert 2 erhalten; FK-Prüfung ohne Befund |
| Exportintegrität | 5380 Bytes; SHA-256 `2dcdf286c0e761fbf222c37943e784299ce580d8c3626a701bbaef58708653a2` vor Import und nach lokalem Abruf bestätigt |
| Dauerhafte synthetische Belege | [SQL-Export](../archive/reviews/2026-10-21-d1-drill/cloud-export.sql), [Prüfsumme](../archive/reviews/2026-10-21-d1-drill/cloud-export.sql.sha256), [lesender Vollvergleich](../archive/reviews/2026-10-21-d1-drill/cloud-verification.json) |

Zwei vorherige Läufe stoppten ohne Importversuch: [39645541486](https://github.com/lefteyep/beautyfacelift/actions/runs/39645541486) an einem Windows-/LF-Prüfsummenfehler in der lokalen Testdatei; [39645862133](https://github.com/lefteyep/beautyfacelift/actions/runs/39645862133) bei der lesenden Identitätsabfrage, weil `WRANGLER_LOG=error` auch angeforderte JSON-Ausgaben unterdrückte. Beide Fehler wurden korrigiert und jeweils lokal nachgeprüft.

**Technische Fortsetzung nach dem abgeschlossenen Drill:** Die installierte Wrangler-Version 4.148.0 schreibt beim Remote-Dateiimport einen festen Fortschrittstext vor die JSON-Antwort, obwohl `--json` gesetzt ist. Der getrennte [Betriebscheckpoint `20aa186`](https://github.com/lefteyep/beautyfacelift/commit/20aa186dd0fcaf29b849c7a1a5860460ee85d144) behandelt ausschliesslich diesen genau definierten Präfix und verlangt danach eine vollständige Importbestätigung mit passenden Metriken; unbekannte/abgeschnittene Ausgaben, Fehlermeldungen oder widersprüchliche Werte stoppen weiterhin ohne Wiederholung. Abfragen und Identitätsantworten bleiben strikt JSON. Der vollständige Datenvergleich nach dem Import bleibt Pflicht. **14 Offline-Prüfungen und Syntaxprüfung bestanden**, einschliesslich Positiv-/Negativkontrollen; ein tatsächlicher, isolierter lokaler Wrangler-Dateiimport bestätigte zudem 2 Leads/2 Ereignisse ohne Zugangsdaten oder Remotezugang. Es wurde kein neuer Cloud-Import und kein neuer erfolgreicher Cloud-Ende-zu-Ende-Lauf behauptet. Der historische Lauf bleibt rot; die vorhandenen beiden Testbestände bleiben unverändert erhalten. Dieser Betriebszweig gehört nicht nach `master`.

**Grenzen:** Dieser Nachweis betrifft die zwei isolierten synthetischen Ziele und den vorhandenen Actions-Zugang. Er testet keine Produktivmigration, produktive Wiederherstellung, produktive Löschung, deployed Operatorroute, Access-Anmeldung, echte Mailzustellung oder vereinbarte Reaktionszeit. Beide Testdatenbanken bleiben erhalten. Produktion, bestehender Worker, Mails, Tarif und Alarmzustand wurden nicht verändert.

Grundlage: [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) und [D1 SQL-Import/-Export](https://developers.cloudflare.com/d1/best-practices/import-export-data/). Die lokale CLI-Anmeldung bleibt abgelaufen; für die Browserprobe wurden keine Zugangsdaten exportiert.

## Was ein späterer Merge tatsächlich verändert

Die drei ausgeschalteten Feature-Gates machen einen Merge nicht zu einer wirkungslosen Dokumentänderung:

1. Der [Deploy-Workflow](../../.github/workflows/deploy.yml) validiert und wendet danach **Remote-D1-Migrationen** an, unabhängig von Capture/Reminders/Data-Operations. Bei ausstehender `0001` entstehen Tabellen/Indizes und Migrationshistorie. Scheitert das folgende Worker-Deployment, bleibt die erfolgreiche Migration bestehen.
2. Worker, Assets und Konfiguration werden deployed: D1-Bindung und 15-Minuten-Cron eingeschlossen. Der Cron bleibt über das Reminder-Gate funktional gesperrt.
3. Künftige reguläre Besitzer-/BCC-Mails enthalten neu Anfrage-ID und Eingangszeit **auch bei Capture off**. Sie enthalten weiterhin keinen Cockpit-Link. Keine Testmail folgt aus dem Merge.
4. Der eingecheckte Stand lässt das Cockpit wegen leerer Access-Team-/AUD-Werte geschlossen. Capture, Erinnerungen, Kundenmails und Datenverfahren bleiben aus. Ein Merge allein ergibt noch keinen nutzbaren Agenturpilot.
5. Nach einer späteren Access-Aktivierung sperrt `LEADS_CAPTURE=off` nur neue öffentliche/manuelle Erfassung. Bereits gespeicherte Anfragen bleiben für berechtigte Staff-Aktionen bearbeitbar. Das Gate ist kein globaler Datenbank-Schreibschutz.

Reihenfolge für eine spätere Freigabe: genaue Kandidatenrevision und aktuelle CI prüfen → Daten-/Betriebs- und Access-Gates schliessen → ausdrücklich Migration **und** Merge/Deployment freigeben → tatsächliches Deployment/Schema/Login prüfen → erst gesondert freigegebene Capture-Konfiguration aktivieren und Agenturablauf abnehmen. Erinnerungen, Kundenmails, Datenverfahren, Teresa-Zugang und Kampagne bleiben eigenständige Entscheidungen. Kein Code-Rollback macht D1-Schreibvorgänge rückgängig.

## Plan und offene Entscheidungen

| Aufgabe | Verantwortung | Stand / überprüfbares Ergebnis |
| --- | --- | --- |
| BFL-OPS-ACCOUNT | Lokaler Koordinator | Konto/D1/Time-Travel/Region/CLI/Alarmdialog lesend geprüft; konkrete Zugangslücke dokumentiert |
| BFL-OPS-RELEASE-01 | Nativer Sicherheitsagent, Root integriert | Mutationen des Deploy-Workflows und Gate-Grenzen geprüft; falsche Aussage zur unveränderten Besitzer-Mail korrigiert |
| BFL-OPS-DATA-01 | Nativer Datenumfangsagent, Root integriert | Datenschutzentwurf an Agenturzugang, vorgesehene Felder und tatsächliche Mail-/Marketinggrenzen angepasst; kein Rechtstext veröffentlicht |
| BFL-OPS-RECOVERY-02 | Nativer Datenagent in eigenem Worktree, Root integriert | Synthetische Seed-/Änderungs-/Prüfdateien und lokale Planprüfung; Cloud-Time-Travel im ersten Testziel erfolgreich, Baseline 8/8 |
| BFL-OPS-RECOVERY-04 | Nativer Datenagent in eigenem Worktree; Root geprüft, ausgeführt und lesend nachgeprüft | Vollständiger SQL-Export, genau ein Import und vollständiger unabhängiger Nachvergleich erfolgreich; CLI-Lauf wegen Antwortauswertung rot dokumentiert, nicht wiederholt |
| BFL-OPS-CLI-05 | Nativer Agent in eigenem Worktree; Root geprüft und integriert | Importantwort für Wrangler 4.148.0 streng korrigiert, 14 Offline-Prüfungen bestanden; Betriebscheckpoint `20aa186`, keine neue Cloudmutation |
| Alarm aktivieren/testen | Nutzerentscheidung; Root bewahrt Entwurf | Nutzer wählt «Nur als Entwurf behalten». Keine Aktivierung/Testmail; dieser Betriebs-Gate bleibt vor Capture offen |
| Zweck, Kategorien, Fristen und Rollen | Verantwortlicher Auftraggeber / Nutzer | Datenschutzentwurf bleibt ungeprüft; keine Frist, Rechtsgrundlage oder Vertragsrolle erfunden |
| Access/Konto und Livegang | Kontoinhaber hat Free-Einschreibung abgeschlossen; Nutzer hält Cockpit-Login als Entwurf | [Aktueller Einrichtungsplan](COCKPIT-ACCESS-READINESS.md): bestehender Cloudflare-Login gewählt, Free-Plan/Teamdomain bestätigt. Konkrete IdP-/App-/Policy-Konfiguration auf ausdrücklichen Wunsch nur dokumentierter Entwurf; keine gespeicherte Access-Anwendung oder Live-Login-Prüfung. Erst bei geändertem Nutzerentscheid fortsetzen; Produktivmigration/Merge/Deployment bleiben separat |
