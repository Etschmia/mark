# Systemd Service Setup für Markdown Editor Pro

Diese Anleitung erklärt, wie du einen systemd Service für den Markdown Editor Pro auf einem Debian Server einrichtest.

## Voraussetzungen

- Debian 13 Server
- Caddy als Reverse Proxy
- Node.js und npm installiert (in diesem Fall über nvm)
- Das Projekt befindet sich unter `/home/librechat/mark`

## Quick Start Zusammenfassung

Für diese Deployment-Umgebung wird **Option B** empfohlen:
1. Caddy serviert statische Dateien direkt aus `/home/librechat/mark/dist`
2. Ein systemd Service führt `npm run build` aus
3. Nach Code-Änderungen: `sudo systemctl restart markdown-editor-pro.service`
4. Caddyfile muss angepasst werden (siehe unten)

## Schritt 1: Service-Datei erstellen

Erstelle die Service-Datei als root mit:

```bash
sudo nano /etc/systemd/system/markdown-editor-pro.service
```

## Schritt 2: Service-Datei Inhalt

**WICHTIG**: Du hast zwei Optionen. Die beste Lösung hängt davon ab, wie du Caddy konfiguriert hast.

### Option A: Vite Preview-Server verwenden

Falls Caddy als Reverse Proxy zu einem laufenden Server konfiguriert ist:

```ini
[Unit]
Description=Markdown Editor Pro - Production Server
After=network.target

[Service]
Type=simple
User=librechat
Group=librechat
WorkingDirectory=/home/librechat/mark
Environment="PATH=/home/librechat/.nvm/versions/node/v25.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStartPre=/home/librechat/.nvm/versions/node/v25.0.0/bin/npm run build
ExecStart=/home/librechat/.nvm/versions/node/v25.0.0/bin/npm run preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Option B: Nur Build ohne Server (EMPFOHLEN - Beste Performance)

Falls Caddy die statischen Dateien direkt aus `/home/librechat/mark/dist` serviert:

```ini
[Unit]
Description=Markdown Editor Pro - Production Build Service
After=network.target

[Service]
Type=oneshot
User=librechat
Group=librechat
WorkingDirectory=/home/librechat/mark
Environment="PATH=/home/librechat/.nvm/versions/node/v25.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/librechat/.nvm/versions/node/v25.0.0/bin/npm run build
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

### Erklärung der Option A (Preview-Server):

- **Type=simple**: Läuft als dauerhafter Prozess
- **ExecStartPre**: Führt `npm run build` aus BEVOR der Server startet
- **ExecStart**: Startet den Vite Preview-Server (standardmäßig auf Port 4173)
- **Restart=always**: Startet automatisch neu bei Crash
- **RestartSec=10**: Wartet 10 Sekunden vor dem Neustart

### Erklärung der Option B (Nur Build):

- **Type=oneshot**: Der Service führt einen einmaligen Prozess aus und bleibt aktiv
- **ExecStart**: Führt nur den Build aus
- **RemainAfterExit=yes**: Der Service bleibt aktiv nach dem Ausführen (für `systemctl status`)

**Empfehlung**: Verwende Option B für beste Performance, da Caddy die statischen Dateien direkt serviert ohne zusätzlichen Node-Prozess.

## Caddyfile Konfiguration für Option B

Dein aktuelles Caddyfile:
```
mark.martuni.de {
    reverse_proxy localhost:5173
}
```

**Ändere es zu**:
```
mark.martuni.de {
    root * /home/librechat/mark/dist
    file_server
    
    # Für Single Page Application (SPA) Routing
    try_files {path} /index.html
}
```

### Erklärung der Caddyfile-Konfiguration:

- **root * /home/librechat/mark/dist**: Caddy serviert Dateien aus dem dist-Verzeichnis
- **file_server**: Aktiviert den Dateiserver
- **try_files {path} /index.html**: Für SPA-Routing (falls du Client-seitiges Routing verwendest)

## Schritt 3: Service aktivieren und starten

Nach dem Erstellen der Datei:

```bash
# Systemd-Konfiguration neu laden
sudo systemctl daemon-reload

# Service aktivieren (startet beim Booten)
sudo systemctl enable markdown-editor-pro.service

# Service starten
sudo systemctl start markdown-editor-pro.service
```

## Schritt 4: Service überprüfen

### Status prüfen:
```bash
sudo systemctl status markdown-editor-pro.service
```

### Logs ansehen:
```bash
# Alle Logs
sudo journalctl -u markdown-editor-pro.service

# Nur die letzten 50 Zeilen
sudo journalctl -u markdown-editor-pro.service -n 50

# Live-Logs mit Tail
sudo journalctl -u markdown-editor-pro.service -f
```

## Service-Management Befehle

### Service starten:
```bash
sudo systemctl start markdown-editor-pro.service
```

### Service stoppen:
```bash
sudo systemctl stop markdown-editor-pro.service
```

