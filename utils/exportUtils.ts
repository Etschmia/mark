import { marked } from 'marked';
import DOMPurify from 'dompurify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export formats
export type ExportFormat = 'html' | 'pdf';

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
    const htmlContent = await markdownToHtml(options.content);
    
    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.padding = '40px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif';
    tempContainer.style.lineHeight = '1.6';
    tempContainer.style.color = '#333333';
    tempContainer.innerHTML = htmlContent;
    
    document.body.appendChild(tempContainer);
    
    // Apply additional styling for PDF
    const elements = tempContainer.querySelectorAll('*');
    elements.forEach((el) => {
      const element = el as HTMLElement;
      if (element.tagName === 'H1') {
        element.style.fontSize = '24px';
        element.style.marginTop = '32px';
        element.style.marginBottom = '16px';
        element.style.fontWeight = '600';
        element.style.borderBottom = '1px solid #eee';
        element.style.paddingBottom = '8px';
      } else if (element.tagName === 'H2') {
        element.style.fontSize = '20px';
        element.style.marginTop = '24px';
        element.style.marginBottom = '12px';
        element.style.fontWeight = '600';
      } else if (element.tagName === 'H3') {
        element.style.fontSize = '18px';
        element.style.marginTop = '20px';
        element.style.marginBottom = '10px';
        element.style.fontWeight = '600';
      } else if (element.tagName === 'P') {
        element.style.marginBottom = '16px';
      } else if (element.tagName === 'PRE') {
        element.style.backgroundColor = '#f5f5f5';
        element.style.padding = '16px';
        element.style.borderRadius = '4px';
        element.style.border = '1px solid #ddd';
        element.style.overflow = 'visible';
        element.style.whiteSpace = 'pre-wrap';
      } else if (element.tagName === 'CODE' && element.parentElement?.tagName !== 'PRE') {
        element.style.backgroundColor = '#f3f4f6';
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
        if (element.tagName === 'TH') {
          element.style.backgroundColor = '#f3f4f6';
          element.style.fontWeight = '600';
        }
      }
    });
    
    // Generate canvas from the HTML content
    const canvas = await html2canvas(tempContainer, {
      width: 800,
      height: tempContainer.scrollHeight,
      useCORS: true,
      allowTaint: true,
      background: '#ffffff'
    });
    
    // Remove temporary container
    document.body.removeChild(tempContainer);
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20); // subtract margins
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }
    
    // Download the PDF
    const filename = options.filename.replace(/\.md$/, '.pdf');
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    throw new Error('Failed to export as PDF');
  }
}