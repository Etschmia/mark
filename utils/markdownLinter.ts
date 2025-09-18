import { lint } from 'markdownlint/sync';

export interface LintError {
  lineNumber: number;
  ruleNames: string[];
  ruleDescription: string;
  ruleInformation: string;
  errorDetail: string | null;
  errorContext: string | null;
  errorRange: [number, number] | null;
  fixInfo?: {
    editColumn?: number;
    deleteCount?: number;
    insertText?: string;
  };
}

export interface LintResult {
  errors: LintError[];
  errorCount: number;
  warningCount: number;
}

// Default markdownlint configuration
const defaultConfig = {
  // Disable some rules that might be too strict for general use
  'MD013': false, // Line length - often too restrictive for markdown
  'MD033': false, // Inline HTML - useful in markdown
  'MD041': false, // First line in file should be a top level header - not always needed
  
  // Enable important rules
  'MD001': true,  // Header levels should only increment by one level at a time
  'MD003': { style: 'atx' }, // Header style should be consistent (# style)
  'MD004': { style: 'dash' }, // Unordered list style should be consistent (- style)
  'MD005': true,  // Inconsistent indentation for list items at the same level
  'MD007': { indent: 2 }, // Unordered list indentation should be consistent
  'MD009': true,  // Trailing spaces
  'MD010': true,  // Hard tabs
  'MD011': true,  // Reversed link syntax
  'MD012': true,  // Multiple consecutive blank lines
  'MD018': true,  // No space after hash on atx style header
  'MD019': true,  // Multiple spaces after hash on atx style header
  'MD020': true,  // No space inside hashes on closed atx style header
  'MD021': true,  // Multiple spaces inside hashes on closed atx style header
  'MD022': true,  // Headers should be surrounded by blank lines
  'MD023': true,  // Headers must start at the beginning of the line
  'MD024': true,  // Multiple headers with the same content
  'MD025': true,  // Multiple top level headers in the same document
  'MD026': true,  // Trailing punctuation in header
  'MD027': true,  // Multiple spaces after blockquote symbol
  'MD028': true,  // Blank line inside blockquote
  'MD029': { style: 'ordered' }, // Ordered list item prefix should be consistent
  'MD030': true,  // Spaces after list markers
  'MD031': true,  // Fenced code blocks should be surrounded by blank lines
  'MD032': true,  // Lists should be surrounded by blank lines
  'MD034': true,  // Bare URL used
  'MD035': { style: '---' }, // Horizontal rule style should be consistent
  'MD036': true,  // Emphasis used instead of a header
  'MD037': true,  // Spaces inside emphasis markers
  'MD038': true,  // Spaces inside code span elements
  'MD039': true,  // Spaces inside link text
  'MD040': true,  // Fenced code blocks should have a language specified
  'MD042': true,  // No empty links
  'MD043': false, // Required header structure - too restrictive for general use
  'MD044': true,  // Proper names should have the correct capitalization
  'MD045': true,  // Images should have alternate text (alt text)
  'MD046': { style: 'fenced' }, // Code block style should be consistent
  'MD047': true,  // Files should end with a single newline character
  'MD048': { style: 'backtick' }, // Code fence style should be consistent
  'MD049': { style: 'underscore' }, // Emphasis style should be consistent
  'MD050': { style: 'asterisk' }, // Strong style should be consistent
};

export function lintMarkdown(content: string, config = defaultConfig): LintResult {
  try {
    // Use the correct markdownlint API
    const result = lint({
      strings: {
        'content': content
      },
      config: config
    });

    const errors: LintError[] = [];
    const contentErrors = result['content'] || [];

    contentErrors.forEach((error: any) => {
      errors.push({
        lineNumber: error.lineNumber,
        ruleNames: error.ruleNames,
        ruleDescription: error.ruleDescription,
        ruleInformation: error.ruleInformation,
        errorDetail: error.errorDetail,
        errorContext: error.errorContext,
        errorRange: error.errorRange,
        fixInfo: error.fixInfo
      });
    });

    // Sort errors by line number
    errors.sort((a, b) => a.lineNumber - b.lineNumber);

    return {
      errors,
      errorCount: errors.length,
      warningCount: 0 // markdownlint doesn't distinguish between errors and warnings
    };
  } catch (error) {
    console.error('Markdown linting failed:', error);
    return {
      errors: [],
      errorCount: 0,
      warningCount: 0
    };
  }
}

// Get a human-readable description of the error
export function getErrorDescription(error: LintError): string {
  let description = error.ruleDescription;
  
  if (error.errorDetail) {
    description += `: ${error.errorDetail}`;
  }
  
  if (error.errorContext) {
    description += ` (${error.errorContext})`;
  }
  
  return description;
}

// Get severity level for styling
export function getErrorSeverity(error: LintError): 'error' | 'warning' {
  // For now, treat all as errors. Could be extended to have different severities
  return 'error';
}

// Check if an error can be auto-fixed
export function canAutoFix(error: LintError): boolean {
  return error.fixInfo !== undefined;
}

// Apply auto-fix to content
export function applyAutoFix(content: string, error: LintError): string {
  if (!error.fixInfo || !error.errorRange) {
    return content;
  }

  const lines = content.split('\n');
  const lineIndex = error.lineNumber - 1;
  
  if (lineIndex < 0 || lineIndex >= lines.length) {
    return content;
  }

  const line = lines[lineIndex];
  const { fixInfo, errorRange } = error;
  
  // Calculate the actual column position (errorRange is 1-based)
  const startCol = (fixInfo.editColumn || errorRange[0]) - 1;
  const deleteCount = fixInfo.deleteCount || 0;
  const insertText = fixInfo.insertText || '';
  
  // Apply the fix
  const newLine = line.substring(0, startCol) + insertText + line.substring(startCol + deleteCount);
  lines[lineIndex] = newLine;
  
  return lines.join('\n');
}