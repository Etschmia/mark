# Mark Desktop - Konzept & Umsetzungsplan

> Markdown Editor Pro als installierbare Desktop-Anwendung mit nativer Dateisystem-Integration

## Vision

Der bestehende Browser-Editor bleibt unverändert. Zusätzlich entsteht eine Desktop-Version, die:

- **Nativ im Dateisystem arbeitet** (kein localStorage)
- **Per CLI aufrufbar ist**: `mark .` öffnet den Editor im aktuellen Verzeichnis
- **Markdown-Dateien als Dateihandler registriert**: Rechtsklick → "Mit Mark öffnen"
- **Native Menüs** hat: Datei > Öffnen, Speichern, Speichern unter...
- **Sich Arbeitssitzungen merkt** pro Verzeichnis
- **Über den Browser-Editor installierbar** ist: Menüpunkt "Desktop-Version installieren"

---

## Technologie-Entscheidung: Tauri v2

### Warum Tauri und nicht Electron?

| Kriterium | Tauri v2 | Electron |
|---|---|---|
| Binary-Größe | ~5-10 MB | ~100+ MB |
| RAM-Verbrauch | Niedrig (System-Webview) | Hoch (eigenes Chromium) |
| Backend-Sprache | Rust | Node.js |
| CLI-Support | Eingebaut (clap) | Manuell implementieren |
| File Associations | Eingebaut | Manuell implementieren |
| Native Menüs | Eingebaut | Eingebaut |
| Auto-Updater | Eingebaut | Eingebaut |
| Sicherheit | Whitelist-basiert | Alles erlaubt |

Tauri nutzt die System-Webview:
- **Windows**: WebView2 (Chromium-basiert, ab Win10 vorinstalliert)
- **macOS**: WebKit (immer vorhanden)
- **Linux**: WebKitGTK

Unser React-Frontend wird 1:1 darin gerendert.

---

## Aktuelle Architektur (Analyse)

### Projektstruktur (flach, kein src/)

```
mark/
├── App.tsx                    # Haupt-Orchestrator (1100+ Zeilen)
├── index.tsx                  # Entry Point
├── types.ts                   # TypeScript-Typen
├── components/                # React-Komponenten
├── hooks/                     # Custom Hooks
├── utils/                     # Utilities
├── services/                  # Services (fileService, etc.)
├── public/                    # Statische Assets + SW
└── docs/                      # Dokumentation
```

### Persistence-Mechanismen (Status quo)

| Was | localStorage Key | Datei | Zweck |
|-----|-----------------|-------|-------|
| Tabs & Inhalte | `markdown-editor-tabs` | `utils/tabManager.ts` | Tab-State, Inhalte, History |
| Einstellungen | `markdown-editor-settings` | `App.tsx` | Theme, Font, etc. |
| GitHub Token | `github_token` | `utils/githubService.ts` | Auth-Token |
| OAuth State | `github_oauth_state` | `utils/githubService.ts` | CSRF-Schutz (temporär) |
| Update-Status | `app-update-pending` | `utils/updateManager.ts` | Update-Flag |

### Dateisystem-Zugriff (Status quo)

Die Browser-Version nutzt bereits die **File System Access API** in `services/fileService.ts`:
- `window.showOpenFilePicker()` zum Öffnen
- `window.showSaveFilePicker()` zum Speichern
- `FileSystemFileHandle` für direktes Speichern ohne Dialog
- Fallback auf Legacy-File-Input für Browser ohne FSA-API

**Wichtig:** FileSystemFileHandle kann nicht in localStorage persistiert werden und geht bei Reload verloren.

---

## Ziel-Architektur

### Verzeichnisstruktur (nach Umbau)

```
mark/
├── App.tsx                          # Erkennt Browser vs. Desktop
├── components/                      # Bestehende Komponenten (unverändert)
├── hooks/                           # Bestehende Hooks (unverändert)
├── utils/                           # Bestehende Utilities
├── services/
│   ├── fileService.ts               # Bestehend (Browser-Modus)
│   ├── storage/                     # NEU: Abstraktionsschicht
│   │   ├── storageService.ts        #   Interface-Definition
│   │   ├── browserStorageAdapter.ts #   localStorage-Implementierung
│   │   └── desktopStorageAdapter.ts #   Dateisystem-Implementierung (Tauri)
│   └── desktopFileService.ts        # NEU: Native Dateioperationen
├── src-tauri/                       # NEU: Tauri-Backend (Rust)
│   ├── src/
│   │   ├── main.rs                  #   Einstiegspunkt, CLI-Parsing
│   │   ├── lib.rs                   #   Tauri-Plugin-Setup
│   │   ├── menu.rs                  #   Native Menüleiste
│   │   ├── file_handler.rs          #   Dateisystem-Operationen
│   │   └── workspace.rs             #   Workspace-Management
│   ├── Cargo.toml                   #   Rust-Abhängigkeiten
│   ├── tauri.conf.json              #   Tauri-Konfiguration
│   ├── capabilities/                #   Sicherheits-Permissions
│   └── icons/                       #   App-Icons
├── public/
├── package.json                     # Erweitert um Tauri-Scripts
└── vite.config.ts                   # Erweitert für Tauri-Build
```

