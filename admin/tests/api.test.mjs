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

async function call(method, url, body, { csrf = true, auth = true, ip, as, viewAs } = {}) {
  const headers = {};
  if (ip) headers['X-Real-IP'] = ip;
  if (csrf) headers['X-IW-Admin'] = '1';
  if (auth && (as ?? cookie)) headers.Cookie = as ?? cookie;
  if (viewAs) headers['X-IW-View-As'] = String(viewAs);
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
  assert.equal(boot.headers.get('cache-control'), 'private, no-cache'); // se revalida siempre (ETag)
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

test('marca, estado y pago unificado al tecnico (instalaciones + servicios)', async () => {
  const boot = (await call('GET', '/bootstrap')).data;
  assert.deepEqual(boot.brands.map((b) => b.name).sort(), ['4Elements', 'Infinity Water', 'Magic Water']);
  const magic = boot.brands.find((b) => b.name === 'Magic Water').id;
  const tech = (await call('POST', '/people', { name: 'Tecnico Uno', phone: null, isSeller: false, isInstaller: true })).data.person.id;
  const sale = await call('POST', '/sales', {
    client: { id: clientId }, saleDate: '2026-11-10', brandId: magic, status: 'cancelled',
    installerId: tech, installerPay: 30_000, installDate: '2026-11-12',
    equipment: { outdoorTanks: 0, aerator: true, ro: false, roType: null, roUv: false, other: null },
  });
  assert.equal(sale.status, 200, JSON.stringify(sale.data));
  assert.equal(sale.data.sale.brandId, magic);
  assert.equal(sale.data.sale.status, 'cancelled');
  const svc = await call('POST', '/services', {
    client: { id: clientId }, reportedDate: '2026-11-15', problem: 'Cambio de filtros', billing: 'charged', amount: 15_000,
    paymentMethod: 'zelle', technicianId: tech, technicianPay: 5_000,
  });
  assert.equal(svc.status, 200, JSON.stringify(svc.data));
  assert.equal(svc.data.service.paymentMethod, 'zelle');
  const pay = await call('POST', '/tech-payments', { saleIds: [sale.data.sale.id], serviceIds: [svc.data.service.id], date: '2026-11-20' });
  assert.equal(pay.status, 200, JSON.stringify(pay.data));
  const after = (await call('GET', '/bootstrap')).data;
  assert.equal(after.sales.find((s) => s.id === sale.data.sale.id).installerPaid, true);
  assert.equal(after.services.find((v) => v.id === svc.data.service.id).technicianPaidDate, '2026-11-20');
  // Pagar de nuevo lo ya pagado se rechaza (y no borra la fecha del pago anterior).
  assert.equal((await call('POST', '/tech-payments', { saleIds: [], serviceIds: [svc.data.service.id], date: null })).status, 409);
  assert.equal((await call('GET', '/bootstrap')).data.services.find((v) => v.id === svc.data.service.id).technicianPaidDate, '2026-11-20');
  assert.equal((await call('POST', '/brands', { name: 'magic water' })).status, 409);
  assert.equal((await call('POST', '/brands', { name: 'AquaPro' })).status, 200);
});


/* ---------------------------- permisos ---------------------------- */

const EQ = { outdoorTanks: 0, aerator: false, wholeHouseRo: 0, ro: true, roType: 'box', roUv: false, other: null };
const flags = (...list) => Object.fromEntries(list.map((k) => [k, true]));
const perms = (scope, personId, list, extra = {}) => ({ scope, personId, flags: flags(...list), payableAccounts: null, ...extra });
const SELLER_FLAGS = ['clients.view', 'clients.contact', 'clients.create', 'clients.edit', 'sales.view', 'sales.create', 'sales.edit', 'services.view', 'money.prices'];
const SELLER_PERMS = perms('own', null, SELLER_FLAGS);
let sellerCookie = '';
let sellerUserId;
let techCookie = '';
let adminId;

async function loginAs(username, password) {
  const r = await call('POST', '/auth/login', { username, password }, { auth: false, ip: '192.0.2.50' });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.setCookie.split(';')[0];
}

test('permisos: crear un vendedor que solo ve lo suyo, con precios pero sin costos', async () => {
  const other = await call('POST', '/sales', { client: { create: { name: 'Cliente de otro' } }, saleDate: '2026-11-18', equipment: EQ, price: 500_000, commission: 50_000 });
  assert.equal(other.status, 200, JSON.stringify(other.data));
  const created = await call('POST', '/users', { username: 'angie', name: 'Angie', password: 'clave-angie-123', role: 'member', permissions: { ...SELLER_PERMS, personId: sellerId } });
  assert.equal(created.status, 200, JSON.stringify(created.data));
  sellerUserId = created.data.id;
  const angie = created.data.users.find((u) => u.username === 'angie');
  assert.equal(angie.role, 'member');
  assert.equal(angie.permissions.flags['payments.view'], false);
  adminId = created.data.users.find((u) => u.username === 'papa').id;
  sellerCookie = await loginAs('angie', 'clave-angie-123');

  const boot = (await call('GET', '/bootstrap', undefined, { as: sellerCookie })).data;
  assert.ok(boot.sales.length > 0);
  assert.ok(boot.sales.every((s) => s.sellerId === sellerId), 'solo sus ventas');
  assert.ok(!boot.clients.some((c) => c.name === 'Cliente de otro'), 'no ve clientes ajenos');
  const mine = boot.sales.find((s) => s.id === saleId);
  assert.equal(mine.price, 1_200_000, 've el precio');
  assert.equal(mine.fundedAmount, null, 'no ve lo que pago la financiera');
  assert.deepEqual(mine.suppliers, [], 'no ve costos de proveedores');
  assert.equal(mine.commission, 120_000, 've su propia comision');
  assert.equal(boot.me.permissions.admin, false);
  assert.deepEqual(boot.payables, []);
});

test('permisos: el servidor rechaza lo que no le toca al vendedor', async () => {
  const as = sellerCookie;
  assert.equal((await call('GET', '/users', undefined, { as })).status, 403);
  assert.equal((await call('GET', '/backup', undefined, { as })).status, 403);
  assert.equal((await call('GET', '/export/sales', undefined, { as })).status, 403);
  assert.equal((await call('POST', `/sales/${saleId}/mark`, { field: 'commissionPaid', paid: true, date: null }, { as })).status, 403);
  assert.equal((await call('DELETE', `/sales/${saleId}`, undefined, { as })).status, 403);
  assert.equal((await call('POST', '/payable-accounts', { name: 'Visa', kind: 'card' }, { as })).status, 403);
  assert.equal((await call('PUT', `/users/${adminId}`, { role: 'member' }, { as })).status, 403);
  // Una venta ajena no se puede editar ni usar su cliente.
  const boot = (await call('GET', '/bootstrap')).data;
  const foreign = boot.sales.find((s) => s.sellerId !== sellerId);
  assert.equal((await call('PUT', `/sales/${foreign.id}`, { client: { id: foreign.clientId }, saleDate: foreign.saleDate }, { as })).status, 403);
  assert.equal((await call('POST', '/sales', { client: { id: foreign.clientId }, saleDate: '2026-11-20', equipment: EQ }, { as })).status, 403);
});

test('permisos: al editar, el vendedor no borra ni cambia montos que no ve', async () => {
  const boot = (await call('GET', '/bootstrap', undefined, { as: sellerCookie })).data;
  const sale = boot.sales.find((s) => s.id === saleId);
  const paidBefore = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === saleId).commissionPaid;
  const r = await call('PUT', `/sales/${saleId}`, { ...sale, client: { id: sale.clientId }, price: 1_250_000, commission: 999_999, fundedAmount: null, suppliers: [], commissionPaid: !paidBefore, notes: 'Editada por Angie', expectedUpdatedAt: sale.updatedAt }, { as: sellerCookie });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const full = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === saleId);
  assert.equal(full.price, 1_250_000, 'el precio si lo puede cambiar');
  assert.equal(full.commission, 120_000, 'la comision queda como estaba');
  assert.equal(full.fundedAmount, 1_000_000, 'lo de la financiera queda');
  assert.deepEqual(full.suppliers, [{ supplierId, cost: 350_000 }], 'los costos quedan');
  assert.equal(full.commissionPaid, paidBefore, 'el pago de comision no lo cambia el vendedor');
  assert.equal(full.notes, 'Editada por Angie');
  // Venta nueva del vendedor: queda visible para el aunque no ponga vendedor, sin montos de costo.
  const created = await call('POST', '/sales', { client: { create: { name: 'Cliente de Angie' } }, saleDate: '2026-11-21', equipment: EQ, price: 300_000, commission: 77_700, fundedAmount: 1 }, { as: sellerCookie });
  assert.equal(created.status, 200, JSON.stringify(created.data));
  const raw = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === created.data.sale.id);
  assert.equal(raw.commission, null);
  assert.equal(raw.fundedAmount, null);
  assert.ok((await call('GET', '/bootstrap', undefined, { as: sellerCookie })).data.sales.some((s) => s.id === created.data.sale.id));
});

