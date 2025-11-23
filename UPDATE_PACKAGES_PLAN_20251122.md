# Update-Plan für NPM-Pakete - 22. November 2025

Dieses Dokument beschreibt den Prozess zur manuellen Aktualisierung der veralteten NPM-Pakete, sortiert nach Dringlichkeit.

## Vorbereitung

1.  **Arbeitskopie sichern:** Stellen Sie sicher, dass Ihr aktueller Arbeitsstand in Git committed ist, um bei Problemen leicht zum Ausgangszustand zurückkehren zu können.
    ```bash
    git status
    # Führen Sie 'git add' und 'git commit' aus, wenn es ungesicherte Änderungen gibt.
    ```
2.  **Einzelne Updates:** Führen Sie die Updates für jedes Paket (oder jede Paketgruppe) einzeln durch. Committen Sie die Änderungen nach jedem erfolgreichen Update. Dies erleichtert die Fehlersuche, falls ein Update Probleme verursacht.

## Update-Prozess

**Wichtiger Hinweis:** Das Projekt enthält kein explizites Test-Skript (wie `npm test`). Nach jeder Aktualisierung ist daher **sorgfältiges manuelles Testen** der Anwendung erforderlich. Konzentrieren Sie sich auf die Bereiche, die von dem aktualisierten Paket betroffen sein könnten.

---

### Kategorie 1: Hohe Dringlichkeit (Mögliche Breaking Changes)

Hier sind größere Versionssprünge vorhanden. Lesen Sie die jeweiligen Changelogs oder Release Notes der Pakete, um sich über kritische Änderungen zu informieren.

#### 1.1. `vite`

-   **Aktuell:** `6.3.6`
-   **Wanted:** `6.4.1`
-   **Latest:** `7.2.4`
-   **Aktion:** Update auf die neueste `6.x` Version oder direkt auf `7.x`. Ein Update auf eine neue Hauptversion (`7.x`) erfordert besondere Vorsicht.

**Schritte:**
1.  Ändern Sie die Version in `package.json`:
    ```json
    "vite": "^7.2.4"
    ```
2.  Installieren Sie die Abhängigkeiten:
    ```bash
    npm install
    ```
3.  **Testen:**
    -   Starten Sie den Entwicklungsserver: `npm run dev`
    -   Erstellen Sie einen Build: `npm run build`
    -   Prüfen Sie die Anwendung im Browser auf Fehler.

4.  Wenn alles funktioniert, committen Sie die Änderungen:
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: Update vite to version 7.2.4"
    ```

#### 1.2. `@types/node`

-   **Aktuell:** `22.18.6`
-   **Wanted:** `22.19.1`
-   **Latest:** `24.10.1`
-   **Aktion:** Update auf die neueste Version.

**Schritte:**
1.  Ändern Sie die Version in `package.json`:
    ```json
    "@types/node": "^24.10.1"
    ```
2.  `npm install`
3.  **Testen:** Prüfen Sie, ob die Skripte im `scripts`-Verzeichnis noch korrekt funktionieren und ob die Entwicklungsumgebung fehlerfrei läuft.
4.  Commit:
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: Update @types/node to version 24.10.1"
    ```

#### 1.3. `docx`

-   **Aktuell:** `8.5.0`
-   **Wanted:** `8.5.0`
-   **Latest:** `9.5.1`
-   **Aktion:** Update auf die neueste Version.

**Schritte:**
1.  Ändern Sie die Version in `package.json`:
    ```json
    "docx": "^9.5.1"
    ```
2.  `npm install`
3.  **Testen:** Testen Sie die Funktionalität zum Exportieren von Dokumenten.
4.  Commit:
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: Update docx to version 9.5.1"
    ```

#### 1.4. `marked`

-   **Aktuell:** `16.3.0`
-   **Wanted:** `16.4.2`
-   **Latest:** `17.0.1`
-   **Aktion:** Update auf die neueste Version.

**Schritte:**
1.  Ändern Sie die Version in `package.json`:
    ```json
    "marked": "^17.0.1"
    ```
2.  `npm install`
3.  **Testen:** Überprüfen Sie die Markdown-Vorschau auf korrekte Darstellung.
4.  Commit:
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: Update marked to version 17.0.1"
    ```

---

### Kategorie 2: Mittlere Dringlichkeit

Diese Updates liegen außerhalb des in `package.json` definierten Bereichs, sind aber keine Hauptversionen.

#### 2.1. `typescript`

-   **Aktuell:** `~5.8.2`
-   **Wanted:** `5.8.3`
-   **Latest:** `5.9.3`
-   **Aktion:** Update auf die neueste Minor-Version.

**Schritte:**
1.  Ändern Sie die Version in `package.json`:
    ```json
    "typescript": "~5.9.3"
    ```
2.  `npm install`
3.  **Testen:** Führen Sie einen Build durch (`npm run build`) und prüfen Sie auf Typfehler.
4.  Commit:
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: Update typescript to version 5.9.3"
    ```

#### 2.2. `markdownlint`

-   **Aktuell:** `0.38.0`
-   **Wanted:** `0.38.0`
-   **Latest:** `0.39.0`
-   **Aktion:** Update auf die neueste Version.

**Schritte:**
1.  Ändern Sie die Version in `package.json`:
    ```json
    "markdownlint": "^0.39.0"
    ```
2.  `npm install`
3.  **Testen:** Prüfen Sie die Linter-Funktionalität im Editor.
4.  Commit:
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: Update markdownlint to version 0.39.0"
    ```

---

### Kategorie 3: Niedrige Dringlichkeit

Diese Updates sind meist Patch- oder Minor-Versionen innerhalb des bereits definierten Bereichs und sollten unproblematisch sein. Sie können diese in einer Gruppe aktualisieren, um Zeit zu sparen.

**Aktion:** Führen Sie `npm update` aus, um alle Pakete auf die "Wanted"-Version zu heben.

**Schritte:**
1.  Führen Sie den Update-Befehl aus:
    ```bash
    npm update
    ```
2.  Der Befehl aktualisiert `package-lock.json`. `package.json` bleibt unverändert, da die neuen Versionen noch dem dort definierten semver-Bereich entsprechen.
3.  **Testen:** Führen Sie einen vollständigen Funktionstest der Anwendung durch (Entwicklungsserver, Build, Editor-Funktionen, Export, etc.).
4.  Wenn alles funktioniert, committen Sie die Änderungen:
    ```bash
    git add package-lock.json
    git commit -m "chore: Update packages to wanted versions"
    ```
