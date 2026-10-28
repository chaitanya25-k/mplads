import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, User, MapPin, Clock, UploadCloud, FolderKanban } from 'lucide-react';

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([
    { id: 'L-101', type: 'FILE_UPLOAD', action: 'Uploaded CSV', entity: 'Maharashtra_Works_Q3.csv', user: 'Admin (State Nodal)', location: 'Mumbai, MH', timestamp: '2026-08-28T09:12:00Z' },
    { id: 'L-102', type: 'WORK_ADD', action: 'Added Work Item', entity: 'Solar Mast (W-10892)', user: 'District Magistrate', location: 'Pune, MH', timestamp: '2026-08-28T08:45:00Z' },
    { id: 'L-103', type: 'FILE_UPLOAD', action: 'Uploaded JSON', entity: 'Calamity_Relief_2024.json', user: 'DIID System', location: 'New Delhi, DL', timestamp: '2026-08-27T14:30:00Z' },
    { id: 'L-104', type: 'DATA_SYNC', action: 'Synced with SNA SPARSH', entity: 'Financial Disbursements', user: 'System Worker', location: 'Server Core', timestamp: '2026-08-27T02:00:00Z' },
  ]);
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


  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-50 flex items-center">
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


      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Log ID</th>
                <th className="px-4 py-3 font-medium">Action & Entity</th>
                <th className="px-4 py-3 font-medium">User / Actor</th>
                <th className="px-4 py-3 font-medium">Location / Source</th>
                <th className="px-4 py-3 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {log.type === 'FILE_UPLOAD' ? <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> : 
                       log.type === 'WORK_ADD' ? <FolderKanban className="w-4 h-4 text-amber-400" /> :
                       <Database className="w-4 h-4 text-indigo-400" />}
                      
                      <div>
                        <p className="font-medium text-slate-200">{log.action}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-slate-400">{log.entity}</p>
                          {log.type === 'FILE_UPLOAD' && (
                            <button onClick={() => handleDownload(log.entity)} className="text-indigo-400 hover:text-indigo-300 text-xs ml-2 underline">Download</button>
                          )}
                        </div>
                      </div>

                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5 text-slate-400 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
