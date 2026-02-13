// Vercel Serverless Function Handler
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 빌드 디렉토리 경로 확인
const buildPath = join(__dirname, '..', 'build', 'index.js');

console.log('Current directory:', __dirname);
console.log('Build path:', buildPath);
console.log('Build exists:', existsSync(buildPath));

if (!existsSync(buildPath)) {
  throw new Error(`Build file not found at ${buildPath}. Make sure to run 'npm run build' before deploying.`);
}

// 동적 import 사용
const { default: app } = await import(buildPath);

export default app;