test('permisos: tecnico sin montos marca "se cobro" sin monto y no borra el monto existente', async () => {
  const techPerson = (await call('GET', '/bootstrap')).data.people.find((p) => p.name === 'Carlos');
  const r = await call('POST', '/users', {
    username: 'carlos', name: 'Carlos', password: 'clave-carlos-123', role: 'member',
    permissions: perms('own', techPerson.id, ['clients.view', 'clients.contact', 'sales.view', 'services.view', 'services.create', 'services.edit', 'inventory.view', 'inventory.move']),
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  techCookie = await loginAs('carlos', 'clave-carlos-123');
  const boot = (await call('GET', '/bootstrap', undefined, { as: techCookie })).data;
  assert.ok(boot.sales.every((s) => s.price === null && s.cashDown === null && s.commission === null), 'sin montos');
  assert.ok(boot.sales.some((s) => s.id === saleId), 've la venta que instalo');
  const installed = boot.sales.find((s) => s.id === saleId);
  const svc = await call('POST', '/services', { client: { id: installed.clientId }, saleId, reportedDate: '2026-11-21', problem: 'Gotea', technicianId: techPerson.id, billing: 'charged', amount: 5_000 }, { as: techCookie });
  assert.equal(svc.status, 200, JSON.stringify(svc.data));
  assert.equal(svc.data.service.amount, null);
  // El administrador pone el monto; luego el tecnico edita y el monto se conserva.
  const admin = (await call('GET', '/bootstrap')).data.services.find((s) => s.id === svc.data.service.id);
  await call('PUT', `/services/${admin.id}`, { ...admin, client: { id: admin.clientId }, amount: 12_000 });
  const mine = (await call('GET', '/bootstrap', undefined, { as: techCookie })).data.services.find((s) => s.id === admin.id);
  const edited = await call('PUT', `/services/${mine.id}`, { ...mine, client: { id: mine.clientId }, solution: 'Se cambio el o-ring', status: 'closed', closedDate: '2026-11-21' }, { as: techCookie });
  assert.equal(edited.status, 200, JSON.stringify(edited.data));
  assert.equal((await call('GET', '/bootstrap')).data.services.find((s) => s.id === mine.id).amount, 12_000);
  // No puede vender ni pagar.
  assert.equal((await call('POST', '/sales', { client: { id: clientId }, saleDate: '2026-11-21', equipment: EQ }, { as: techCookie })).status, 403);
});

test('vista previa: el administrador ve exactamente lo del usuario y no puede guardar', async () => {
  const seen = await call('GET', '/bootstrap', undefined, { viewAs: sellerUserId });
  assert.equal(seen.status, 200);
  assert.equal(seen.data.me.username, 'angie');
  assert.equal(seen.data.viewer.username, 'papa');
  const direct = (await call('GET', '/bootstrap', undefined, { as: sellerCookie })).data;
  assert.deepEqual(seen.data.sales.map((s) => s.id).sort(), direct.sales.map((s) => s.id).sort());
  assert.deepEqual(seen.data.sales.map((s) => s.fundedAmount), direct.sales.map((s) => s.fundedAmount));
  const write = await call('POST', '/clients', { name: 'No debe guardarse' }, { viewAs: sellerUserId });
  assert.equal(write.status, 403);
  assert.match(write.data.error, /vista previa/);
  // Un usuario que no es administrador no puede usar la vista previa.
  assert.equal((await call('GET', '/bootstrap', undefined, { as: sellerCookie, viewAs: adminId })).status, 403);
  assert.equal((await call('GET', '/bootstrap', undefined, { viewAs: 99999 })).status, 404);
});

test('usuarios: no te quitas tu propio acceso y siempre queda un administrador', async () => {
  assert.equal((await call('PUT', `/users/${adminId}`, { role: 'member', permissions: SELLER_PERMS })).status, 400);
  assert.equal((await call('PUT', `/users/${adminId}`, { active: false })).status, 400);
  // Cambiar permisos aplica al instante a la sesion abierta del usuario.
  await call('PUT', `/users/${sellerUserId}`, { permissions: perms('own', sellerId, SELLER_FLAGS.filter((f) => f !== 'money.prices')) });
  const boot = (await call('GET', '/bootstrap', undefined, { as: sellerCookie })).data;
  assert.ok(boot.sales.every((s) => s.price === null));
  // Pagos sin ver todos los montos se corrige solo.
  await call('PUT', `/users/${sellerUserId}`, { permissions: perms('own', sellerId, [...SELLER_FLAGS, 'payments.view', 'payments.commissions', 'money.profit']) });
  const angie = (await call('GET', '/users')).data.users.find((u) => u.username === 'angie');
  assert.equal(angie.permissions.flags['payments.commissions'], false, 'pagar comisiones sin verlas se corrige solo');
  assert.equal(angie.permissions.flags['money.profit'], false);
  // Se deja como vendedor para lo que sigue.
  await call('PUT', `/users/${sellerUserId}`, { permissions: perms('own', sellerId, SELLER_FLAGS) });
});

/* ------------------------- cuentas por pagar ------------------------- */

test('cuentas por pagar: cuenta, gasto, pago parcial y validaciones', async () => {
  const visa = (await call('POST', '/payable-accounts', { name: 'Visa', kind: 'card', last4: '4242', dueDay: 15, creditLimit: 1_000_000 })).data.account;
  const master = (await call('POST', '/payable-accounts', { name: 'Mastercard', kind: 'card' })).data.account;
  assert.equal(visa.last4, '4242');
  assert.equal((await call('POST', '/payable-accounts', { name: 'visa', kind: 'card' })).status, 409, 'nombre repetido');
  assert.equal((await call('POST', '/payable-accounts', { name: 'X', kind: 'card', last4: '12a4' })).status, 400);
  const charge = await call('POST', '/payables', { accountId: visa.id, date: '2026-11-10', description: 'Membranas', category: 'equipment', amount: 80_000, dueDate: '2026-11-25' });
  assert.equal(charge.status, 200, JSON.stringify(charge.data));
  assert.equal((await call('POST', '/payables', { accountId: visa.id, date: '2026-11-10', description: 'Mal', amount: 1000, dueDate: '2026-11-01' })).status, 400, 'vence antes de la fecha');
  assert.equal((await call('POST', '/payables', { accountId: visa.id, date: '2026-11-10', description: 'Cero', amount: 0 })).status, 400);
  const pay = await call('POST', '/payable-payments', { accountId: visa.id, payableId: charge.data.payable.id, date: '2026-11-12', amount: 30_000, method: 'zelle' });
  assert.equal(pay.status, 200);
  assert.equal((await call('POST', '/payable-payments', { accountId: master.id, payableId: charge.data.payable.id, date: '2026-11-12', amount: 1 })).status, 400, 'pago a un gasto de otra cuenta');
  assert.match((await call('DELETE', `/payable-accounts/${visa.id}`)).data.error, /Confirma/, 'con movimientos pide confirmar');
  const boot = (await call('GET', '/bootstrap')).data;
  assert.equal(boot.payables.length, 1);
  assert.equal(boot.payablePayments[0].amount, 30_000);
  // Al borrar el gasto, el pago queda como abono a la cuenta.
  await call('DELETE', `/payables/${charge.data.payable.id}`);
  const after = (await call('GET', '/bootstrap')).data;
  assert.equal(after.payablePayments[0].payableId, null);
});

test('cuentas por pagar: color y red elegidos para la tarjeta', async () => {
  const acc = (await call('POST', '/payable-accounts', { name: 'BANK OF AMERICA', kind: 'card', last4: '1111', color: 'gold', network: 'mastercard' })).data.account;
  assert.equal(acc.color, 'gold');
  assert.equal(acc.network, 'mastercard');
  assert.equal((await call('POST', '/payable-accounts', { name: 'Mala', kind: 'card', color: 'arcoiris' })).status, 400);
  const updated = (await call('PUT', `/payable-accounts/${acc.id}`, { ...acc, color: null, network: 'none' })).data.account;
  assert.equal(updated.color, null);
  assert.equal(updated.network, 'none');
  const log = (await call('GET', '/audit?group=payables&limit=3')).data.entries.find((e) => e.action === 'update');
  assert.ok(log.changes.some((c) => c.f === 'Color' && c.a === 'Dorado'));
  await call('DELETE', `/payable-accounts/${acc.id}`);
});

test('proveedores: la cuenta es el mismo proveedor y una compra a crédito anota la factura', async () => {
  const acc = (await call('POST', '/payable-accounts', { name: 'Aguas del Sur', kind: 'supplier' })).data.account;
  assert.ok(acc.supplierId, 'quedó ligado a un proveedor del catálogo');
  const boot = (await call('GET', '/bootstrap')).data;
  assert.ok(boot.suppliers.some((x) => x.id === acc.supplierId && x.name === 'Aguas del Sur'));
  // Cambiar el nombre de la cuenta cambia el del proveedor.
  await call('PUT', `/payable-accounts/${acc.id}`, { ...acc, name: 'Aguas del Sur LLC' });
  assert.ok((await call('GET', '/bootstrap')).data.suppliers.some((x) => x.id === acc.supplierId && x.name === 'Aguas del Sur LLC'));
  // Compra de inventario que se le debe al proveedor.
  const item = (await call('POST', '/inventory-items', { name: 'Cartucho PP 10"', category: 'filter', minStock: 5 })).data.item;
  const r = await call('POST', '/inventory-movements', { itemId: item.id, date: '2026-11-20', kind: 'in', quantity: 20, unitCost: 450, supplierId: acc.supplierId, bill: { dueDate: '2026-12-20', reference: '#7781' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const bill = (await call('GET', '/bootstrap')).data.payables.find((p) => p.accountId === acc.id);
  assert.ok(bill, 'factura anotada');
  assert.equal(bill.amount, 9_000);
  assert.equal(bill.dueDate, '2026-12-20');
  assert.match(bill.description, /#7781/);
  // Sin costo no se puede anotar la factura.
  assert.equal((await call('POST', '/inventory-movements', { itemId: item.id, date: '2026-11-20', kind: 'in', quantity: 1, supplierId: acc.supplierId, bill: { dueDate: null } })).status, 400);
});

test('cuentas por pagar: borrar una cuenta creada por error, con todo lo suyo', async () => {
  const acc = (await call('POST', '/payable-accounts', { name: 'Cuenta por error', kind: 'card' })).data.account;
  await call('POST', '/payables', { accountId: acc.id, date: '2026-11-20', description: 'Mal anotado', amount: 5_000 });
  await call('POST', '/payable-payments', { accountId: acc.id, date: '2026-11-20', amount: 1_000 });
  assert.equal((await call('DELETE', `/payable-accounts/${acc.id}`)).status, 409);
  assert.equal((await call('DELETE', `/payable-accounts/${acc.id}?todo=1`)).status, 200);
  const boot = (await call('GET', '/bootstrap')).data;
  assert.ok(!boot.payableAccounts.some((a) => a.id === acc.id));
  assert.ok(!boot.payables.some((p) => p.accountId === acc.id));
  assert.ok(!boot.payablePayments.some((p) => p.accountId === acc.id));
  const log = (await call('GET', '/audit?group=payables&limit=5')).data.entries[0];
  assert.equal(log.action, 'delete');
  assert.ok(log.changes.some((c) => /1 gastos .* 1 pagos/.test(c.b)), JSON.stringify(log.changes));
});

/* ----------------------------- inventario ----------------------------- */

test('inventario: entradas, salidas sin quedar en negativo y costos protegidos', async () => {
  const item = (await call('POST', '/inventory-items', { name: 'Membrana 75 GPD', category: 'membrane', minStock: 2, cost: 2_500 })).data.item;
  const entry = await call('POST', '/inventory-movements', { itemId: item.id, date: '2026-11-15', kind: 'in', quantity: 10, unitCost: 2_800 });
  assert.equal(entry.status, 200, JSON.stringify(entry.data));
  const items = (await call('GET', '/bootstrap')).data.inventoryItems;
  assert.equal(items.find((i) => i.id === item.id).cost, 2_800, 'la compra actualiza el costo');
  const out = await call('POST', '/inventory-movements', { itemId: item.id, date: '2026-11-16', kind: 'out', quantity: 3, saleId }, { as: techCookie });
  assert.equal(out.status, 200, JSON.stringify(out.data));
  assert.equal(out.data.movement.unitCost, null, 'el tecnico no ve costos');
  const tooMany = await call('POST', '/inventory-movements', { itemId: item.id, date: '2026-11-16', kind: 'out', quantity: 20 });
  assert.equal(tooMany.status, 400);
  assert.match(tooMany.data.error, /Solo hay 7/);
  assert.equal((await call('POST', '/inventory-movements', { itemId: item.id, date: '2026-11-16', kind: 'adjust', quantity: 0 })).status, 400);
  // Borrar la entrada dejaria la existencia en -3.
  assert.equal((await call('DELETE', `/inventory-movements/${entry.data.movement.id}`)).status, 409);
  const techBoot = (await call('GET', '/bootstrap', undefined, { as: techCookie })).data;
  assert.equal(techBoot.inventoryItems.find((i) => i.id === item.id).cost, null);
  // El tecnico edita el producto: el costo se conserva.
  await call('PUT', `/inventory-items/${item.id}`, { name: 'Membrana 75 GPD', category: 'membrane', minStock: 3, cost: 1 }, { as: techCookie });
  assert.equal((await call('GET', '/bootstrap')).data.inventoryItems.find((i) => i.id === item.id).cost, 2_800);
  assert.equal((await call('GET', '/bootstrap', undefined, { as: sellerCookie })).data.inventoryItems.length, 0, 'el vendedor no ve inventario');
});


test('permisos detallados: registrar sin editar, contacto oculto y pagos por tipo', async () => {
  const people = (await call('GET', '/bootstrap')).data.people;
  const r = await call('POST', '/users', {
    username: 'recepcion', name: 'Recepción', password: 'clave-recep-123', role: 'member',
    permissions: perms('all', null, ['clients.view', 'sales.view', 'sales.create', 'money.prices', 'money.commissions', 'payments.view', 'payments.commissions']),
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const as = await loginAs('recepcion', 'clave-recep-123');
  const boot = (await call('GET', '/bootstrap', undefined, { as })).data;
  assert.ok(boot.clients.length > 0);
  assert.ok(boot.clients.every((c) => c.phone === null && c.address === null && c.email === null), 'sin telefono ni direccion');
  assert.ok(boot.sales.every((s) => s.installAddress === null));
  assert.ok(boot.sales.some((s) => s.commission != null), 've comisiones');
  assert.ok(boot.sales.every((s) => s.fundedAmount === null), 'no ve lo de financieras');
  // Registra una venta y la puede corregir el mismo dia, pero no una ajena.
  const created = await call('POST', '/sales', { client: { create: { name: 'Cliente de recepción', phone: '2395551111' } }, saleDate: '2026-11-21', equipment: EQ, price: 250_000 }, { as });
  assert.equal(created.status, 200, JSON.stringify(created.data));
  const mine = created.data.sale;
  assert.equal((await call('PUT', `/sales/${mine.id}`, { ...mine, client: { id: mine.clientId }, price: 260_000, expectedUpdatedAt: mine.updatedAt }, { as })).status, 200);
  const other = boot.sales.find((s) => s.id !== mine.id);
  assert.equal((await call('PUT', `/sales/${other.id}`, { ...other, client: { id: other.clientId } }, { as })).status, 403);
  // Editar un cliente sin ver su contacto no borra el telefono.
  // (no tiene clients.edit: 403)
  assert.equal((await call('PUT', `/clients/${mine.clientId}`, { name: 'Otro nombre', phone: null }, { as })).status, 403);
  // Pagar comisiones si; marcar lo de la financiera no; no puede cancelar ventas.
  assert.equal((await call('POST', `/sales/${mine.id}/mark`, { field: 'fundedPaid', paid: true, date: null }, { as })).status, 403);
  const status = await call('PUT', `/sales/${mine.id}`, { ...mine, client: { id: mine.clientId }, status: 'cancelled' }, { as });
  assert.equal(status.status, 200);
  assert.equal(status.data.sale.status, 'active', 'el estado no lo cambia sin permiso');
  assert.equal(people.length > 0, true);
});

test('permisos detallados: cuentas por pagar solo de las tarjetas asignadas', async () => {
  const accounts = (await call('GET', '/bootstrap')).data.payableAccounts;
  const visa = accounts.find((a) => a.name === 'Visa');
  const master = accounts.find((a) => a.name === 'Mastercard');
  const r = await call('POST', '/users', {
    username: 'jaimetest', name: 'Jaime Test', password: 'clave-jaime-123', role: 'member',
    permissions: perms('all', null, ['payables.view', 'payables.charges', 'payables.pay', 'payables.accounts'], { payableAccounts: [master.id] }),
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.users.find((u) => u.username === 'jaimetest').permissions.flags['payables.accounts'], false, 'no crea cuentas si no ve todas');
  const as = await loginAs('jaimetest', 'clave-jaime-123');
  const boot = (await call('GET', '/bootstrap', undefined, { as })).data;
  assert.deepEqual(boot.payableAccounts.map((a) => a.name), ['Mastercard']);
  assert.ok(boot.payablePayments.every((p) => p.accountId === master.id));
  assert.equal(boot.sales.length, 0, 'sin ventas');
  assert.equal((await call('POST', '/payables', { accountId: visa.id, date: '2026-11-20', description: 'No', amount: 100 }, { as })).status, 403);
  assert.equal((await call('POST', '/payables', { accountId: master.id, date: '2026-11-20', description: 'Gasolina', amount: 4_500 }, { as })).status, 200);
  assert.equal((await call('POST', '/payable-accounts', { name: 'Nueva', kind: 'card' }, { as })).status, 403);
});


test('foto de perfil: se sube, se ve y no acepta cualquier archivo', async () => {
  const fakeJpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 7)]).toString('base64');
  const r = await call('PUT', '/auth/avatar', { image: `data:image/jpeg;base64,${fakeJpeg}` }, { as: sellerCookie });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.match(r.data.user.avatar, /^\/admin\/api\/avatars\/\d+\?v=/);
  const img = await fetch(BASE + r.data.user.avatar, { headers: { Cookie: cookie } });
  assert.equal(img.status, 200);
  assert.equal(img.headers.get('content-type'), 'image/jpeg');
  assert.equal((await call('PUT', '/auth/avatar', { image: 'data:image/jpeg;base64,' + Buffer.from('<script>').toString('base64') }, { as: sellerCookie })).status, 400);
  assert.equal((await call('PUT', '/auth/avatar', { image: 'https://otro.sitio/foto.jpg' }, { as: sellerCookie })).status, 400);
  assert.equal((await call('DELETE', '/auth/avatar', undefined, { as: sellerCookie })).data.user.avatar, null);
});

test('hora de instalación y garantía guardada', async () => {
  const sale = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === saleId);
  const r = await call('PUT', `/sales/${saleId}`, { ...sale, client: { id: sale.clientId }, installTime: '12:00 pm – 2:00 pm', expectedUpdatedAt: sale.updatedAt });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.sale.installTime, '12:00 pm – 2:00 pm');
  const w = await call('POST', `/sales/${saleId}/warranty`, { issueDate: '2026-11-07', representative: 'Angie', issuedIn: 'Cape Coral, Florida / Well water', lines: [{ item: 'Reverse osmosis membrane', serial: 'MW-RO-20261107-001' }] });
  assert.equal(w.status, 200, JSON.stringify(w.data));
  assert.equal(w.data.sale.warranty.lines[0].serial, 'MW-RO-20261107-001');
  assert.equal((await call('POST', `/sales/${saleId}/warranty`, { issueDate: '2026-11-07', representative: '', lines: [] })).status, 400);
  assert.equal((await call('POST', `/sales/${saleId}/warranty`, { issueDate: '2026-11-07', representative: 'X', lines: [{ item: 'Y' }] }, { as: techCookie })).status, 403, 'el técnico solo ve ventas');
});

test('servicio: hora de la visita (para el reporte de mantenimiento)', async () => {
  const owner = (await call('GET', '/bootstrap')).data.sales.find((x) => x.id === saleId).clientId;
  const base = { client: { id: owner }, saleId, reportedDate: '2026-11-21', kind: 'maintenance', problem: 'Limpieza y ajustes del equipo' };
  const r = await call('POST', '/services', { ...base, visitDate: '2026-11-23', visitTime: '10:00 am – 12:00 pm' });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.service.visitTime, '10:00 am – 12:00 pm');
  // Sin fecha de visita no se guarda una hora suelta.
  const noDate = await call('POST', '/services', { ...base, visitTime: '9:30 am' });
  assert.equal(noDate.data.service.visitTime, null);
  const old = await call('POST', '/services', base);
  assert.equal(old.data.service.visitTime, null, 'quien no manda la hora no rompe nada');
});

test('factura: número correlativo, sin repetir, reemisión igual y permisos', async () => {
  const body = (extra = {}) => ({
    issueDate: '2026-11-22',
    dueDate: '2026-11-22',
    brand: 'magic',
    terms: 'Financed — Financiera Uno',
    taxRate: 0,
    amountPaid: 50_000,
    financedAmount: 1_150_000,
    financedBy: 'Financiera Uno',
    customerPo: '',
    lines: [
      { description: 'Whole-house reverse osmosis system (2 membranes)', itemNumber: 'MW-WRO-2M', quantity: 1, unitPrice: 600_000, serial: 'MW-WRO-20261122-001' },
      { description: 'Outdoor filter tank', itemNumber: 'MW-FLT-TANK', quantity: 3, unitPrice: 200_000, serial: 'A, B, C' },
      { description: 'Installation, materials, transportation and labor', itemNumber: 'INSTALL', quantity: 1, unitPrice: 0, serial: '' },
    ],
    ...extra,
  });
  assert.equal((await call('GET', '/invoices/next')).data.number, 2023, 'sigue a la 300-2022');
  const r = await call('POST', `/sales/${saleId}/invoice`, body());
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.sale.invoice.number, 2023, 'sin número se asigna el siguiente');
  assert.equal(r.data.sale.invoice.lines[1].quantity, 3);
  assert.equal((await call('GET', '/invoices/next')).data.number, 2024);
  // Reemitir conserva el número.
  const again = await call('POST', `/sales/${saleId}/invoice`, body({ terms: 'Paid in full' }));
  assert.equal(again.data.sale.invoice.number, 2023);
  assert.equal(again.data.sale.invoice.terms, 'Paid in full');
  // Otra venta no puede usar el mismo número.
  const other = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id !== saleId);
  const dup = await call('POST', `/sales/${other.id}/invoice`, body({ number: 2023 }));
  assert.equal(dup.status, 409);
  assert.match(dup.data.error, /300-2024/);
  assert.equal((await call('POST', `/sales/${other.id}/invoice`, body({ number: 2024 }))).status, 200);
  // Descuento: se resta antes del total; no puede pasar la suma de las líneas.
  const disc = await call('POST', `/sales/${saleId}/invoice`, body({ discount: 50_000, amountPaid: 0, financedAmount: 0 }));
  assert.equal(disc.status, 200, JSON.stringify(disc.data));
  assert.equal(disc.data.sale.invoice.discount, 50_000);
  assert.equal((await call('POST', `/sales/${saleId}/invoice`, body({ discount: 99_000_000 }))).status, 400);
  // Impuesto escrito en dólares (calculado según el estado).
  const tx = await call('POST', `/sales/${saleId}/invoice`, body({ taxAmount: 63_000 }));
  assert.equal(tx.status, 200, JSON.stringify(tx.data));
  assert.equal(tx.data.sale.invoice.taxAmount, 63_000);
  // Datos mal y permisos.
  assert.equal((await call('POST', `/sales/${saleId}/invoice`, body({ lines: [] }))).status, 400);
  assert.equal((await call('POST', `/sales/${saleId}/invoice`, body({ taxRate: 40 }))).status, 400);
  assert.equal((await call('POST', `/sales/${saleId}/invoice`, body(), { as: techCookie })).status, 403);
  assert.equal((await call('GET', '/invoices/next', undefined, { as: techCookie })).status, 403);
  const techSales = (await call('GET', '/bootstrap', undefined, { as: techCookie })).data.sales;
  assert.ok(techSales.every((s) => s.invoice === null), 'quien no ve precios no recibe la factura');
  const log = (await call('GET', '/audit?group=sales&limit=10')).data.entries;
  assert.ok(log.some((e) => e.action === 'invoice' && /factura 300-2023/.test(e.label)));
});

/* ------------------------- registro de actividad ------------------------- */

test('créditos: solicitud cifrada, firmas, aprobación y autorización que crea la venta', async () => {
  const personId = (await call('POST', '/people', { name: 'Vendedor Crédito', phone: null, isSeller: true, isInstaller: false })).data.person.id;
  const u = await call('POST', '/users', { username: 'vcredito', name: 'Vendedor Crédito', password: 'clave-credito-123', role: 'member', permissions: perms('own', personId, ['credit.create']) });
  assert.equal(u.status, 200, JSON.stringify(u.data));
  const vc = await loginAs('vcredito', 'clave-credito-123');
  // "Solo créditos": no ve clientes ni ventas del negocio.
  const vboot = await call('GET', '/bootstrap', undefined, { as: vc });
  assert.equal(vboot.data.clients.length, 0);
  assert.equal(vboot.data.sales.length, 0);

  const person = (firstName, lastName) => ({
    firstName, lastName, cellPhone: '2395550123', homePhone: '', email: 'ana@example.com', address: '1420 SE 8th Ter', city: 'Cape Coral', state: 'fl', zip: '33990',
    previousAddress: '', employer: 'Publix', years: '3', salary: '$3,500', position: 'Cajera', businessPhone: '', employerAddress: '', employerCity: '', employerState: '', employerZip: '', previousEmployer: '', otherIncome: '',
  });
  const body = {
    brandId: null, appDate: '2026-11-22', amount: 950_000,
    data: { applicant: person('Ana', 'Prueba'), coApplicant: person('Luis', 'Prueba'), home: { status: 'paid', company: '', monthlyPayment: '', howLong: '10 años' }, references: [{ name: 'Rosa', relationship: 'Hermana', phone: '2395550000' }] },
    secret: { applicant: { ssn: '123-45-6789', dob: '1980-02-03', dl: 'P123456789', dlExp: '2030-01-01' }, coApplicant: { ssn: '987654321', dob: '1979-05-06', dl: '', dlExp: '' } },
  };
  const c = await call('POST', '/credit', body, { as: vc });
  assert.equal(c.status, 200, JSON.stringify(c.data));
  const id = c.data.app.id;
  assert.equal(c.data.app.secret.applicant.ssn, '123456789', 'quien la llena la ve completa');
  assert.equal(c.data.app.sellerId, personId);
  assert.equal(c.data.app.data.references.length, 3);

  // En la base el SSN no queda legible.
  const raw = new Database(path.join(dataDir, 'admin.db'), { readonly: true });
  const row = raw.prepare('SELECT secret FROM credit_apps WHERE id = ?').get(id);
  raw.close();
  assert.ok(!row.secret.includes('123456789') && !Buffer.from(row.secret, 'base64').toString('latin1').includes('123456789'));

  // Sin la foto de la ID no se envía.
  const png = 'data:image/png;base64,' + Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex').toString('base64');
  const sigs = { applicant: png, coApplicant: png, rep: png };
  let s = await call('POST', `/credit/${id}/submit`, { consent: true, signatures: sigs }, { as: vc });
  assert.equal(s.status, 400);
  assert.equal(s.data.field, 'id1-front');
  const jpg = 'data:image/jpeg;base64,' + Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]).toString('base64');
  for (const k of ['id1-front', 'id2-front']) assert.equal((await call('PUT', `/credit/${id}/files/${k}`, { image: jpg }, { as: vc })).status, 200);
  assert.equal((await call('PUT', `/credit/${id}/files/id1-front`, { image: 'data:image/jpeg;base64,AAAA' }, { as: vc })).status, 400, 'no es JPEG');
  assert.equal((await call('POST', `/credit/${id}/submit`, { consent: false, signatures: sigs }, { as: vc })).status, 400, 'sin aceptar la firma electrónica');
  assert.equal((await call('POST', `/credit/${id}/submit`, { consent: true, signatures: { ...sigs, coApplicant: null } }, { as: vc })).status, 400, 'falta el coaplicante');
  s = await call('POST', `/credit/${id}/submit`, { consent: true, signatures: sigs }, { as: vc });
  assert.equal(s.status, 200, JSON.stringify(s.data));
  assert.equal(s.data.app.status, 'submitted');
  assert.equal(s.data.app.secret.applicant.ssn, '•••-••-6789', 'ya enviada: tapado');
  assert.equal(s.data.app.signatures.applicant.hash.length, 64);

  // El vendedor ya no la cambia ni ve el SSN o las IDs; otro usuario sin permiso no la ve.
  assert.equal((await call('PUT', `/credit/${id}`, body, { as: vc })).status, 403);
  assert.equal((await call('GET', `/credit/${id}/secret`, undefined, { as: vc })).status, 403);
  assert.equal((await call('GET', `/credit/${id}/files/id1-front`, undefined, { as: vc })).status, 403);
  assert.equal((await call('POST', `/credit/${id}/decision`, { result: 'approved' }, { as: vc })).status, 403);
  assert.equal((await call('GET', `/credit/${id}`, undefined, { as: sellerCookie })).status, 403);

  // La oficina: SSN completo (queda anotado) y la foto descifrada.
  const sec = await call('GET', `/credit/${id}/secret`);
  assert.equal(sec.data.secret.applicant.ssn, '123456789');
  const img = await fetch(`${BASE}/admin/api/credit/${id}/files/id1-front`, { headers: { Cookie: cookie } });
  assert.equal(img.status, 200);
  assert.deepEqual([...new Uint8Array(await img.arrayBuffer())].slice(0, 2), [0xff, 0xd8]);

  // Devolver para corregir borra las firmas; se vuelve a firmar.
  const back = await call('POST', `/credit/${id}/decision`, { result: 'return', notes: 'Revisar el SSN del coaplicante' });
  assert.equal(back.data.app.status, 'draft');
  assert.deepEqual(back.data.app.signatures, {});
  assert.equal(back.data.app.data.returnNote, 'Revisar el SSN del coaplicante');
  const fixed = await call('PUT', `/credit/${id}`, { ...body, secret: { applicant: { ...body.secret.applicant, ssn: '•••-••-6789' }, coApplicant: { ...body.secret.coApplicant, ssn: '987654322' } } }, { as: vc });
  assert.equal(fixed.status, 200, JSON.stringify(fixed.data));
  assert.equal(fixed.data.app.secret.applicant.ssn, '123456789', 'lo tapado se conserva');
  assert.equal((await call('POST', `/credit/${id}/submit`, { consent: true, signatures: sigs }, { as: vc })).status, 200);

  // Aprobar: al vendedor le aparece aprobada.
  const fin = (await call('GET', '/bootstrap')).data.financiers[0];
  const ap = await call('POST', `/credit/${id}/decision`, { result: 'approved', financierId: fin.id, approvedAmount: 950_000, apr: 9.99, termMonths: 120, monthlyPayment: 12_550 });
  assert.equal(ap.status, 200, JSON.stringify(ap.data));
  assert.equal((await call('GET', '/bootstrap', undefined, { as: vc })).data.credit.find((x) => x.id === id).status, 'approved');

  // Autorización de instalación: firma y crea la venta.
  const contract = {
    date: '2026-11-22', buyer1: { name: 'Ana Prueba', phone: '2395550123', email: 'ana@example.com' }, buyer2: { name: 'Luis Prueba', phone: '', email: '' },
    address: '1420 SE 8th Ter', city: 'Cape Coral', state: 'FL', zip: '33990', waterTreatment: { brand: 'Infinity Water', model: 'X1' }, reverseOsmosis: { brand: '', model: '' }, other: '',
    equipment: EQ, installDate: '2026-11-25', installSlot: 'am', waterSource: 'well', iceMaker: true, people: 4, floor: 'slab', payment: null,
    cashPrice: 950_000, installation: null, taxes: null, downPayment: 0, amountToFinance: 950_000, payments: 120, monthlyPayment: 12_550, apr: 9.99,
  };
  const csigs = { buyer1: png, buyer2: png, rep: png };
  assert.equal((await call('POST', `/credit/${id}/contract/sign`, { consent: true, signatures: csigs }, { as: vc })).status, 400, 'primero se guarda');
  assert.equal((await call('PUT', `/credit/${id}/contract`, contract, { as: vc })).status, 200);
  assert.equal((await call('POST', `/credit/${id}/contract/sign`, { consent: true, signatures: { ...csigs, buyer2: null } }, { as: vc })).status, 400, 'falta el comprador 2');
  const sg = await call('POST', `/credit/${id}/contract/sign`, { consent: true, signatures: csigs }, { as: vc });
  assert.equal(sg.status, 200, JSON.stringify(sg.data));
  assert.equal(sg.data.app.status, 'signed');
  const boot = (await call('GET', '/bootstrap')).data;
  const sale = boot.sales.find((x) => x.id === sg.data.saleId);
  assert.equal(sale.price, 950_000);
  assert.equal(sale.paymentMethod, 'financed');
  assert.equal(sale.financierId, fin.id);
  assert.equal(sale.sellerId, personId);
  assert.equal(sale.installTime, '8:00 am – 1:00 pm');
  assert.equal(sale.waterSource, 'well');
  assert.equal(boot.clients.find((x) => x.id === sale.clientId).name, 'Ana Prueba');
  assert.equal((await call('POST', `/credit/${id}/contract/sign`, { consent: true, signatures: csigs }, { as: vc })).status, 403, 'no se firma dos veces');
  assert.equal((await call('DELETE', `/credit/${id}`)).status, 403, 'ligada a la venta: no se borra');

  // El vendedor no la pone a nombre de otro ni de un cliente que no ve; no firma más de lo aprobado.
  const other = await call('POST', '/credit', { ...body, sellerId: 1, clientId: sale.clientId }, { as: vc });
  assert.equal(other.status, 403, 'cliente que no ve');
  const own = await call('POST', '/credit', { ...body, sellerId: 1 }, { as: vc });
  assert.equal(own.data.app.sellerId, personId, 'queda a su nombre');
  const badSig = await call('POST', `/credit/${own.data.app.id}/submit`, { consent: true, signatures: { applicant: 'data:image/png;base64,' + Buffer.from('<html>').toString('base64'), coApplicant: png, rep: png } }, { as: vc });
  assert.equal(badSig.status, 400);
  // La nota de la oficina sigue a la vista mientras el vendedor corrige.
  const ownId = own.data.app.id;
  for (const k of ['id1-front', 'id2-front']) await call('PUT', `/credit/${ownId}/files/${k}`, { image: jpg }, { as: vc });
  assert.equal((await call('POST', `/credit/${ownId}/submit`, { consent: true, signatures: sigs }, { as: vc })).status, 200);
  await call('POST', `/credit/${ownId}/decision`, { result: 'return', notes: 'Falta el ZIP' });
  const kept = await call('PUT', `/credit/${ownId}`, body, { as: vc });
  assert.equal(kept.data.app.data.returnNote, 'Falta el ZIP');
  await call('POST', `/credit/${ownId}/submit`, { consent: true, signatures: sigs }, { as: vc });
  await call('POST', `/credit/${ownId}/decision`, { result: 'approved', financierId: fin.id, approvedAmount: 500_000, apr: 9.99, termMonths: 120, monthlyPayment: 6_600 });
  const tooMuch = await call('PUT', `/credit/${ownId}/contract`, { ...contract, amountToFinance: 999_999_00, cashPrice: 999_999_00, monthlyPayment: 6_600 }, { as: vc });
  assert.equal(tooMuch.status, 400);
  assert.equal(tooMuch.data.field, 'amountToFinance');
  assert.equal((await call('PUT', `/credit/${ownId}/contract`, { ...contract, zip: '339901' }, { as: vc })).status, 400, 'ZIP mal escrito');
  assert.equal((await call('PUT', `/credit/${ownId}/contract`, { ...contract, installDate: '2026-11-01' }, { as: vc })).status, 400, 'instalación antes del contrato');

  const log = (await call('GET', '/audit?group=credit&limit=40')).data.entries.map((e) => e.action);
  for (const action of ['credit-submit', 'credit-return', 'credit-secret', 'credit-ids', 'credit-approve', 'contract-sign']) assert.ok(log.includes(action), action);
});

