import fs from 'fs';

let content = fs.readFileSync('src/components/AuditLog.tsx', 'utf8');

const searchState = `
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDownload = (entity: string) => {
    const csvContent = "data:text/csv;charset=utf-8,Dummy,Data,For," + entity;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", entity);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

content = content.replace(/const \[logs, setLogs\] = useState<any\[\]>\(\[[\s\S]*?\]\);/, (match) => match + searchState);

const searchBarHtml = `
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Database className="w-6 h-6 mr-2 text-indigo-400" />
            Audit & Ingestion Log
          </h2>
          <p className="text-sm text-slate-400">Track all uploaded files, added work items, and system data ingestion events.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
`;

content = content.replace(/<div className="flex items-center justify-between">[\s\S]*?<\/div>\s*<\/div>/, searchBarHtml);

content = content.replace(/logs\.map\(log => \(/, "filteredLogs.map(log => (");

const downloadBtnHtml = `
                      <div>
                        <p className="font-medium text-slate-200">{log.action}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-slate-400">{log.entity}</p>
                          {log.type === 'FILE_UPLOAD' && (
                            <button onClick={() => handleDownload(log.entity)} className="text-indigo-400 hover:text-indigo-300 text-xs ml-2 underline">Download</button>
                          )}
                        </div>
                      </div>
`;

content = content.replace(/<div>\s*<p className="font-medium text-slate-200">{log\.action}<\/p>\s*<p className="text-xs text-slate-400">{log\.entity}<\/p>\s*<\/div>/, downloadBtnHtml);

fs.writeFileSync('src/components/AuditLog.tsx', content);
