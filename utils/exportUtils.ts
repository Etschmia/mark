// Dynamic imports for heavy dependencies
let marked: any = null;
let DOMPurify: any = null;
let jsPDF: any = null;
let html2canvas: any = null;

// Cache for loaded modules
const moduleCache = {
  marked: null as any,
  dompurify: null as any,
  jspdf: null as any,
  html2canvas: null as any,
  docx: null as any
};

// Dynamic loader for export dependencies
const loadExportDependencies = async () => {
  if (moduleCache.marked && moduleCache.dompurify) {
    return {
      marked: moduleCache.marked,
      DOMPurify: moduleCache.dompurify
    };
  }

  try {
    const [markedModule, purifyModule] = await Promise.all([
      import('marked'),
      import('dompurify')
    ]);

    moduleCache.marked = markedModule.marked;
    moduleCache.dompurify = purifyModule.default;

    return {
      marked: moduleCache.marked,
      DOMPurify: moduleCache.dompurify
    };
  } catch (error) {
    console.error('Failed to load export dependencies:', error);
    throw error;
  }
};

// Dynamic loader for PDF dependencies
const loadPDFDependencies = async () => {
  if (moduleCache.jspdf && moduleCache.html2canvas) {
    return {
      jsPDF: moduleCache.jspdf,
      html2canvas: moduleCache.html2canvas
    };
  }

  try {
    const [jspdfModule, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);

    moduleCache.jspdf = jspdfModule.default;
    moduleCache.html2canvas = html2canvasModule.default;

    return {
      jsPDF: moduleCache.jspdf,
      html2canvas: moduleCache.html2canvas
    };
  } catch (error) {
    console.error('Failed to load PDF dependencies:', error);
    throw error;
  }
};

// Dynamic loader for DOCX dependencies
// Dynamic loader for DOCX dependencies
const loadDocxDependencies = async () => {
  if (moduleCache.docx) {
    return moduleCache.docx;
  }

  try {
    const docxModule = await import('docx');
    // Handle both ESM and CJS interop
    moduleCache.docx = (docxModule as any).default || docxModule;
    return moduleCache.docx;
  } catch (error) {
    console.error('Failed to load DOCX dependencies:', error);
    throw error;
  }
};

// Export formats
export type ExportFormat = 'html' | 'pdf' | 'docx';

// Export options interface
export interface ExportOptions {
  filename: string;
  content: string;
  theme?: string;
}

// HTML export configuration - similar to Preview component
const ALLOWED_TAGS = [
  'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'br', 'span', 'img', 'del', 's', 'strike', 'input'
];

const ALLOWED_ATTR = [
  'style', 'class', 'href', 'src', 'alt', 'title', 'width', 'height',
  'start', 'type', 'align', 'colspan', 'rowspan', 'checked', 'disabled'
];

/**
 * Convert markdown to HTML with proper sanitization
 */
async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const { marked, DOMPurify } = await loadExportDependencies();
    const rawHtml = await marked.parse(markdown);
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return '<p style="color: #f87171;">Error parsing markdown.</p>';
  }
}

/**
 * Generate a complete HTML document with CSS styles
 */