### Storage-Abstraktionsschicht

```typescript
// services/storage/storageService.ts

interface StorageService {
  // Tab-Persistence
  saveTabs(state: PersistedTabState): Promise<void>;
  loadTabs(): Promise<PersistedTabState | null>;
  clearTabs(): Promise<void>;

  // Einstellungen
  saveSettings(settings: EditorSettings): Promise<void>;
  loadSettings(): Promise<EditorSettings | null>;

  // Workspace (nur Desktop)
  getWorkspaceInfo?(): Promise<WorkspaceInfo | null>;
  saveWorkspaceState?(state: WorkspaceState): Promise<void>;
  loadWorkspaceState?(): Promise<WorkspaceState | null>;
}

interface FileService {
  openFile(path?: string): Promise<FileResult>;
  saveFile(content: string, path?: string): Promise<SaveResult>;
  saveFileAs(content: string, suggestedName: string): Promise<SaveResult>;
  listFiles(directory: string, filter?: string): Promise<FileEntry[]>;
  watchDirectory?(directory: string, callback: (event: FSEvent) => void): void;
}

interface WorkspaceInfo {
  rootPath: string;
  markdownFiles: FileEntry[];
  recentFiles: string[];
  lastOpenTabs: string[];
}

interface WorkspaceState {
  rootPath: string;
  openFiles: string[];
  activeFile: string | null;
  lastAccessed: number;
}
```

### Browser-Adapter (existierendes Verhalten)

```typescript
// services/storage/browserStorageAdapter.ts

class BrowserStorageAdapter implements StorageService {
  // Delegiert an localStorage wie bisher
  async saveTabs(state) {
    localStorage.setItem('markdown-editor-tabs', JSON.stringify(state));
  }
  async loadTabs() {
    return JSON.parse(localStorage.getItem('markdown-editor-tabs'));
  }
  // ... etc.
}
```

### Desktop-Adapter (neu, Tauri-basiert)

```typescript
// services/storage/desktopStorageAdapter.ts

import { invoke } from '@tauri-apps/api/core';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

class DesktopStorageAdapter implements StorageService {
  async saveTabs(state) {
    const dir = await appDataDir();
    const path = await join(dir, 'tabs.json');
    await writeTextFile(path, JSON.stringify(state));
  }

  async loadTabs() {
    const dir = await appDataDir();
    const path = await join(dir, 'tabs.json');
    return JSON.parse(await readTextFile(path));
  }

  async getWorkspaceInfo() {
    return invoke('get_workspace_info');
  }

  // ... etc.
}
```

### Umgebungserkennung

```typescript
// utils/environment.ts (erweitern)

export function isDesktopApp(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

export function isBrowserApp(): boolean {
  return !isDesktopApp();
}
```

---

## CLI-Konzept

### Aufruf-Varianten

```bash
mark                    # Öffnet Editor mit letztem Workspace
mark .                  # Öffnet Editor im aktuellen Verzeichnis
mark /path/to/dir       # Öffnet Editor im angegebenen Verzeichnis
mark README.md          # Öffnet spezifische Datei
mark file1.md file2.md  # Öffnet mehrere Dateien
```

### Tauri CLI-Konfiguration (tauri.conf.json)

```json
{
  "cli": {
    "description": "Mark - Markdown Editor",
    "args": [
      {
        "name": "path",
        "index": 1,
        "takesValue": true,
        "multiple": true,
        "required": false
      }
    ]
  }
}
```

### Rust CLI-Verarbeitung

```rust
// src-tauri/src/main.rs (vereinfacht)

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // CLI-Argumente auslesen
            if let Some(matches) = app.get_cli_matches()? {
                if let Some(path_arg) = matches.args.get("path") {
                    let paths: Vec<String> = path_arg.value
                        .as_array()
                        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                        .unwrap_or_default();

                    // An Frontend übergeben
                    let window = app.get_webview_window("main").unwrap();
                    window.eval(&format!("window.__MARK_ARGS__ = {:?}", paths))?;
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Mark");
}
```