test('registro: solo el dueño lo ve, con quién, equipo y qué cambió', async () => {
  assert.equal((await call('GET', '/audit', undefined, { as: sellerCookie })).status, 403);
  assert.equal((await call('GET', '/audit', undefined, { viewAs: sellerUserId })).status, 403, 'tampoco en la vista previa');
  // Un cambio de precio queda con el valor anterior y el nuevo.
  const sale = (await call('GET', '/bootstrap')).data.sales.find((s) => s.id === saleId);
  await call('PUT', `/sales/${saleId}`, { ...sale, client: { id: sale.clientId }, price: sale.price + 10_000, expectedUpdatedAt: sale.updatedAt });
  const log = (await call('GET', '/audit?group=sales&limit=5')).data;
  const entry = log.entries.find((e) => e.action === 'update' && e.entityId === saleId);
  assert.ok(entry, 'quedó registrado');
  assert.equal(entry.userName, 'Papá Albornoz');
  assert.match(entry.label, /la venta de .+ \(#\d+\)/);
  const price = entry.changes.find((c) => c.f === 'Valor de la venta');
  assert.ok(price && price.a && price.b && price.a !== price.b, JSON.stringify(entry.changes));
  // Accesos: entradas e intentos fallidos con el usuario que se probó.
  await call('POST', '/auth/login', { username: 'angie', password: 'no-es-esta' }, { auth: false, ip: '192.0.2.77' });
  const access = (await call('GET', '/audit?group=access&limit=20')).data.entries;
  const failed = access.find((e) => e.action === 'login-failed' && e.label === 'angie');
  assert.ok(failed);
  assert.equal(failed.ip, '192.0.2.77');
  assert.ok(access.some((e) => e.action === 'login'));
  // Descargas hechas en la app.
  await call('POST', '/audit/event', { kind: 'export', what: 'la lista de ventas', rows: 12 }, { as: sellerCookie });
  const downloads = (await call('GET', '/audit?group=downloads')).data.entries;
  assert.ok(downloads.some((e) => e.action === 'export' && e.userName === 'Angie' && /12 filas/.test(e.label)));
  const summary = (await call('GET', '/audit/summary')).data;
  assert.equal(summary.integrity.ok, true);
  assert.ok(summary.integrity.count > 10);
});

test('dueño: otro administrador no toca su cuenta ni lo ve en vista previa', async () => {
  const r = await call('POST', '/users', { username: 'otroadmin', name: 'Otro Admin', password: 'clave-otro-1234', role: 'admin' });
  assert.equal(r.status, 200);
  const owner = r.data.users.find((u) => u.owner);
  assert.equal(owner.username, 'papa', 'el primer usuario es el dueño');
  const as = await loginAs('otroadmin', 'clave-otro-1234');
  assert.equal((await call('PUT', `/users/${owner.id}`, { password: 'clave-nueva-12345' }, { as })).status, 403);
  assert.equal((await call('PUT', `/users/${owner.id}`, { name: 'Otro nombre' }, { as })).status, 403);
  assert.equal((await call('GET', '/bootstrap', undefined, { as, viewAs: owner.id })).status, 403);
  assert.equal((await call('GET', '/audit', undefined, { as })).status, 403, 'el registro es solo del dueño');
  // El dueño tampoco puede quitarse el acceso.
  assert.equal((await call('PUT', `/users/${owner.id}`, { active: false })).status, 400);
});

test('registro sellado: si se altera desde la base, se detecta', async () => {
  const db = new Database(path.join(dataDir, 'admin.db'));
  db.prepare(`UPDATE audit SET label = 'cambiado a mano' WHERE id = (SELECT MIN(id) + 3 FROM audit)`).run();
  db.close();
  const summary = (await call('GET', '/audit/summary')).data;
  assert.equal(summary.integrity.ok, false);
  assert.ok(summary.integrity.brokenAt);
});

test('bootstrap: 304 si nada cambio, 200 despues de guardar algo', async () => {
  const first = await fetch(BASE + '/admin/api/bootstrap', { headers: { 'X-IW-Admin': '1', Cookie: cookie } });
  const etag = first.headers.get('etag');
  assert.ok(etag);
  const again = await fetch(BASE + '/admin/api/bootstrap', { headers: { 'X-IW-Admin': '1', Cookie: cookie, 'If-None-Match': `W/${etag}` } });
  assert.equal(again.status, 304);
  await call('POST', '/clients', { name: 'Cambio de version' });
  const after = await fetch(BASE + '/admin/api/bootstrap', { headers: { 'X-IW-Admin': '1', Cookie: cookie, 'If-None-Match': etag } });
  assert.equal(after.status, 200);
  assert.notEqual(after.headers.get('etag'), etag);
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

test('cerrar sesion invalida la cookie y borra la cache del navegador', async () => {
  const out = await call('POST', '/auth/logout');
  assert.equal(out.headers.get('clear-site-data'), '"cache"');
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
  // El registro de actividad se conserva y anota el borrado.
  const db = new Database(path.join(dataDir, 'admin.db'), { readonly: true });
  const last = db.prepare('SELECT action, entity, device FROM audit ORDER BY id DESC LIMIT 1').get();
  assert.deepEqual(last, { action: 'delete', entity: 'database', device: 'Servidor (terminal)' });
  assert.ok(db.prepare('SELECT COUNT(*) AS n FROM audit').get().n > 20);
  db.close();
});
