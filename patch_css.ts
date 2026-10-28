import fs from 'fs';

let css = `
@import "tailwindcss";

@theme {
  --color-slate-50: var(--slate-50);
  --color-slate-100: var(--slate-100);
  --color-slate-200: var(--slate-200);
  --color-slate-300: var(--slate-300);
  --color-slate-400: var(--slate-400);
  --color-slate-500: var(--slate-500);
  --color-slate-600: var(--slate-600);
  --color-slate-700: var(--slate-700);
  --color-slate-800: var(--slate-800);
  --color-slate-900: var(--slate-900);
  --color-slate-950: var(--slate-950);
}

:root {
  /* LIGHT THEME (White BG / Black Text) */
  --slate-950: #ffffff;
  --slate-900: #ffffff;
  --slate-800: #e5e7eb;
  --slate-700: #d1d5db;
  --slate-600: #9ca3af;
  --slate-500: #6b7280;
  --slate-400: #374151;
  --slate-300: #111827;
  --slate-200: #000000;
  --slate-100: #000000;
  --slate-50: #000000;
}

[data-theme='dark'] {
  /* DARK THEME (Black BG / White Text) */
  --slate-950: #000000;
  --slate-900: #0a0a0a;
  --slate-800: #262626;
  --slate-700: #404040;
  --slate-600: #525252;
  --slate-500: #737373;
  --slate-400: #a3a3a3;
  --slate-300: #e5e5e5;
  --slate-200: #ffffff;
  --slate-100: #ffffff;
  --slate-50: #ffffff;
}

@layer base {
  body {
    background-color: var(--slate-950);
    color: var(--slate-400);
  }
}
`;

fs.writeFileSync('src/index.css', css);
