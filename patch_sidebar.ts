import fs from 'fs';

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add Sun/Moon icons to lucide-react import
content = content.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, (match, group) => {
  if (!group.includes('Sun')) {
    return `import { ${group}, Sun, Moon } from 'lucide-react';`;
  }
  return match;
});

const themeToggleCode = `
        <button
          onClick={() => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', current);
          }}
          className={\`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700\`}
          title={!isExpanded ? "Toggle Theme" : undefined}
        >
          <Sun className="w-4 h-4 hidden dark:block" />
          <Moon className="w-4 h-4 block dark:hidden" />
          {isExpanded && <span>Toggle Theme</span>}
        </button>
        <button
`;

content = content.replace(/<button\s*onClick=\{onRunBatchScan\}/, themeToggleCode + '          onClick={onRunBatchScan}');

fs.writeFileSync('src/components/Sidebar.tsx', content);
