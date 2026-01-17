const baseStyles = `
    .prose-styles h1, .prose-styles h2, .prose-styles h3, .prose-styles h4, .prose-styles h5, .prose-styles h6 { font-weight: 600; }
    .prose-styles h1 { font-size: 2.25rem; line-height: 2.5rem; margin-top: 1rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom-width: 1px; }
    .prose-styles h2 { font-size: 1.875rem; line-height: 2.25rem; margin-top: 1rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom-width: 1px; }
    .prose-styles h3 { font-size: 1.5rem; line-height: 2rem; margin-top: 1rem; margin-bottom: 1rem; }
    .prose-styles p { margin-bottom: 1rem; line-height: 1.75; }
    .prose-styles ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
    .prose-styles ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
    .prose-styles li { margin-bottom: 0.5rem; }
    .prose-styles blockquote { border-left-width: 4px; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
    .prose-styles code:not(pre > code) { padding: 0.2rem 0.4rem; font-size: 0.9em; border-radius: 0.25rem; }
    .prose-styles pre { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; white-space: pre-wrap; overflow-wrap: break-word; }
    .prose-styles pre code { background-color: transparent; padding: 0; }
    .prose-styles table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    .prose-styles th, .prose-styles td { border-width: 1px; padding: 0.5rem 1rem; }
    .prose-styles th { font-weight: 600; }
    .prose-styles hr { border-top-width: 1px; margin: 2rem 0; }
    .prose-styles img { max-width: 100%; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem;}
`;

