/**
 * Desktop file service — native file operations via Tauri plugins.
 * Only imported when isDesktopApp() is true (lazy loaded).
 */

let dialogModule: typeof import('@tauri-apps/plugin-dialog') | null = null;
let fsModule: typeof import('@tauri-apps/plugin-fs') | null = null;

async function ensureModules() {
  if (!dialogModule || !fsModule) {
    [dialogModule, fsModule] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/plugin-fs'),
    ]);
  }
  return { dialog: dialogModule!, fs: fsModule! };
}

export interface DesktopOpenResult {
  content: string;
  filePath: string;
  fileName: string;
}

export interface DesktopSaveResult {
  filePath: string;
  fileName: string;
}

/**
 * Show a native "Open File" dialog, read the selected file, and return its contents.
 */
export async function desktopOpenFile(): Promise<DesktopOpenResult | null> {
  const { dialog, fs } = await ensureModules();

  const selected = await dialog.open({
    multiple: false,
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdx', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!selected) return null; // User cancelled

  const filePath = typeof selected === 'string' ? selected : selected;
  const content = await fs.readTextFile(filePath);
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'untitled.md';

  return { content, filePath, fileName };
}

/**
 * Read a file directly by path (no dialog).
 */
export async function desktopReadFile(filePath: string): Promise<string> {
  const { fs } = await ensureModules();
  return fs.readTextFile(filePath);
}

/**
 * Save content directly to a known file path (no dialog).
 */
export async function desktopSaveToPath(filePath: string, content: string): Promise<void> {
  const { fs } = await ensureModules();
  await fs.writeTextFile(filePath, content);
}

/**
 * Show a native "Save As" dialog, write the file, and return the chosen path.
 */
export async function desktopSaveFileAs(
  content: string,
  suggestedName: string
): Promise<DesktopSaveResult | null> {
  const { dialog, fs } = await ensureModules();

  const filePath = await dialog.save({
    defaultPath: suggestedName,
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!filePath) return null; // User cancelled

  await fs.writeTextFile(filePath, content);
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || suggestedName;

  return { filePath, fileName };
}

/**
 * Show a native "Open Folder" dialog and return the selected directory path.
 */
export async function desktopOpenFolder(): Promise<string | null> {
  const { dialog } = await ensureModules();

  const selected = await dialog.open({
    directory: true,
    multiple: false,
  });

  if (!selected) return null;
  return typeof selected === 'string' ? selected : null;
}

/**
 * Scan a directory for markdown files (non-recursive by default).
 * Uses Tauri fs plugin's readDir.
 */
export async function desktopScanDirectory(
  dirPath: string,
  recursive = true
): Promise<{ name: string; path: string; isDir: boolean }[]> {
  const { fs } = await ensureModules();

  const results: { name: string; path: string; isDir: boolean }[] = [];

  async function scan(dir: string) {
    const entries = await fs.readDir(dir);
    for (const entry of entries) {
      const entryPath = `${dir}/${entry.name}`;
      if (entry.isDirectory) {
        if (recursive && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(entryPath);
        }
      } else if (entry.name.match(/\.(md|markdown|mdx|txt)$/i)) {
        results.push({ name: entry.name, path: entryPath, isDir: false });
      }
    }
  }

  await scan(dirPath);
  results.sort((a, b) => a.path.localeCompare(b.path));
  return results;
}
