# Web Analytics Implementierung

Dieses Dokument beschreibt die Implementierung von Web Analytics für den Markdown Editor.

## Übersicht

Der Editor unterstützt zwei Umgebungen für Analytics:
1. **Vercel Analytics**: Wird automatisch verwendet, wenn die Anwendung auf Vercel (`editmd.vercel.app`) läuft.
2. **Google Analytics 4 (GA4)**: Wird verwendet, wenn die Anwendung selbst gehostet wird (z.B. `mark.martuni.de` oder `localhost`).

## Implementierung

Die Logik befindet sich in:
- `src/utils/environment.ts`: Erkennt die aktuelle Umgebung.
- `src/components/WebAnalytics.tsx`: Die Hauptkomponente, die in `App.tsx` eingebunden ist.

### Umgebungserkennung

Die Funktion `isVercel()` prüft, ob der Hostname `vercel.app` enthält.

```typescript
export const isVercel = (): boolean => {
  return window.location.hostname.includes('vercel.app');
};
```

### Google Analytics 4 (Self-Hosted)

Für die selbst gehostete Version wird `react-ga4` verwendet.
Die Initialisierung erfolgt nur, wenn `!isVercel()` wahr ist.

**Konfiguration:**
Die Measurement ID wird aus der Umgebungsvariable `VITE_GA_MEASUREMENT_ID` gelesen.
Erstellen Sie eine `.env` Datei im Projekt-Root mit folgendem Inhalt:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Ersetzen Sie `G-XXXXXXXXXX` durch Ihre echte GA4 Measurement ID.
**Wichtig:** Die Variable muss mit `VITE_` beginnen, damit sie vom Client-Code gelesen werden kann.

## Nutzung

Die Analytics-Komponente ist in `App.tsx` eingebunden und trackt automatisch Page Views beim Laden der Seite.
Da es sich um eine Single Page Application (SPA) ohne client-seitiges Routing handelt, wird primär der initiale Aufruf getrackt.

## Abhängigkeiten

- `@vercel/analytics`: Vercel Analytics SDK
- `react-ga4`: Google Analytics 4 Integration für React
