import fs from 'fs';

let content = fs.readFileSync('src/components/DatasetManager.tsx', 'utf8');

const replacement = `
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Paste Raw CSV Records or Upload File
              </label>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs ml-4 border border-slate-700">
                Browse File
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setCsvText(event.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
`;

content = content.replace(/<label className="text-xs font-bold uppercase tracking-wider text-slate-300">\s*Paste Raw CSV Records or Type Custom Test Rows\s*<\/label>/, replacement);

fs.writeFileSync('src/components/DatasetManager.tsx', content);