### Service neu starten:
```bash
sudo systemctl restart markdown-editor-pro.service
```

### Service deaktivieren (Boot-Start entfernen):
```bash
sudo systemctl disable markdown-editor-pro.service
```

### Service aktivieren (Boot-Start hinzufügen):
```bash
sudo systemctl enable markdown-editor-pro.service
```

## Wichtige Hinweise

1. **Berechtigungen**: Stelle sicher, dass der User `librechat` Schreibrechte auf das Projektverzeichnis hat
2. **Caddy neu laden**: Nach Änderungen am Caddyfile oder nach einem Build:
   ```bash
   sudo systemctl reload caddy
   ```
3. **npm Pfade**: Die Pfade in dieser Anleitung sind spezifisch für deine Installation. Wenn sich die Node-Version ändert, muss der Pfad entsprechend angepasst werden.
4. **Build nach Code-Änderungen**: Bei Code-Änderungen einfach den Service neu starten:
   ```bash
   sudo systemctl restart markdown-editor-pro.service
   ```
   Dies führt einen neuen Build aus. Danach werden die Änderungen sofort über Caddy verfügbar sein.

## Alternative: Automatischer Build bei Code-Änderungen

Falls du einen Entwicklungs-Service möchtest, der automatisch neu baut wenn sich der Code ändert, kannst du folgende Service-Datei verwenden:

```ini
[Unit]
Description=Markdown Editor Pro - Development Service
After=network.target

[Service]
Type=simple
User=librechat
Group=librechat
WorkingDirectory=/home/librechat/mark
Environment="PATH=/home/librechat/.nvm/versions/node/v25.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/librechat/.nvm/versions/node/v25.0.0/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Wichtig**: Ändere `Type=oneshot` zu `Type=simple` und `ExecStart` zu `npm run dev` für den Entwicklungsmodus.

## Troubleshooting

### Service startet nicht:
```bash
# Überprüfe die Logs
sudo journalctl -u markdown-editor-pro.service -n 100

# Überprüfe ob npm erreichbar ist
sudo -u librechat /home/librechat/.nvm/versions/node/v25.0.0/bin/npm --version
```

### Dateiberechtigungen:
```bash
# Stelle sicher, dass librechat das Verzeichnis besitzt
sudo chown -R librechat:librechat /home/librechat/mark
```

### HTTP 403 Forbidden Fehler:

Das Problem: Caddy hat keine Leserechte auf das dist-Verzeichnis.

**Lösung 1: Berechtigungen für Gruppenlesezugriff setzen**
```bash
# Überprüfe als welcher User Caddy läuft
ps aux | grep caddy

# Setze Gruppenberechtigungen für Lesung
sudo chmod -R 755 /home/librechat/mark/dist
sudo chmod -R 755 /home/librechat/mark

# Wenn Caddy als User 'caddy' oder 'www-data' läuft, füge diesen User zur Gruppe hinzu
sudo usermod -a -G librechat caddy
# oder
sudo usermod -a -G librechat www-data

# Teste ob das dist-Verzeichnis existiert und Dateien enthält
ls -la /home/librechat/mark/dist
```

**Lösung 2: Caddy als librechat User laufen lassen**

Prüfe deine Caddy-Service-Konfiguration:
```bash
sudo systemctl cat caddy
```

Wenn Caddy als root oder anderer User läuft, ändere die Caddy-Service-Datei:
```bash
sudo nano /etc/systemd/system/caddy.service
# oder
sudo nano /lib/systemd/system/caddy.service
```

Füge oder ändere die User-Direktive:
```ini
[Service]
User=librechat
Group=librechat
```

Dann neu laden:
```bash
sudo systemctl daemon-reload
sudo systemctl restart caddy
```

**Lösung 3: Öffentliche Berechtigungen (unsicherer, aber schnell zum Testen)**
```bash
# Nur zum Testen - dann wieder restriktiver machen!
sudo chmod -R 755 /home/librechat/mark/dist
sudo chmod 755 /home/librechat/mark
```

### Caddy erkennt Änderungen nicht:
```bash
# Nach einem Build Caddy neu laden
sudo systemctl reload caddy
# oder
sudo systemctl restart caddy
```

### Caddy zeigt 404 Fehler:
```bash
# Überprüfe ob dist-Verzeichnis existiert
ls -la /home/librechat/mark/dist

# Stelle sicher, dass Caddy Zugriff auf das Verzeichnis hat
sudo chown -R librechat:librechat /home/librechat/mark/dist

# Überprüfe Caddy-Logs
sudo journalctl -u caddy -n 50
```

### Caddyfile wird nicht angewendet:
```bash
# Überprüfe Caddyfile Syntax
sudo caddy validate --config /etc/caddy/Caddyfile

# Prüfe wo Caddyfile liegt (beim User)
caddy validate

# Reload Caddy
sudo systemctl reload caddy
```

