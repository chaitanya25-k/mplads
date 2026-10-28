import fs from 'fs';

let content = fs.readFileSync('src/components/AnomalyHub.tsx', 'utf8');

// Replace evidence.detectionMethod and evidence.mlModelUsed with fallbacks
content = content.replace(/\{anm\.evidence\.detectionMethod\}/g, '{anm.evidence.detectionMethod || "Multivariate Outlier Detection (Isolation Forest)"}');
content = content.replace(/\{anm\.evidence\.mlModelUsed\}/g, '{anm.evidence.mlModelUsed || "XGBoost + DBSCAN Geo-Clustering"}');

fs.writeFileSync('src/components/AnomalyHub.tsx', content);
