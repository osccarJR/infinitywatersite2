// Desarrollo: API (con recarga) + Vite. Abre http://localhost:5173/admin/
import { spawn } from 'node:child_process';

const run = (cmd, args) => spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, DATA_DIR: process.env.DATA_DIR ?? 'data' } });
const children = [run('node', ['--watch', 'server/index.ts']), run('npx', ['vite'])];
const stop = () => children.forEach((child) => child.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