---

## Native Menüs

### Menüstruktur

```
Datei
├── Neue Datei           Ctrl+N
├── Öffnen...            Ctrl+O
├── Ordner öffnen...     Ctrl+Shift+O
├── ─────────────
├── Speichern            Ctrl+S
├── Speichern unter...   Ctrl+Shift+S
├── ─────────────
├── Zuletzt geöffnet   →
│   ├── README.md
│   ├── notes/todo.md
│   └── Verlauf löschen
├── ─────────────
└── Beenden              Ctrl+Q

Bearbeiten
├── Rückgängig           Ctrl+Z
├── Wiederherstellen     Ctrl+Shift+Z
├── ─────────────
├── Ausschneiden         Ctrl+X
├── Kopieren             Ctrl+C
├── Einfügen             Ctrl+V
├── ─────────────
├── Suchen               Ctrl+F
└── Ersetzen             Ctrl+H

Ansicht
├── Vorschau ein/aus     Ctrl+P
├── Linter ein/aus       Ctrl+L
├── ─────────────
├── Vergrößern           Ctrl++
├── Verkleinern          Ctrl+-
├── Originalgröße        Ctrl+0
├── ─────────────
└── Vollbild             F11

Hilfe
├── Tastenkürzel         Ctrl+/
├── Markdown Cheatsheet
├── ─────────────
├── Über Mark
└── Nach Updates suchen
```

---

## Workspace-Management

### Konzept

Jedes Verzeichnis, in dem `mark` geöffnet wird, wird zu einem "Workspace". Pro Workspace wird gespeichert:

```json
// ~/.mark/workspaces.json
{
  "workspaces": {
    "/home/user/projects/blog": {
      "lastAccessed": 1707580800000,
      "openFiles": ["README.md", "posts/draft.md"],
      "activeFile": "posts/draft.md",
      "editorState": {
        "posts/draft.md": {
          "cursor": { "line": 42, "ch": 15 },
          "scrollTop": 820
        }
      }
    },
    "/home/user/notes": {
      "lastAccessed": 1707494400000,
      "openFiles": ["todo.md"],
      "activeFile": "todo.md"
    }
  }
}
```

### Verhalten beim Start

```
mark .
  │
  ├── Workspace bekannt?
  │   ├── JA → "Letzte Sitzung wiederherstellen?"
  │   │        ├── Ja → Dateien öffnen, Cursor-Position wiederherstellen
  │   │        └── Nein → Leerer Editor mit Dateiliste
  │   └── NEIN → Verzeichnis scannen
  │              ├── .md Dateien gefunden → In Sidebar/Dateiliste anzeigen
  │              └── Keine → Leerer Editor, neues Dokument
  │
  └── Verzeichnis in workspaces.json registrieren
```

### Dateiliste (Sidebar / Schnellauswahl)

In der Desktop-Version gibt es eine optionale Sidebar oder ein erweitertes "Öffnen"-Menü, das:

- Alle `.md`-Dateien im Workspace-Verzeichnis anzeigt (rekursiv, konfigurierbar)
- `.md`-Dateien visuell hervorhebt
- Andere Textdateien gedimmt zeigt
- Binärdateien ausblendet
- Dateien nach Änderungsdatum sortiert
- Live-Updates bei Dateiänderungen (File Watcher)

---

## File Association (Dateiverknüpfung)

### Was passiert nach Installation

**Linux:**
- `.desktop`-Datei wird in `~/.local/share/applications/` registriert
- MIME-Type `text/markdown` wird mit Mark verknüpft
- `mark` Binary liegt in `/usr/local/bin/` oder `~/.local/bin/`

**macOS:**
- `.app` Bundle registriert sich für `.md` und `.markdown`
- Finder zeigt "Mit Mark öffnen" im Kontextmenü
- CLI-Tool `mark` wird in `/usr/local/bin/` verlinkt

**Windows:**
- Installer registriert File Association für `.md`
- Explorer zeigt "Mit Mark öffnen" im Kontextmenü
- `mark.exe` wird zum PATH hinzugefügt

### Tauri-Konfiguration