function generateCompleteHtml(content: string, theme?: string): string {
  // Basic CSS styles for exported HTML
  const baseStyles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background-color: #fff;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 { font-size: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    
    p { margin-bottom: 1rem; }
    
    ul, ol {
      margin-bottom: 1rem;
      padding-left: 2rem;
    }
    
    li { margin-bottom: 0.25rem; }
    
    blockquote {
      margin: 1rem 0;
      padding: 0 1rem;
      border-left: 4px solid #e5e7eb;
      background-color: #f9fafb;
      color: #6b7280;
    }
    
    code {
      background-color: #f3f4f6;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: 'Fira Code', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 0.875em;
    }
    
    pre {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    pre code {
      background-color: transparent;
      padding: 0;
      color: inherit;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    
    th, td {
      border: 1px solid #d1d5db;
      padding: 0.5rem;
      text-align: left;
    }
    
    th {
      background-color: #f3f4f6;
      font-weight: 600;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.25rem;
    }
    
    a {
      color: #2563eb;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    del, s, strike {
      text-decoration: line-through;
      opacity: 0.7;
    }
    
    @media print {
      body {
        padding: 1rem;
        font-size: 12pt;
      }
      
      h1 { font-size: 18pt; }
      h2 { font-size: 16pt; }
      h3 { font-size: 14pt; }
      
      pre {
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
      }
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown</title>
  <style>${baseStyles}</style>
</head>
<body>
  ${content}
</body>
</html>`;
}

/**
 * Export content as HTML file
 */
export async function exportAsHtml(options: ExportOptions): Promise<void> {
  try {
    const htmlContent = await markdownToHtml(options.content);
    const completeHtml = generateCompleteHtml(htmlContent, options.theme);

    const filename = options.filename.replace(/\.md$/, '.html');
    const blob = new Blob([completeHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting as HTML:', error);
    throw new Error('Failed to export as HTML');
  }
}

/**
 * Export content as PDF file
 */
export async function exportAsPdf(options: ExportOptions): Promise<void> {
  try {
    // Load PDF dependencies dynamically
    const { jsPDF, html2canvas } = await loadPDFDependencies();

    const htmlContent = await markdownToHtml(options.content);

    // Create an iframe for complete isolation from page styles
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '800px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      throw new Error('Failed to create isolated document for PDF export');
    }

    // Write minimal HTML to iframe (no stylesheets, no Tailwind)
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0;">
        <div id="export-content"></div>
      </body>
      </html>
    `);
    iframeDoc.close();

    const tempContainer = iframeDoc.getElementById('export-content')!;
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.width = '880px'; // 800px content + 80px padding
    tempContainer.style.padding = '40px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif';
    tempContainer.style.lineHeight = '1.6';
    tempContainer.style.color = '#333333';
    tempContainer.style.wordWrap = 'break-word';
    tempContainer.style.overflowWrap = 'break-word';
    tempContainer.innerHTML = htmlContent;

    // Apply additional styling for PDF
    // Aggressively set safe colors on ALL elements to avoid any oklch values
    const elements = tempContainer.querySelectorAll('*');
    elements.forEach((el) => {
      const element = el as HTMLElement;

      // Remove all class attributes to prevent any potential style references
      element.removeAttribute('class');

      // Force safe default colors on every element
      if (!element.style.color) {
        element.style.color = '#333333';
      }
      if (!element.style.backgroundColor && element.tagName !== 'SPAN') {
        element.style.backgroundColor = 'transparent';
      }
      if (!element.style.borderColor) {
        element.style.borderColor = '#e5e7eb';
      }

      // Set page-break properties to avoid splitting elements across pages
      element.style.pageBreakInside = 'avoid';
      element.style.breakInside = 'avoid';

      if (element.tagName === 'H1') {
        element.style.fontSize = '24px';
        element.style.marginTop = '32px';
        element.style.marginBottom = '16px';
        element.style.fontWeight = '600';
        element.style.borderBottom = '1px solid #eee';
        element.style.paddingBottom = '8px';
        element.style.color = '#333333';
        element.style.pageBreakAfter = 'avoid';
        element.style.breakAfter = 'avoid';
      } else if (element.tagName === 'H2') {
        element.style.fontSize = '20px';
        element.style.marginTop = '24px';
        element.style.marginBottom = '12px';
        element.style.fontWeight = '600';
        element.style.color = '#333333';
        element.style.pageBreakAfter = 'avoid';
        element.style.breakAfter = 'avoid';
      } else if (element.tagName === 'H3') {
        element.style.fontSize = '18px';
        element.style.marginTop = '20px';
        element.style.marginBottom = '10px';
        element.style.fontWeight = '600';
        element.style.color = '#333333';
        element.style.pageBreakAfter = 'avoid';
        element.style.breakAfter = 'avoid';
      } else if (element.tagName === 'P') {
        element.style.marginBottom = '16px';
        element.style.color = '#333333';
      } else if (element.tagName === 'PRE') {
        element.style.backgroundColor = '#f5f5f5';
        element.style.color = '#333333';
        element.style.padding = '16px';
        element.style.borderRadius = '4px';
        element.style.border = '1px solid #ddd';
        element.style.overflow = 'visible';
        element.style.whiteSpace = 'pre-wrap';
      } else if (element.tagName === 'CODE' && element.parentElement?.tagName !== 'PRE') {
        element.style.backgroundColor = '#f3f4f6';
        element.style.color = '#333333';
        element.style.padding = '2px 4px';
        element.style.borderRadius = '3px';
        element.style.fontSize = '0.9em';
      } else if (element.tagName === 'BLOCKQUOTE') {
        element.style.margin = '16px 0';
        element.style.padding = '0 16px';
        element.style.borderLeft = '4px solid #e5e7eb';
        element.style.backgroundColor = '#f9fafb';
        element.style.color = '#6b7280';
      } else if (element.tagName === 'TABLE') {
        element.style.borderCollapse = 'collapse';
        element.style.width = '100%';
        element.style.margin = '16px 0';
      } else if (element.tagName === 'TH' || element.tagName === 'TD') {
        element.style.border = '1px solid #d1d5db';
        element.style.padding = '8px';
        element.style.textAlign = 'left';
        element.style.color = '#333333';
        if (element.tagName === 'TH') {
          element.style.backgroundColor = '#f3f4f6';
          element.style.fontWeight = '600';
        }
      }

      // For list items, prevent orphans
      if (element.tagName === 'LI') {
        element.style.pageBreakInside = 'avoid';
        element.style.breakInside = 'avoid';
      }
    });

    // Make html2canvas available globally for jsPDF
    // @ts-ignore
    window.html2canvas = html2canvas;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // 15mm margin

    await new Promise<void>((resolve) => {
      pdf.html(tempContainer, {
        callback: (doc) => {
          const filename = options.filename.replace(/\.md$/, '.pdf');
          doc.save(filename);
          resolve();
        },
        x: margin,
        y: margin,
        width: pdfWidth - (margin * 2), // Target width in PDF units
        windowWidth: 880, // Source width in pixels (matches container width)
        margin: [margin, margin, margin, margin],
        autoPaging: 'text', // Try to avoid cutting text
        html2canvas: {
          scale: (pdfWidth - (margin * 2)) / 880, // Explicit scale to match widths
          useCORS: true,
          allowTaint: true,
          background: '#ffffff',
          windowWidth: 880,
          // Explicitly use the iframe's window and document to ensure isolation from main page styles
          window: iframe.contentWindow,
          document: iframeDoc,
          // Ensure we don't clone into the main document
          ignoreElements: (element) => {
            // Ignore any script or style tags that might have snuck in
            return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
          }
        }
      });
    });

    // Remove iframe
    document.body.removeChild(iframe);

    // Clean up global html2canvas
    // @ts-ignore
    delete window.html2canvas;
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    throw new Error('Failed to export as PDF');
  }
}

/**
 * Export content as DOCX file
 */
export async function exportAsDocx(options: ExportOptions): Promise<void> {
  try {
    const docx = await loadDocxDependencies();
    // @ts-ignore
    const { Packer } = docx as any;

    const doc = await markdownToDocx(options.content);

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);

    const filename = options.filename.replace(/\.md$/, '.docx');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting as DOCX:', error);
    throw new Error('Failed to export as DOCX');
  }
}

