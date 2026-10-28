import fs from 'fs';

let content = fs.readFileSync('src/components/AnomalyHub.tsx', 'utf8');

content = content.replace(/anm\.evidence\./g, 'anm.evidence?.');

fs.writeFileSync('src/components/AnomalyHub.tsx', content);
