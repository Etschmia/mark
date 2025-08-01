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
    .prose-styles pre code { background: transparent; font-family: 'Fira Code', monospace; color: #3a3a3a; }
    .prose-styles th { background-color: #efefef; }
  `
};