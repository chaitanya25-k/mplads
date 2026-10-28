import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/import express\r?\nimport OpenAI from "openai"; from "express";/g, 'import express from "express";\nimport OpenAI from "openai";');
fs.writeFileSync('server.ts', content);
