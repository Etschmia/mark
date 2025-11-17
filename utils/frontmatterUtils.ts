/**
 * Utilities for parsing and manipulating YAML frontmatter in Markdown documents
 */

export interface FrontmatterData {
  [key: string]: string;
}

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

/**
 * Extracts frontmatter from markdown content
 * @param markdown The markdown content
 * @returns Object with frontmatter data and content without frontmatter, or null if no frontmatter exists
 */
export function extractFrontmatter(markdown: string): {
  frontmatter: FrontmatterData;
  content: string;
} | null {
  const match = markdown.match(FRONTMATTER_REGEX);
  
  if (!match) {
    return null;
  }

  const frontmatterText = match[1].trim();
  const content = match[2];

  // Parse simple YAML key-value pairs
  const frontmatter: FrontmatterData = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue; // Skip empty lines and comments
    }
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      continue; // Skip lines without colons
    }
    
    const key = trimmed.substring(0, colonIndex).trim();
    let value = trimmed.substring(colonIndex + 1).trim();
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    if (key) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content };
}

/**
 * Checks if markdown content has frontmatter
 * @param markdown The markdown content
 * @returns true if frontmatter exists
 */
export function hasFrontmatter(markdown: string): boolean {
  return FRONTMATTER_REGEX.test(markdown);
}

/**
 * Removes frontmatter from markdown content
 * @param markdown The markdown content
 * @returns Content without frontmatter
 */
export function removeFrontmatter(markdown: string): string {
  const match = markdown.match(FRONTMATTER_REGEX);
  if (!match) {
    return markdown;
  }
  return match[2];
}

/**
 * Converts frontmatter object to YAML string
 * @param frontmatter The frontmatter data
 * @returns YAML string representation
 */
export function frontmatterToYaml(frontmatter: FrontmatterData): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(frontmatter)) {
    // Escape special characters in value if needed
    let escapedValue = value;
    if (value.includes(':') || value.includes('\n') || value.includes('"')) {
      escapedValue = `"${value.replace(/"/g, '\\"')}"`;
    }
    lines.push(`${key}: ${escapedValue}`);
  }
  return lines.join('\n');
}

/**
 * Combines frontmatter and content into a complete markdown document
 * @param frontmatter The frontmatter data
 * @param content The markdown content (without frontmatter)
 * @returns Complete markdown document with frontmatter
 */
export function combineFrontmatterAndContent(
  frontmatter: FrontmatterData,
  content: string
): string {
  if (Object.keys(frontmatter).length === 0) {
    return content;
  }

  const yaml = frontmatterToYaml(frontmatter);
  const contentTrimmed = content.trim();
  
  return `---\n${yaml}\n---\n${contentTrimmed ? '\n' + contentTrimmed : ''}`;
}

/**
 * Gets the current date in yyyy-mm-dd format
 * @returns Current date string
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

