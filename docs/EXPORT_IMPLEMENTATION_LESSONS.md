# Export Implementation Lessons & Best Practices

This document records the challenges encountered and solutions implemented while fixing the PDF and DOCX export functionality in the Markdown Editor Pro application.

## 1. PDF Export Challenges

### Issue: Unsupported Color Function `oklch`
**Problem:** The application uses Tailwind CSS v4, which defaults to using the modern `oklch` color space. The `html2canvas` library (used for rendering HTML to images for PDF) does not support `oklch` and throws an error: `Error: Attempting to parse an unsupported color function "oklch"`.

**Failed Attempts:**
- **Inline Style Sanitization:** Trying to detect and replace `oklch` values in computed styles was unreliable because `html2canvas` parses stylesheets independently.
- **`onclone` Stylesheet Removal:** Removing stylesheets in the `onclone` callback was insufficient because `html2canvas` had already parsed some styles or accessed the main document context.

**Successful Solution: Strict Iframe Isolation**
To completely prevent `html2canvas` from seeing any `oklch` values:
1.  **Isolated Iframe:** Create a hidden `<iframe>` and write a minimal HTML structure into it. This creates a completely fresh document context with **no stylesheets**.
2.  **Explicit Styling:** Copy the content into this iframe and apply all necessary styling (fonts, colors, spacing) using **inline styles** only.
3.  **Aggressive Color Reset:** Iterate through all elements and force safe hex colors (e.g., `#333333` for text, `#ffffff` for background). Remove all `class` attributes to ensure no Tailwind classes are active.
4.  **Context Isolation:** When calling `html2canvas` (or `jspdf.html`), explicitly pass the iframe's `window` and `document` objects. This is critical to prevent the library from falling back to the main window context.

```typescript
// Example configuration for jspdf.html
pdf.html(container, {
  // ...
  html2canvas: {
    window: iframe.contentWindow, // CRITICAL: Use iframe context
    document: iframeDoc,          // CRITICAL: Use iframe document
    // ...
  }
});
```

### Issue: Page Breaks Cutting Text
**Problem:** Manually slicing a large canvas into A4-sized chunks results in hard cuts through text lines and images.

**Successful Solution: `jspdf.html()` with Auto-Paging**
Instead of manual canvas manipulation, use the `html()` method provided by `jspdf`:
1.  **Auto-Paging:** Enable `autoPaging: 'text'`. This tells `jspdf` to analyze the content and insert page breaks at safe locations (between paragraphs, div boundaries, etc.).
2.  **Margins:** Configure proper margins (e.g., 15mm top/bottom) to ensure content doesn't touch the page edges.
3.  **Scale:** Calculate the correct scale factor to map the HTML pixel width (e.g., 880px) to the PDF print width (A4 width minus margins).

## 2. DOCX Export Challenges

### Issue: `TypeError: options.config is not iterable`
**Problem:** The `docx` library version used had a breaking change or specific requirement for the numbering configuration structure that didn't match the older `numberingDefinitions` format.

**Solution:**
Update the configuration to use the `config` property with a reference key:

```typescript
// Old (failing)
numbering: {
  numberingDefinitions: [...]
}

// New (working)
numbering: {
  config: [
    {
      reference: 'default-numbering',
      levels: [...]
    }
  ]
}
```

## Summary of Best Practices for Future Exports

1.  **Isolation is Key:** For PDF export, never rely on the main document's styles if you use modern CSS features (like `oklch`, CSS variables, or complex grids) that rendering libraries might not support. Always render in a clean, isolated container (iframe).
2.  **Inline Styles:** For the export container, use explicit inline styles for everything (fonts, colors, spacing). This ensures consistent rendering across different environments and libraries.
3.  **Use Library Features:** Prefer high-level APIs like `jspdf.html()` over manual canvas manipulation for better handling of multi-page documents and text wrapping.
4.  **Verify Dependencies:** Be aware of library limitations (e.g., `html2canvas` vs. modern CSS) and version-specific API changes (e.g., `docx` configuration).
