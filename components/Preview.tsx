import React, { useState, useEffect } from 'react';
import { themes } from './preview-themes';

// Deklarieren der globalen Variablen, die von den <script>-Tags bereitgestellt werden.
// Dies informiert TypeScript darüber, dass diese existieren und welchen Typ sie haben.
declare global {
  interface Window {
    marked?: {
      // parse ist asynchron und gibt ein Promise zurück
      parse(markdown: string): Promise<string>;
    };
    DOMPurify?: {
      sanitize(html: string): string;
    };
  }
}

interface PreviewProps {
  markdown: string;
  theme: string;
}

export const Preview: React.FC<PreviewProps> = ({ markdown, theme }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  // Dieser Effekt parst das Markdown, sobald es sich ändert.
  useEffect(() => {
    // Sicherheitsprüfung, ob die globalen Bibliotheken geladen wurden.
    // Da die Skripte im <head> blockierend geladen werden, sollten sie beim Rendern
    // dieser Komponente immer verfügbar sein.
    if (!window.marked?.parse || !window.DOMPurify?.sanitize) {
      // Fehler anzeigen, falls die Bibliotheken aus irgendeinem Grund fehlen.
      setSanitizedHtml('<p style="color: #f87171;">Vorschau-Bibliotheken konnten nicht geladen werden.</p>');
      console.error("marked.js oder DOMPurify.js nicht im globalen Geltungsbereich gefunden.");
      return;
    }

    // Eine asynchrone Funktion, die das Parsen und Bereinigen durchführt.
    const parseAndSanitize = async () => {
      try {
        // marked.parse ist asynchron und gibt ein Promise zurück.
        const rawHtml = await window.marked!.parse(markdown);
        // DOMPurify bereinigt das HTML, um XSS-Schwachstellen zu vermeiden.
        const sanitized = window.DOMPurify!.sanitize(rawHtml);
        setSanitizedHtml(sanitized);
      } catch (error) {
        console.error("Fehler beim Parsen von Markdown:", error);
        setSanitizedHtml('<p style="color: #f87171;">Fehler beim Parsen des Markdowns.</p>');
      }
    };

    parseAndSanitize();
    // Dieser Effekt hängt nur vom `markdown`-Prop ab.
  }, [markdown]);

  const currentThemeStyles = themes[theme] || themes['Default'];

  return (
    <div
      className="rounded-lg h-full overflow-y-auto p-6 prose-styles transition-colors duration-300"
    >
      <style>{currentThemeStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};
