/**
 * Genera las imagenes de vista previa (Open Graph) que salen al compartir un
 * enlace por WhatsApp, Facebook, Messenger o SMS.
 *
 *   node scripts/og-images.mjs
 *
 * Renderiza cada tarjeta (1200x630) con Chrome sin interfaz, usando la misma
 * tipografia del sitio (Inter), y la guarda en public/images/og-*.jpg.
 * Requiere Google Chrome instalado (ruta de macOS; cambiar CHROME si hace falta).
 *
 * Nombres nuevos a proposito: WhatsApp y Cloudflare cachean las imagenes por
 * URL, asi que un cambio de diseno debe ir con nombre nuevo (o ?v=).
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const font = readFileSync(path.join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64');
const logo = readFileSync(path.join(root, 'public/images/logo.webp')).toString('base64');

const WATER = {
  clear: { top: '#d8f3ff', bottom: '#0c8fd6', glow: '22 179 212' },
  sulfur: { top: '#e6df93', bottom: '#9f9a3e', glow: '184 176 74' },
  iron: { top: '#f0a060', bottom: '#8c3a12', glow: '194 88 31' },
};

const CARDS = [
  { file: 'og-es.jpg', lang: 'es', water: 'clear', a: '¿Tu agua huele, mancha o sabe mal?', b: 'Tiene solución.', sub: 'Análisis de agua gratis en tu casa, en español.' },
  { file: 'og-en.jpg', lang: 'en', water: 'clear', a: 'Does your water smell, stain or taste off?', b: 'There’s a fix.', sub: 'Free in-home water test. English or Spanish.' },
  { file: 'og-smell-es.jpg', lang: 'es', water: 'sulfur', a: '¿Tu pozo huele a huevo podrido?', b: 'Es azufre. Tiene solución.', sub: 'Lo medimos gratis en tu casa, en español.' },
  { file: 'og-smell-en.jpg', lang: 'en', water: 'sulfur', a: 'Does your well smell like rotten eggs?', b: 'It’s sulfur. It’s fixable.', sub: 'We test it free at your home.' },
  { file: 'og-iron-es.jpg', lang: 'es', water: 'iron', a: '¿Manchas naranjas en la ropa y el baño?', b: 'Es hierro. Tiene solución.', sub: 'Lo medimos gratis en tu casa, en español.' },
  { file: 'og-iron-en.jpg', lang: 'en', water: 'iron', a: 'Orange stains on clothes and tubs?', b: 'It’s iron. It’s fixable.', sub: 'We test it free at your home.' },
  { file: 'og-prices-es.jpg', lang: 'es', water: 'clear', a: '¿Cuánto cuesta tratar el agua?', b: 'Guía de precios 2026.', sub: 'Rangos reales del mercado en Florida.' },
  { file: 'og-prices-en.jpg', lang: 'en', water: 'clear', a: 'What does water treatment cost?', b: '2026 price guide.', sub: 'Real market ranges in Florida.' },
];

const glass = (w) => `
<svg viewBox="0 -95 300 565" width="330" height="620" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.top}" stop-opacity=".92"/><stop offset="1" stop-color="${w.bottom}"/></linearGradient>
    <radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgb(${w.glow})" stop-opacity=".6"/><stop offset="1" stop-color="rgb(${w.glow})" stop-opacity="0"/></radialGradient>
    <linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="c"><path d="M47 112 L66 378 Q68 392 86 392 L214 392 Q232 392 234 378 L253 112 Z"/></clipPath>
  </defs>
  <ellipse cx="150" cy="420" rx="150" ry="42" fill="url(#g)"/>
  <g clip-path="url(#c)"><path d="M47 112 L66 378 Q68 392 86 392 L214 392 Q232 392 234 378 L253 112 Z" fill="url(#w)"/>
    <rect x="70" y="112" width="26" height="280" fill="url(#s)" opacity=".5"/>
    <circle cx="120" cy="300" r="4" fill="#fff" opacity=".6"/><circle cx="170" cy="250" r="3" fill="#fff" opacity=".6"/><circle cx="150" cy="340" r="2.5" fill="#fff" opacity=".6"/></g>
  <ellipse cx="150" cy="112" rx="103" ry="9" fill="${w.top}"/>
  <path d="M40 20 L65 380 Q67 400 87 400 L213 400 Q233 400 235 380 L260 20" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>
  <ellipse cx="150" cy="20" rx="110" ry="10" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>
  <path d="M58 40 L78 360" stroke="rgba(255,255,255,.45)" stroke-width="7" stroke-linecap="round" opacity=".5"/>
</svg>`;

const html = (card) => `<!doctype html><html lang="${card.lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter, sans-serif; color: #fff;
  background: radial-gradient(55% 70% at 80% 72%, rgb(${WATER[card.water].glow} / .38), transparent 70%), #0b1726; }
.wrap { display: flex; height: 100%; padding: 64px 40px 56px 72px; }
.text { flex: 1; display: flex; flex-direction: column; }
.logo { height: 34px; width: auto; align-self: flex-start; }
h1 { margin-top: auto; font-size: 64px; line-height: 1.02; letter-spacing: -0.035em; font-weight: 700; }
.b { display: block; margin-top: 10px; background: linear-gradient(95deg, #9b7bff, #5ec2ff 70%); -webkit-background-clip: text; color: transparent; }
p { margin-top: 22px; font-size: 26px; color: rgba(255,255,255,.72); font-weight: 500; letter-spacing: -0.01em; }
.foot { margin-top: 34px; display: flex; gap: 14px; font-size: 20px; font-weight: 600; color: rgba(255,255,255,.85); }
.chip { padding: 9px 18px; border-radius: 999px; background: rgba(255,255,255,.1); }
.chip.cta { background: #0a72c2; color: #fff; }
.glass { width: 330px; display: flex; align-items: flex-end; justify-content: center; filter: drop-shadow(0 30px 50px rgba(0,0,0,.5)); }
</style></head><body><div class="wrap">
  <div class="text">
    <img class="logo" src="data:image/webp;base64,${logo}" alt="">
    <h1>${card.a}<span class="b">${card.b}</span></h1>
    <p>${card.sub}</p>
    <div class="foot"><span class="chip cta">${card.lang === 'es' ? 'Análisis gratis' : 'Free water test'}</span><span class="chip">Fort Myers · Cape Coral · Naples</span><span class="chip">(475) 685-8464</span></div>
  </div>
  <div class="glass">${glass(WATER[card.water])}</div>
</div></body></html>`;

// --- Chrome sin interfaz por el protocolo de DevTools ---
const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/og-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50 && !targets; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
for (const card of CARDS) {
  const tmp = `/tmp/og-card-${port}.html`;
  writeFileSync(tmp, html(card));
  await send('Page.navigate', { url: `file://${tmp}` });
  await sleep(700);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await sharp(Buffer.from(shot.result.data, 'base64')).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'public/images', card.file));
  console.log(`  ${card.file}`);
}
ws.close();
chrome.kill();
