// Prueba de punta a punta del servidor compilado (npm run build antes).
// Levanta el servidor con una base temporal y lo recorre como lo haria la app.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = mkdtempSync(path.join(tmpdir(), 'iw-admin-test-'));
const PORT = 3900 + Math.floor(Math.random() * 90);
const BASE = `http://127.0.0.1:${PORT}`;
const PASSWORD = 'prueba-segura-123';
let server;
let cookie = '';

async function call(method, url, body, { csrf = true, auth = true, ip } = {}) {
  const headers = {};
  if (ip) headers['X-Real-IP'] = ip;
  if (csrf) headers['X-IW-Admin'] = '1';
  if (auth && cookie) headers.Cookie = cookie;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + '/admin/api' + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const setCookie = res.headers.get('set-cookie');
  const type = res.headers.get('content-type') ?? '';
  const data = type.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data, setCookie, headers: res.headers };
}

/** Indice de direcciones minimo con el mismo esquema que scripts/build_geo.py. */
function buildTinyGeo() {
  const geo = new Database(path.join(dataDir, 'geo.db'));
  geo.exec(`
    CREATE TABLE addr (id INTEGER PRIMARY KEY, num INTEGER, num_text TEXT, street TEXT, street2 TEXT, city TEXT, zip TEXT, county TEXT);
    CREATE TABLE zips (zip TEXT PRIMARY KEY, city TEXT, state TEXT);
    CREATE TABLE cities (name TEXT, state TEXT, norm TEXT, zips INTEGER, PRIMARY KEY (state, name));
    INSERT INTO addr VALUES (1, 3940, '3940', 'METRO PKWY', 'METRO PKWY', 'FORT MYERS', '33916', 'Lee');
    INSERT INTO addr VALUES (2, 1420, '1420', 'SE 8TH TER', '8TH TER', 'CAPE CORAL', '33990', 'Lee');
    INSERT INTO addr VALUES (3, 1420, '1420', 'SE 8TH ST', '8TH ST', 'CAPE CORAL', '33990', 'Lee');
    INSERT INTO addr VALUES (4, 3950, '3950', 'METRO PKWY', 'METRO PKWY', 'FORT MYERS', '33916', 'Lee');
    INSERT INTO zips VALUES ('33990', 'Cape Coral', 'FL'), ('10001', 'New York', 'NY');
    INSERT INTO cities VALUES ('Cape Coral', 'FL', 'CAPE CORAL', 8), ('Cape Charles', 'VA', 'CAPE CHARLES', 1);
  `);
  geo.close();
}