```json
// src-tauri/tauri.conf.json (Auszug)
{
  "bundle": {
    "fileAssociations": [
      {
        "ext": ["md", "markdown", "mdx", "txt"],
        "mimeType": "text/markdown",
        "description": "Markdown Document",
        "role": "Editor"
      }
    ],
    "identifier": "de.martuni.mark",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

---

## Unterschiede: Browser vs. Desktop

| Feature | Browser-Version | Desktop-Version |
|---------|----------------|-----------------|
| **Persistence** | localStorage | Dateisystem (`~/.mark/`) |
| **Dateien öffnen** | File System Access API / Upload | Native Dateidialog / CLI-Argument |
| **Dateien speichern** | FSA API / Download | Direkt ins Dateisystem |
| **Tabs** | Virtual (localStorage) | Echte Dateien mit Pfad |
| **Arbeitsverzeichnis** | Keins | Verzeichnis aus CLI oder Menü |
| **Dateiliste** | Nicht vorhanden | Sidebar mit .md-Dateien |
| **Menüs** | Toolbar im UI | Native OS-Menüleiste + Toolbar |
| **GitHub Integration** | Ja | Ja (plus lokales Git möglich) |
| **PWA/Offline** | Service Worker Cache | Nativ offline |
| **Updates** | SW-basiert | Tauri Auto-Updater |
| **Export (PDF etc.)** | Ja | Ja |
| **Installationsquelle** | URL im Browser | Installer/DMG/AppImage |

---

## Umsetzungsphasen

### Phase 1: Fundament (Abstraktionsschicht)

**Ziel:** Storage-Abstraktion einziehen, ohne die Browser-Version zu verändern.

**Aufgaben:**
1. `StorageService`-Interface definieren (`services/storage/storageService.ts`)
2. `BrowserStorageAdapter` implementieren - wickelt bestehende localStorage-Aufrufe
3. `TabManager` refactoren: statt direkt `localStorage` zu nutzen, den `StorageService` injizieren
4. `App.tsx` Settings-Persistierung über `StorageService` routen
5. Umgebungserkennung in `utils/environment.ts` erweitern
6. Storage-Provider/Context erstellen, der den richtigen Adapter bereitstellt
7. **Tests:** Browser-Version muss identisch funktionieren wie vorher

**Betroffene Dateien:**
- `utils/tabManager.ts` (localStorage → StorageService)
- `App.tsx` (Settings-Persistence)
- `utils/githubService.ts` (Token-Storage)
- `services/fileService.ts` (File-Operationen)
- `utils/environment.ts` (Erweiterung)

**Risiko:** Mittel - Kernlogik wird refactored, aber nur die Persistence-Schicht.

---

### Phase 2: Tauri-Integration

**Ziel:** App startet in Tauri-Shell mit bestehendem UI.

**Voraussetzungen installieren:**
```bash
# Rust installieren
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Tauri-Systemabhängigkeiten (Debian 13)
sudo apt install libwebkit2gtk-4.1-dev build-essential \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Tauri CLI
npm install -D @tauri-apps/cli @tauri-apps/api
```

**Aufgaben:**
1. Tauri-Projekt initialisieren: `npx tauri init`
2. `tauri.conf.json` konfigurieren (App-Name, Bundle-ID, Window-Einstellungen)
3. `vite.config.ts` für Tauri-Kompatibilität anpassen
4. `package.json` um Tauri-Scripts erweitern:
   - `npm run tauri:dev` - Entwicklung mit Hot-Reload
   - `npm run tauri:build` - Production-Build mit Installer
5. Erster Start: Bestehende Browser-UI in Tauri-Fenster
6. `DesktopStorageAdapter` implementieren (Tauri fs-Plugin)
7. `desktopFileService.ts` implementieren (native Dateidialoge)

**Neue Dateien:**
- `src-tauri/` (kompletter Tauri-Backend-Ordner)
- `services/storage/desktopStorageAdapter.ts`
- `services/desktopFileService.ts`

---

### Phase 3: Dateisystem-Integration

**Ziel:** Natives Arbeiten mit dem Dateisystem.

**Aufgaben:**
1. Native Dateidialoge (Öffnen, Speichern, Speichern unter) via Tauri dialog-Plugin
2. Direktes Lesen/Schreiben ins Dateisystem ohne Dialoge (wenn Pfad bekannt)
3. Arbeitsverzeichnis-Konzept implementieren
4. Markdown-Dateiliste: Verzeichnis scannen, `.md`-Dateien anzeigen
5. File Watcher: Live-Updates bei externen Dateiänderungen
6. Tab-Titel zeigen Dateipfade relativ zum Workspace

**Betroffene/neue Dateien:**
- `src-tauri/src/file_handler.rs`
- `src-tauri/src/workspace.rs`
- Neue Komponente: `WorkspaceSidebar.tsx` oder erweitertes Öffnen-Menü
- `hooks/useWorkspace.ts`

---

### Phase 4: CLI & Workspace-Management

**Ziel:** `mark .` funktioniert, Sitzungen werden gemerkt.

**Aufgaben:**
1. CLI-Argument-Parsing in `main.rs` (clap via Tauri)
2. Argumente an Frontend durchreichen (`window.__MARK_ARGS__`)
3. Frontend wertet Argumente beim Start aus
4. Workspace-State in `~/.mark/workspaces.json` persistieren
5. "Sitzung wiederherstellen?"-Dialog beim Öffnen bekannter Workspaces
6. Zuletzt geöffnete Dateien merken und anbieten

**Betroffene/neue Dateien:**
- `src-tauri/src/main.rs` (CLI-Setup)
- `src-tauri/tauri.conf.json` (CLI-Definition)
- `hooks/useWorkspaceRestore.ts`
- Neue Komponente: `RestoreSessionDialog.tsx`

---

### Phase 5: Native Menüs

**Ziel:** OS-native Menüleiste mit allen Editor-Funktionen.

**Aufgaben:**
1. Menüstruktur in Rust definieren (`src-tauri/src/menu.rs`)
2. Menü-Events an Frontend weiterleiten
3. Frontend-Handler für Menü-Aktionen (nutzt bestehende Funktionen)
4. Keyboard-Shortcuts an native Menüs binden
5. Kontextmenü für Tabs (bereits vorhanden, an natives System anbinden)

---

### Phase 6: OS-Integration & Distribution

**Ziel:** Installer, File Associations, Auto-Updater.

**Aufgaben:**
1. File Associations in `tauri.conf.json` konfigurieren
2. App-Icons in allen benötigten Größen generieren
3. Installer-Konfiguration:
   - Linux: `.deb`, `.AppImage`
   - macOS: `.dmg`
   - Windows: `.msi`, `.exe` (NSIS)
4. Auto-Updater konfigurieren (Tauri Updater Plugin)
5. CI/CD Pipeline für automatisierte Builds (GitHub Actions)
6. "Desktop-Version installieren"-Button in der Browser-Version
   - Erkennt OS → zeigt passenden Download-Link
   - Leitet auf GitHub Releases oder eigene Download-Seite

---

## Systemvoraussetzungen für Entwicklung

### Muss installiert werden (Debian 13)

```bash
# 1. Rust Toolchain (nicht in Debian-Repos - offizieller Weg via rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. System-Bibliotheken für Tauri v2
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# 3. Tauri CLI (als npm dev-dependency)
npm install -D @tauri-apps/cli