export const themes: { [key: string]: string } = {
  // ===== CLAUDE THEMES =====

  // Claude Light - warm off-white theme inspired by Claude documentation
  'Claude Light': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FDFDF7; color: #171714; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #E5E5DC; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #171714; font-weight: 600; }
    .prose-styles a { color: #C27B4F; }
    .prose-styles a:hover { color: #C08A66; }
    .prose-styles blockquote { color: #52524E; border-color: #D4A27F; background-color: #F8F8F3; }
    .prose-styles code:not(pre > code) { background-color: #F5F5F0; color: #9E6E42; font-family: 'Fira Code', monospace; border: 1px solid #E5E5DC; }
    .prose-styles pre { background-color: #F5F5F0; border: 1px solid #E5E5DC; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #F8F8F3; }
    .prose-styles li::marker { color: #D4A27F; }
  `,

  // Claude Dark - dark warm theme inspired by Claude documentation
  'Claude Dark': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #1A1918; color: #FAF9F6; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #3D3D39; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #FAF9F6; font-weight: 600; }
    .prose-styles a { color: #D4A27F; }
    .prose-styles a:hover { color: #E5B899; }
    .prose-styles blockquote { color: #B8B8B3; border-color: #D4A27F; background-color: #252523; }
    .prose-styles code:not(pre > code) { background-color: #2D2D2A; color: #D4A27F; font-family: 'Fira Code', monospace; border: 1px solid #3D3D39; }
    .prose-styles pre { background-color: #2D2D2A; border: 1px solid #3D3D39; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #252523; }
    .prose-styles li::marker { color: #D4A27F; }
  `,

  // ===== DARK BUNDLE THEMES =====

  // Midnight Pro - matches VS Code Dark
  'Midnight Pro': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #1e1e1e; color: #d4d4d4; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #3c3c3c; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #569cd6; }
    .prose-styles a { color: #4ec9b0; }
    .prose-styles blockquote { color: #9cdcfe; border-color: #007acc; background-color: #252526; }
    .prose-styles code:not(pre > code) { background-color: #252526; color: #ce9178; font-family: 'Fira Code', Consolas, monospace; }
    .prose-styles pre { background-color: #1e1e1e; border: 1px solid #3c3c3c; }
    .prose-styles pre code { font-family: 'Fira Code', Consolas, monospace; }
    .prose-styles th { background-color: #252526; }
    .prose-styles li::marker { color: #007acc; }
  `,

  // GitHub Dark - matches GitHub Dark theme
  'GitHub Dark': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0d1117; color: #c9d1d9; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #30363d; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #f0f6fc; }
    .prose-styles a { color: #58a6ff; }
    .prose-styles blockquote { color: #8b949e; border-color: #58a6ff; background-color: #161b22; }
    .prose-styles code:not(pre > code) { background-color: rgba(110,118,129,0.4); color: #c9d1d9; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #161b22; border: 1px solid #30363d; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #161b22; }
    .prose-styles li::marker { color: #58a6ff; }
  `,

  // Nord - matches Nord theme
  'Nord': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #2e3440; color: #d8dee9; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #4c566a; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #88c0d0; }
    .prose-styles a { color: #81a1c1; }
    .prose-styles blockquote { color: #d8dee9; border-color: #5e81ac; background-color: #3b4252; }
    .prose-styles code:not(pre > code) { background-color: #3b4252; color: #a3be8c; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #3b4252; border: 1px solid #4c566a; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #3b4252; }
    .prose-styles li::marker { color: #88c0d0; }
  `,

  // Dracula - matches Dracula theme
  'Dracula': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #282a36; color: #f8f8f2; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #44475a; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #bd93f9; }
    .prose-styles a { color: #8be9fd; }
    .prose-styles blockquote { color: #f8f8f2; border-color: #ff79c6; background-color: #44475a; }
    .prose-styles code:not(pre > code) { background-color: #44475a; color: #50fa7b; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #1e1f29; border: 1px solid #44475a; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #44475a; }
    .prose-styles li::marker { color: #ff79c6; }
  `,

  // ===== LIGHT BUNDLE THEMES =====

  // Classic Paper - clean white theme matching BBEdit
  'Classic Paper': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #ffffff; color: #333333; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #e0e0e0; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #1a1a1a; font-weight: 700; }
    .prose-styles a { color: #0066cc; }
    .prose-styles blockquote { color: #555555; border-color: #0066cc; background-color: #f5f5f5; }
    .prose-styles code:not(pre > code) { background-color: #f0f0f0; color: #333333; font-family: 'Fira Code', monospace; border: 1px solid #e0e0e0; }
    .prose-styles pre { background-color: #f5f5f5; border: 1px solid #e0e0e0; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #f5f5f5; }
    .prose-styles li::marker { color: #0066cc; }
  `,

  // GitHub Light - matches GitHub Light theme
  'GitHub Light': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #ffffff; color: #24292f; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #d0d7de; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #1f2328; font-weight: 600; }
    .prose-styles a { color: #0969da; }
    .prose-styles blockquote { color: #57606a; border-color: #0969da; background-color: #f6f8fa; }
    .prose-styles code:not(pre > code) { background-color: rgba(175,184,193,0.2); color: #24292f; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #f6f8fa; border: 1px solid #d0d7de; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #f6f8fa; }
    .prose-styles li::marker { color: #0969da; }
  `,

  // Solarized - matches Solarized Light theme
  'Solarized': baseStyles + `
    .prose-styles { font-family: 'Georgia', serif; background-color: #fdf6e3; color: #657b83; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #eee8d5; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #073642; font-weight: 700; }
    .prose-styles a { color: #268bd2; }
    .prose-styles blockquote { color: #93a1a1; border-color: #2aa198; background-color: #eee8d5; }
    .prose-styles code:not(pre > code) { background-color: #eee8d5; color: #cb4b16; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #eee8d5; border: 1px solid #ddd8c5; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #eee8d5; }
    .prose-styles li::marker { color: #2aa198; }
  `,

  // Ocean Breeze - matches Material Light theme
  'Ocean Breeze': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #fafafa; color: #546e7a; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #cfd8dc; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #37474f; font-weight: 600; }
    .prose-styles a { color: #0288d1; }
    .prose-styles blockquote { color: #78909c; border-color: #0288d1; background-color: #eceff1; }
    .prose-styles code:not(pre > code) { background-color: #eceff1; color: #546e7a; font-family: 'Fira Code', monospace; border: 1px solid #cfd8dc; }
    .prose-styles pre { background-color: #eceff1; border: 1px solid #cfd8dc; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #eceff1; }
    .prose-styles li::marker { color: #0288d1; }
  `,

  // ===== LEGACY THEMES (for backwards compatibility) =====

  'Default': baseStyles + `
    .prose-styles { background-color: #1e293b; color: #cbd5e1; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #475569; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: white; }
    .prose-styles a { color: #22d3ee; }
    .prose-styles blockquote { border-color: #67e8f9; color: #94a3b8; }
    .prose-styles code:not(pre > code) { background-color: #334155; color: #e2e8f0; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #0f172a; }
    .prose-styles th { background-color: #334155; }
  `,
  'Terminal': baseStyles + `
    .prose-styles { font-family: 'Fira Code', monospace; background-color: #0D1117; color: #c9d1d9; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #30363d; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #38bdf8; }
    .prose-styles a { color: #60a5fa; }
    .prose-styles blockquote { color: #8b949e; border-color: #4ade80; }
    .prose-styles code:not(pre > code) { background-color: rgba(110,118,129,0.4); color: #c9d1d9; }
    .prose-styles pre { background-color: #161b22; border: 1px solid #30363d; }
    .prose-styles th { background-color: #161b22; }
    .prose-styles li::marker { color: #4ade80; }
  `,
  'Sunset': baseStyles + `
    .prose-styles { font-family: sans-serif; background-color: #2a2734; color: #d5ced9; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #555160; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #ffc69d; }
    .prose-styles a { color: #ffae8a; }
    .prose-styles blockquote { color: #bca0d3; border-color: #bca0d3; background-color: #3e3a4a; }
    .prose-styles code:not(pre > code) { background-color: #3e3a4a; color: #ffc69d; }
    .prose-styles pre { background-color: #222029; }
    .prose-styles th { background-color: #3e3a4a; }
  `,
  'Paper': baseStyles + `
    .prose-styles { font-family: 'Merriweather', serif; background-color: #fdfaf4; color: #3a3a3a; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #e0e0e0; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #1a1a1a; font-weight: 700; }
    .prose-styles a { color: #d95f02; }
    .prose-styles blockquote { color: #666; border-color: #ccc; background-color: #f7f7f7; }
    .prose-styles code:not(pre > code) { background-color: #eee; color: #3a3a3a; font-family: 'Fira Code', monospace; border: 1px solid #ddd; }
    .prose-styles pre { background-color: #f3f3f3; border: 1px solid #ddd; }
    .prose-styles pre code { background: transparent; font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #efefef; }
  `,
  'GitHub': baseStyles + `
    .prose-styles { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0d1117; color: #c9d1d9; }
    .prose-styles h1, .prose-styles h2, .prose-styles th, .prose-styles td, .prose-styles hr { border-color: #30363d; }
    .prose-styles h1, .prose-styles h2, .prose-styles h3 { color: #f0f6fc; }
    .prose-styles a { color: #58a6ff; }
    .prose-styles blockquote { color: #8b949e; border-color: #3b5070; background-color: #161b22; }
    .prose-styles code:not(pre > code) { background-color: rgba(110,118,129,0.4); color: #c9d1d9; font-family: 'Fira Code', monospace; }
    .prose-styles pre { background-color: #161b22; border: 1px solid #30363d; }
    .prose-styles pre code { font-family: 'Fira Code', monospace; }
    .prose-styles th { background-color: #161b22; }
    .prose-styles li::marker { color: #58a6ff; }
  `
};