before(async () => {
  buildTinyGeo();
  const env = { ...process.env, DATA_DIR: dataDir, PORT: String(PORT), PASSWORD };
  execFileSync('node', ['dist/server/cli.js', 'crear', 'papa', 'Papá Albornoz'], { cwd: root, env });
  server = spawn('node', ['dist/server/index.js'], { cwd: root, env, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(BASE + '/healthz')).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('el servidor no arranco');
});

after(() => {
  server?.kill();
  rmSync(dataDir, { recursive: true, force: true });
});

test('sin sesion no hay datos', async () => {
  const r = await call('GET', '/bootstrap');
  assert.equal(r.status, 401);
});

test('login: rechaza sin cabecera anti-CSRF y con clave mala', async () => {
  assert.equal((await call('POST', '/auth/login', { username: 'papa', password: PASSWORD }, { csrf: false })).status, 403);
  assert.equal((await call('POST', '/auth/login', { username: 'papa', password: 'mala' })).status, 401);
  assert.equal((await call('POST', '/auth/login', { username: 'nadie', password: 'mala' })).status, 401);
});

test('login correcto: cookie HttpOnly, SameSite=Strict, Path=/admin', async () => {
  const r = await call('POST', '/auth/login', { username: 'PAPA', password: PASSWORD });
  assert.equal(r.status, 200);
  assert.match(r.setCookie, /HttpOnly/);
  assert.match(r.setCookie, /SameSite=Strict/);
  assert.match(r.setCookie, /Path=\/admin/);
  cookie = r.setCookie.split(';')[0];
  const boot = await call('GET', '/bootstrap');
  assert.equal(boot.status, 200);
  assert.equal(boot.data.me.name, 'Papá Albornoz');
  assert.equal(boot.headers.get('cache-control'), 'no-store');
});

let saleId;
let clientId;
let financierId;
let supplierId;
let sellerId;

test('venta nueva con cliente nuevo, financiera, proveedores y comision', async () => {
  financierId = (await call('POST', '/financiers', { name: 'Financiera Uno' })).data.item.id;
  supplierId = (await call('POST', '/suppliers', { name: 'Proveedor A' })).data.item.id;
  sellerId = (await call('POST', '/people', { name: 'Angie', phone: null, isSeller: true, isInstaller: false })).data.person.id;
  const installerId = (await call('POST', '/people', { name: 'Carlos', phone: null, isSeller: false, isInstaller: true })).data.person.id;

  const r = await call('POST', '/sales', {
    client: { create: { name: 'María Pérez', phone: '(239) 555-1234', city: 'Cape Coral', address: '123 SW 1st St', zip: '33990', language: 'es' } },
    saleDate: '2026-11-20',
    installDate: '2026-11-22',
    installerId,
    waterSource: 'well',
    equipment: { outdoorTanks: 3, aerator: true, wholeHouseRo: 2, ro: true, roType: 'five_stage', roUv: true, other: null },
    price: 1_200_000,
    paymentMethod: 'financed',
    financierId,
    cashDown: 50_000,
    fundedAmount: 1_000_000,
    fundedPaid: false,
    sellerId,
    commission: 120_000,
    suppliers: [{ supplierId, cost: 350_000 }],
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  saleId = r.data.sale.id;
  clientId = r.data.sale.clientId;
  assert.equal(r.data.sale.equipment.outdoorTanks, 3);
  assert.equal(r.data.sale.equipment.roUv, true);
  assert.equal(r.data.sale.equipment.wholeHouseRo, 2);
  assert.equal(r.data.sale.createdBy, 'Papá Albornoz');
  assert.deepEqual(r.data.sale.suppliers, [{ supplierId, cost: 350_000 }]);
});

test('validacion: proveedor repetido, fecha mala y monto negativo', async () => {
  const bad = (extra) =>
    call('POST', '/sales', {
      client: { id: clientId },
      saleDate: '2026-11-20',
      equipment: { outdoorTanks: 0, aerator: false, ro: false, roType: null, roUv: false, other: null },
      ...extra,
    });
  assert.equal((await bad({ suppliers: [{ supplierId, cost: 1 }, { supplierId, cost: 2 }] })).status, 400);
  assert.equal((await bad({ saleDate: '20/11/2026' })).status, 400);
  const neg = await bad({ price: -5 });
  assert.equal(neg.status, 400);
  assert.match(neg.data.error, /negativo/);
});

test('venta anterior (ponerse al dia) con solo cliente y fecha', async () => {
  const r = await call('POST', '/sales', {
    client: { create: { name: 'José Antiguo' } },
    saleDate: '2024-03-10',
    equipment: { outdoorTanks: 2, aerator: false, ro: false, roType: null, roUv: false, other: null },
    isLegacy: true,
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.sale.isLegacy, true);
  assert.equal(r.data.sale.price, null);
});

test('marcar pago de la financiera y comision', async () => {
  const a = await call('POST', `/sales/${saleId}/mark`, { field: 'fundedPaid', paid: true, date: '2026-11-21' });
  assert.equal(a.data.sale.fundedPaid, true);
  assert.equal(a.data.sale.fundedDate, '2026-11-21');
  const b = await call('POST', `/sales/${saleId}/mark`, { field: 'commissionPaid', paid: true, date: '2026-11-21' });
  assert.equal(b.data.sale.commissionPaid, true);
});

test('servicio tecnico: cobrado, ligado a la venta y fija el proximo mantenimiento', async () => {
  const r = await call('POST', '/services', {
    client: { id: clientId },
    saleId,
    reportedDate: '2026-11-21',
    kind: 'problem',
    problem: 'El agua huele a azufre otra vez',
    billing: 'charged',
    amount: 8_500,
    status: 'closed',
    closedDate: '2026-11-21',
    nextServiceDate: '2027-05-21',
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.service.amount, 8_500);
  const boot = await call('GET', '/bootstrap');
  assert.equal(boot.data.sales.find((s) => s.id === saleId).nextServiceDate, '2027-05-21');
});

test('servicio con venta de otro cliente se rechaza', async () => {
  const other = await call('POST', '/clients', { name: 'Otro Cliente' });
  const r = await call('POST', '/services', { client: { id: other.data.client.id }, saleId, reportedDate: '2026-11-21', problem: 'x' });
  assert.equal(r.status, 400);
});

test('no se borra una financiera o un proveedor en uso', async () => {
  assert.equal((await call('DELETE', `/financiers/${financierId}`)).status, 409);
  assert.equal((await call('DELETE', `/suppliers/${supplierId}`)).status, 409);
  assert.equal((await call('DELETE', `/people/${sellerId}`)).status, 409);
  assert.equal((await call('POST', '/financiers', { name: 'financiera uno' })).status, 409); // nombre repetido
});

test('exportar CSV con BOM y sin formulas peligrosas', async () => {
  await call('POST', '/clients', { name: '=HYPERLINK("http://x")' });
  // fetch().text() quita el BOM al decodificar: se revisan los bytes.
  const raw = await fetch(BASE + '/admin/api/export/sales', { headers: { Cookie: cookie } });
  assert.deepEqual([...new Uint8Array(await raw.arrayBuffer()).subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  const sales = await call('GET', '/export/sales');
  assert.equal(sales.status, 200);
  assert.match(sales.data, /María Pérez/);
  assert.match(sales.data, /3 filtros fuera de casa \+ aireador · Ósmosis de toda la casa \(2 membranas\)/);
  const clients = await call('GET', '/export/clients');
  assert.match(clients.data, /'=HYPERLINK/);
});

test('respaldo descargable', async () => {
  const res = await fetch(BASE + '/admin/api/backup', { headers: { Cookie: cookie } });
  assert.equal(res.status, 200);
  const buf = Buffer.from(await res.arrayBuffer());
  assert.equal(buf.subarray(0, 15).toString(), 'SQLite format 3');
});

test('fechas imposibles, abono mayor que el precio e instalacion antes de la venta se rechazan', async () => {
  const base = { client: { id: clientId }, equipment: { outdoorTanks: 0, aerator: false, ro: false, roType: null, roUv: false, other: null } };
  assert.equal((await call('POST', '/sales', { ...base, saleDate: '2026-02-31' })).status, 400);
  const over = await call('POST', '/sales', { ...base, saleDate: '2026-11-20', price: 100_000, paymentMethod: 'financed', cashDown: 200_000 });
  assert.equal(over.status, 400);
  assert.match(over.data.error, /abono/i);
  assert.equal((await call('POST', '/sales', { ...base, saleDate: '2026-11-20', installDate: '2026-11-01' })).status, 400);
});

test('edicion simultanea: el segundo guardado recibe 409', async () => {
  const current = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === saleId);
  const { id, createdAt, updatedAt, createdBy, updatedBy, clientId: cid, ...rest } = current;
  await call('POST', `/sales/${saleId}/mark`, { field: 'commissionPaid', paid: false, date: null }); // otra persona cambia algo
  const stale = await call('PUT', `/sales/${saleId}`, { ...rest, client: { id: cid }, expectedUpdatedAt: updatedAt });
  assert.equal(stale.status, 409);
});

test('mover una venta a otro cliente lleva sus servicios con ella', async () => {
  const other = (await call('POST', '/clients', { name: 'Cliente Destino' })).data.client;
  const current = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === saleId);
  const { id, createdAt, updatedAt, createdBy, updatedBy, clientId: cid, ...rest } = current;
  const moved = await call('PUT', `/sales/${saleId}`, { ...rest, client: { id: other.id }, expectedUpdatedAt: updatedAt });
  assert.equal(moved.status, 200, JSON.stringify(moved.data));
  const services = (await call('GET', '/bootstrap')).data.services.filter((s) => s.saleId === saleId);
  assert.ok(services.length > 0);
  assert.ok(services.every((s) => s.clientId === other.id));
});

test('autocompletado local: direcciones, ciudades y ZIP', async () => {
  const s = 'test-session-123';
  const boot = await call('GET', '/bootstrap');
  assert.equal(boot.data.features.places, true);
  const a = await call('GET', `/places/autocomplete?q=${encodeURIComponent('3940 metro parkway')}&s=${s}`);
  assert.equal(a.data.suggestions[0].main, '3940 Metro Pkwy');
  assert.deepEqual(a.data.suggestions[0].place, { address: '3940 Metro Pkwy', city: 'Fort Myers', state: 'FL', zip: '33916' });
  // Palabras completas, sin el punto cardinal y con la ciudad al final.
  const b = await call('GET', `/places/autocomplete?q=${encodeURIComponent('1420 8th terrace cape')}&s=${s}`);
  assert.equal(b.data.suggestions.length, 1);
  assert.equal(b.data.suggestions[0].main, '1420 SE 8th Ter');
  // "8" sin "th" y "te" parcial.
  const p2 = await call('GET', `/places/autocomplete?q=${encodeURIComponent('1420 se 8 te')}&s=${s}`);
  assert.equal(p2.data.suggestions[0].main, '1420 SE 8th Ter');
  // Solo la calle: sugiere la calle con su ciudad.
  const st = await call('GET', `/places/autocomplete?q=${encodeURIComponent('metro pkwy')}&s=${s}`);
  assert.equal(st.data.suggestions[0].kind, 'street');
  assert.equal(st.data.suggestions[0].main, 'Metro Pkwy');
  assert.equal(st.data.suggestions[0].place.city, 'Fort Myers');
  const c = await call('GET', `/places/cities?q=cape&s=${s}`);
  assert.equal(c.data.cities[0].city, 'Cape Coral');
  assert.equal(c.data.cities[0].state, 'FL');
  const z = await call('GET', `/places/zip?zip=10001&s=${s}`);
  assert.deepEqual(z.data.place, { city: 'New York', state: 'NY' });
  const d = await call('GET', `/places/detail?id=fl-2&s=${s}`);
  assert.equal(d.data.place.zip, '33990');
});

test('marcar por lote: todo o nada', async () => {
  const sales = (await call('GET', '/bootstrap')).data.sales;
  const financed = sales.filter((s) => s.paymentMethod === 'financed').map((s) => s.id);
  const notFinanced = sales.filter((s) => s.paymentMethod !== 'financed').map((s) => s.id);
  // Mezclar una venta que no es financiada hace fallar el lote completo.
  if (notFinanced.length) {
    const bad = await call('POST', '/sales/mark-batch', { ids: [...financed, notFinanced[0]], field: 'fundedPaid', paid: false, date: null });
    assert.equal(bad.status, 409);
  }
  const ok = await call('POST', '/sales/mark-batch', { ids: financed, field: 'fundedPaid', paid: true, date: '2026-11-21' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.updated, financed.length);
  const after = (await call('GET', '/bootstrap')).data.sales.filter((s) => financed.includes(s.id));
  assert.ok(after.every((s) => s.fundedPaid && s.fundedDate === '2026-11-21'));
});

test('validaciones: telefono, ZIP, comision y servicio cobrado sin monto', async () => {
  assert.equal((await call('POST', '/clients', { name: 'X', phone: '12' })).status, 400);
  assert.equal((await call('POST', '/clients', { name: 'X', zip: '339' })).status, 400);
  assert.equal((await call('POST', '/clients', { name: 'Y', phone: '(239) 555-0100', zip: '33990' })).status, 200);
  const base = { client: { id: clientId }, saleDate: '2026-11-20', equipment: { outdoorTanks: 0, aerator: false, ro: false, roType: null, roUv: false, other: null } };
  const c = await call('POST', '/sales', { ...base, price: 100_000, commission: 200_000 });
  assert.equal(c.status, 400);
  assert.match(c.data.error, /comisión/);
  assert.equal(c.data.field, 'commission'); // la app lleva al usuario a ese campo
  const ph = await call('POST', '/sales', { ...base, client: { create: { name: 'Z', phone: '12' } } });
  assert.equal(ph.data.field, 'client.create.phone');
  const sv = await call('POST', '/services', { client: { id: clientId }, reportedDate: '2026-11-21', problem: 'x', billing: 'charged' });
  assert.equal(sv.status, 400);
  const closed = await call('POST', '/services', { client: { id: clientId }, reportedDate: '2026-11-21', problem: 'x', status: 'closed', closedDate: '2026-11-01' });
  assert.equal(closed.status, 400);
});

test('url mal codificada responde 400, no 500', async () => {
  assert.equal((await fetch(BASE + '/admin/%E0%A4%A')).status, 400);
});

test('archivos: la app, rutas internas, 404 de assets y sin salir de la carpeta', async () => {
  const page = await fetch(BASE + '/admin/ventas/12');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<div id="root">/);
  assert.match(page.headers.get('x-robots-tag'), /noindex/);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal((await fetch(BASE + '/admin/assets/no-existe.js')).status, 404);
  assert.equal((await fetch(BASE + '/admin/..%2f..%2fpackage.json')).status, 404);
  assert.equal((await fetch(BASE + '/otra-cosa')).status, 404);
});

test('cerrar sesion invalida la cookie', async () => {
  await call('POST', '/auth/logout');
  assert.equal((await call('GET', '/bootstrap')).status, 401);
});

test('limite de intentos de acceso: bloquea al atacante, no al dueno', async () => {
  let last;
  for (let i = 0; i < 8; i++) last = await call('POST', '/auth/login', { username: 'papa', password: 'mala' + i }, { auth: false, ip: '203.0.113.9' });
  assert.equal(last.status, 429);
  // El dueno, desde su propia conexion, sigue pudiendo entrar.
  const owner = await call('POST', '/auth/login', { username: 'papa', password: PASSWORD }, { auth: false, ip: '198.51.100.7' });
  assert.equal(owner.status, 200);
});

test('borrar-datos deja el sistema en cero y conserva los usuarios', async () => {
  server.kill();
  await new Promise((r) => setTimeout(r, 300));
  const env = { ...process.env, DATA_DIR: dataDir };
  assert.throws(() => execFileSync('node', ['dist/server/cli.js', 'borrar-datos'], { cwd: root, env, stdio: 'pipe' }));
  const out = execFileSync('node', ['dist/server/cli.js', 'borrar-datos', '--confirmar'], { cwd: root, env }).toString();
  assert.match(out, /Datos borrados: \d+ clientes/);
  const users = execFileSync('node', ['dist/server/cli.js', 'lista'], { cwd: root, env }).toString();
  assert.match(users, /papa/);
});