# 4. Tauri API für Frontend
npm install @tauri-apps/api @tauri-apps/plugin-fs @tauri-apps/plugin-dialog
```

### Bereits vorhanden

- Node.js 25.2.1
- npm
- TypeScript 5.9.3
- Vite 7
- Alle bestehenden Frontend-Dependencies

---

## Offene Fragen & Entscheidungen

1. **Sidebar vs. Schnellauswahl:** Permanente Sidebar für Dateien oder Schnellauswahl-Dialog (Ctrl+P wie VS Code)?
2. **Git-Integration Desktop:** Soll die Desktop-Version auch lokale Git-Operationen unterstützen (commit, push) oder bleibt das bei der GitHub-API?
3. **Multi-Window:** Soll `mark /path1` und `mark /path2` zwei Fenster öffnen oder Tabs im selben Fenster?
4. **Einstellungs-Sync:** Sollen Browser- und Desktop-Version die gleichen Einstellungen nutzen können?
5. **Plugin-System:** Langfristig ein Plugin-System für Erweiterungen?
6. **Lizenz-Überlegungen:** Tauri ist MIT-lizenziert, passt das zur bestehenden Lizenz?

---

## Referenzen

- [Tauri v2 Dokumentation](https://v2.tauri.app/)
- [Tauri CLI Plugin](https://v2.tauri.app/plugin/cli/)
- [Tauri File Associations](https://v2.tauri.app/reference/config/#bundleconfig)
- [Tauri Auto-Updater](https://v2.tauri.app/plugin/updater/)
- [Tauri + Vite Setup](https://v2.tauri.app/start/create-project/)

---

*Erstellt: 2026-02-10*
*Status: Planungsphase*
