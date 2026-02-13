// Vercel Serverless Function Handler
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Vercel Function Starting ===');
console.log('Current directory:', __dirname);
console.log('Process cwd:', process.cwd());

// 현재 디렉토리 내용 확인
try {
  const parentDir = join(__dirname, '..');
  console.log('Parent directory:', parentDir);
  console.log('Parent directory contents:', readdirSync(parentDir));
} catch (error) {
  console.error('Error reading parent directory:', error);
}

// 빌드 디렉토리 경로 확인
const buildPath = join(__dirname, '..', 'build', 'index.js');
console.log('Build path:', buildPath);
console.log('Build exists:', existsSync(buildPath));

if (!existsSync(buildPath)) {
  console.error('Build file not found!');
  throw new Error(`Build file not found at ${buildPath}. Make sure to run 'npm run build' before deploying.`);
}

console.log('Importing app from build directory...');
const { default: app } = await import(buildPath);
console.log('App imported successfully');

export default app;