// Markdown to DOCX converter
async function markdownToDocx(markdown: string): Promise<any> {
  const { marked } = await loadExportDependencies();
  // @ts-ignore
  const docx = await loadDocxDependencies();
  // @ts-ignore
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun, ExternalHyperlink } = docx as any;

  const tokens = marked.lexer(markdown);
  const children = await buildDocxChildren(tokens, marked, docx);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children,
    }],
  });

  return doc;
}

async function buildDocxChildren(tokens: any[], marked: any, docx: any): Promise<any[]> {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } = docx;
  const children = [];

  for (const token of tokens) {
    let element;

    switch (token.type) {
      case 'heading':
        const headingSize = 48 - (token.depth * 4); // h1: 24pt (48 twips), h2: 20pt (40), etc.
        const headingRun = new TextRun({
          text: token.text,
          bold: true,
          size: headingSize,
        });

        element = new Paragraph({
          children: [headingRun],
          heading: HeadingLevel[`HEADING_${token.depth}` as any],
          alignment: AlignmentType.LEFT,
        });

        if (token.depth === 1) {
          element.border = {
            bottom: {
              style: 'single',
              sz: 12,
              color: 'auto',
            },
          };
        }

        children.push(element);
        break;

      case 'paragraph':
        const inline = await buildInline(token.tokens || [{ type: 'text', text: token.text }], marked, docx);
        element = new Paragraph({
          children: inline,
          alignment: AlignmentType.LEFT,
        });
        children.push(element);
        break;

      case 'list':
        const isOrdered = token.ordered;
        for (const item of token.items) {
          const itemInline = await buildInline(item.tokens || [{ type: 'text', text: item.text }], marked, docx);
          const listItem = new Paragraph({
            children: itemInline,
            bullet: isOrdered ? undefined : { level: 0 },
            numbering: isOrdered ? {
              reference: 'decimal',
              level: 0,
            } : undefined,
          });
          children.push(listItem);
        }
        break;

      case 'blockquote':
        const quoteChildren = await buildDocxChildren(token.tokens, marked, docx);
        for (const qChild of quoteChildren) {
          const quotePara = new Paragraph({
            children: Array.isArray(qChild.children) ? qChild.children : [qChild],
            indentation: {
              left: 720,
            },
            border: {
              left: {
                style: 'single',
                sz: 80,
                color: 'E5E7EB',
              },
            },
          });
          children.push(quotePara);
        }
        break;

      case 'fence':
      case 'code':
        const codeText = token.text;
        const codeRun = new TextRun({
          text: codeText,
          font: 'Courier New',
          size: 24,
        });
        element = new Paragraph({
          children: [codeRun],
          alignment: AlignmentType.LEFT,
          indentation: {
            left: 720,
            right: 720,
          },
          border: {
            top: {
              style: 'single',
              sz: 12,
              color: 'auto',
            },
            bottom: {
              style: 'single',
              sz: 12,
              color: 'auto',
            },
            left: {
              style: 'single',
              sz: 12,
              color: 'auto',
            },
            right: {
              style: 'single',
              sz: 12,
              color: 'auto',
            },
          },
        });
        children.push(element);
        break;

      case 'table':
        const headerRow = new TableRow({
          children: token.header.map((header: string) => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: header,
                bold: true,
                size: 24,
              })],
            })],
            width: {
              size: 100 / token.header.length,
              type: WidthType.PERCENTAGE,
            },
          })),
          tableHeader: true,
        });

        const bodyRows = token.cells.map((row: string[]) => new TableRow({
          children: row.map((cell: string) => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: cell })],
            })],
            width: {
              size: 100 / token.header.length,
              type: WidthType.PERCENTAGE,
            },
          })),
        }));

        const rows = [headerRow, ...bodyRows];
        element = new Table({
          rows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        });
        children.push(element);
        break;

      case 'image':
        try {
          const response = await fetch(token.href);
          if (!response.ok) throw new Error('Failed to fetch image');
          const buffer = await response.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          const extension = token.href.split('.').pop()?.toLowerCase();
          const imageType = extension === 'png' ? 'png' : (extension === 'jpg' || extension === 'jpeg') ? 'jpeg' : 'png';

          const image = new ImageRun({
            data: base64,
            transformation: {
              width: 2000, // ~100pt
              height: 1500, // Fixed aspect approx
            },
          });

          element = new Paragraph({
            children: [image],
            alignment: AlignmentType.CENTER,
          });
          children.push(element);
        } catch (error) {
          console.error('Failed to load image:', token.href, error);
          children.push(new Paragraph({
            text: `![${token.alt || 'Image'}](${token.href})`,
          }));
        }
        break;

      default:
        if (token.tokens) {
          const subChildren = await buildDocxChildren(token.tokens, marked, docx);
          children.push(...subChildren);
        }
        break;
    }
  }

  return children;
}

async function buildInline(tokens: any[], marked: any, docx: any): Promise<any[]> {
  const { TextRun, ExternalHyperlink } = docx;
  const inline = [];

  for (const token of tokens) {
    let run;

    switch (token.type) {
      case 'text':
        run = new TextRun({ text: token.text });
        break;

      case 'codespan':
        run = new TextRun({
          text: token.text,
          font: 'Courier New',
          size: 20,
          color: '000000',
        });
        break;

      case 'strong':
        run = new TextRun({
          text: token.text,
          bold: true,
        });
        break;

      case 'em':
        run = new TextRun({
          text: token.text,
          italics: true,
        });
        break;

      case 'del':
        run = new TextRun({
          text: token.text,
          strike: true,
        });
        break;

      case 'link':
        const linkRun = new TextRun({
          text: token.text,
          color: '2563EB',
        });
        const link = new ExternalHyperlink({
          children: [linkRun],
          link: token.href,
        });
        inline.push(link);
        continue;

      default:
        run = new TextRun({ text: token.text || '' });
        break;
    }

    if (run) {
      inline.push(run);
    }
  }

  return inline;
}