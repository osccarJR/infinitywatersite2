// Calculo del dinero de una venta: la formula de la que depende todo el panel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addMonthsISO, equipmentSummary, saleMoney } from '../shared/domain.ts';

const base = { fundedPaid: false, commission: null, installerPay: null, suppliers: [] as { cost: number | null }[] };

test('financiado con abono: descuento de la financiera y ganancia', () => {
  const m = saleMoney({
    ...base,
    price: 1_000_000, // $10,000
    paymentMethod: 'financed',
    cashDown: 100_000, // $1,000 cash
    fundedAmount: 810_000, // financiera paga $8,100 de $9,000
    commission: 150_000,
    installerPay: 20_000,
    suppliers: [{ cost: 300_000 }, { cost: 50_000 }],
  });
  assert.equal(m.financedAmount, 900_000);
  assert.equal(m.financierFee, 90_000);
  assert.equal(m.income, 910_000);
  assert.equal(m.costs, 520_000);
  assert.equal(m.profit, 390_000);
  assert.equal(m.received, 100_000); // la financiera aun no paga
  assert.equal(m.pendingFinancier, 810_000);
  assert.equal(m.estimate, false);
});

test('financiado sin pago registrado: ganancia estimada con lo financiado', () => {
  const m = saleMoney({ ...base, price: 500_000, paymentMethod: 'financed', cashDown: 0, fundedAmount: null });
  assert.equal(m.income, 500_000);
  assert.equal(m.pendingFinancier, 500_000);
  assert.equal(m.estimate, true);
});

test('financiera ya pago: todo recibido', () => {
  const m = saleMoney({ ...base, price: 500_000, paymentMethod: 'financed', cashDown: 0, fundedAmount: 450_000, fundedPaid: true });
  assert.equal(m.received, 450_000);
  assert.equal(m.pendingFinancier, 0);
});

test('sin costos de proveedores la ganancia es estimada (no se presenta como real)', () => {
  const m = saleMoney({ ...base, price: 945_000, paymentMethod: 'cash', cashDown: 945_000, fundedAmount: null });
  assert.equal(m.noCosts, true);
  assert.equal(m.estimate, true);
});

test('cash con saldo pendiente del cliente', () => {
  const m = saleMoney({ ...base, price: 300_000, paymentMethod: 'cash', cashDown: 200_000, fundedAmount: null });
  assert.equal(m.income, 300_000);
  assert.equal(m.pendingClient, 100_000);
  assert.equal(m.financierFee, null);
});

test('venta antigua sin forma de pago: no inventa deudas', () => {
  const m = saleMoney({ ...base, price: 400_000, paymentMethod: null, cashDown: null, fundedAmount: null });
  assert.equal(m.pendingClient, 0);
  assert.equal(m.pendingFinancier, 0);
  assert.equal(m.estimate, true);
});

test('resumen del equipo en palabras', () => {
  assert.equal(
    equipmentSummary({ outdoorTanks: 2, aerator: true, wholeHouseRo: 0, ro: true, roType: 'five_stage', roUv: true, other: null }),
    '2 filtros fuera de casa + aireador · Ósmosis de cocina de 5 pasos con UV'
  );
  assert.equal(equipmentSummary({ outdoorTanks: 0, aerator: false, wholeHouseRo: 0, ro: true, roType: 'box', roUv: false, other: null }), 'Ósmosis de cocina en caja sin UV');
  assert.equal(
    equipmentSummary({ outdoorTanks: 3, aerator: false, wholeHouseRo: 2, ro: false, roType: null, roUv: false, other: null }),
    '3 filtros fuera de casa · Ósmosis de toda la casa (2 membranas)'
  );
});

test('servicio como rubro: cobrado menos tecnico; sin medio de pago queda por cobrar', async () => {
  const { serviceMoney } = await import('../shared/domain.ts');
  assert.deepEqual(serviceMoney({ billing: 'charged', amount: 15_000, technicianPay: 5_000, paymentMethod: null }), { charged: 15_000, technician: 5_000, profit: 10_000, pendingClient: 15_000 });
  assert.equal(serviceMoney({ billing: 'warranty', amount: null, technicianPay: 4_000, paymentMethod: null }).profit, -4_000);
});

test('sumar meses respeta el fin de mes', () => {
  assert.equal(addMonthsISO('2026-08-31', 6), '2027-02-28');
  assert.equal(addMonthsISO('2026-11-21', 12), '2027-11-21');
});

test('direccion de Google -> campos del sistema', async () => {
  const { parseAddress } = await import('../server/places.ts');
  const parsed = parseAddress(
    [
      { longText: '3940', shortText: '3940', types: ['street_number'] },
      { longText: 'Metro Parkway', shortText: 'Metro Pkwy', types: ['route'] },
      { longText: 'Fort Myers', shortText: 'Fort Myers', types: ['locality', 'political'] },
      { longText: 'Lee County', shortText: 'Lee County', types: ['administrative_area_level_2', 'political'] },
      { longText: 'Florida', shortText: 'FL', types: ['administrative_area_level_1', 'political'] },
      { longText: 'United States', shortText: 'US', types: ['country', 'political'] },
      { longText: '33916', shortText: '33916', types: ['postal_code'] },
    ],
    '3940 Metro Pkwy, Fort Myers, FL 33916, USA'
  );
  assert.deepEqual(parsed, { address: '3940 Metro Pkwy', city: 'Fort Myers', zip: '33916', state: 'FL', formatted: '3940 Metro Pkwy, Fort Myers, FL 33916, USA' });
});

test('montos: coma decimal, coma de miles y casos ambiguos', async () => {
  const { parseMoney } = await import('../app/src/lib/format.ts');
  assert.equal(parseMoney('1500'), 150_000);
  assert.equal(parseMoney('$1,500'), 150_000);
  assert.equal(parseMoney('1,500.50'), 150_050);
  assert.equal(parseMoney('2500,50'), 250_050); // coma decimal (forma latina)
  assert.equal(parseMoney('2.500,50'), 250_050);
  assert.equal(parseMoney('1.5'), 150);
  assert.equal(parseMoney('1.500'), undefined); // ambiguo: no se adivina
  assert.equal(parseMoney('12a'), undefined);
  assert.equal(parseMoney(''), null);
});

test('perfiles combinables: Oficina + Técnico tiene lo más amplio de cada uno', async () => {
  const { mergePresets, presetsOf, permissionsSummary, PERMISSION_PRESETS, normalizePermissions, redundantPresets } = await import('../shared/domain.ts');
  const both = mergePresets(['office', 'technician'], 7);
  assert.equal(both.scope, 'all'); // todo el negocio gana a "solo lo suyo"
  assert.equal(both.flags['services.edit'], true);
  assert.equal(both.flags['inventory.move'], true);
  assert.equal(both.flags['money.prices'], true);
  assert.equal(both.flags['money.profit'], false);
  assert.equal(both.flags['payments.view'], false);
  assert.equal(both.flags['catalogs.brands'], true);
  // Se recuerdan los dos marcados, aunque Oficina ya incluya todo lo de Tecnico.
  assert.deepEqual(presetsOf(both), ['technician', 'office']);
  assert.match(permissionsSummary(both), /Técnico \+ Oficina/);
  assert.deepEqual(redundantPresets(['office', 'technician']), ['technician']);
  assert.deepEqual(redundantPresets(['seller', 'technician']), []);
  // Cada perfil solo se reconoce como si mismo.
  for (const preset of PERMISSION_PRESETS) assert.deepEqual(presetsOf(mergePresets([preset.key], null)), [preset.key]);
  // Vendedor + Contador: ve todos los montos, ve pagos (sin pagar), sigue pudiendo vender.
  const sc = mergePresets(['seller', 'accountant'], 3);
  assert.equal(sc.flags['money.profit'], true);
  assert.equal(sc.flags['payments.view'], true);
  assert.equal(sc.flags['payments.commissions'], false);
  assert.equal(sc.flags['sales.create'], true);
  // Ajustado a mano: personalizado.
  assert.equal(presetsOf(normalizePermissions({ ...mergePresets(['seller'], 3), flags: { ...mergePresets(['seller'], 3).flags, 'sales.delete': true } }, false)), null);
});

test('permisos detallados: dependencias que se corrigen solas', async () => {
  const { normalizePermissions } = await import('../shared/domain.ts');
  const p = normalizePermissions(
    {
      scope: 'own',
      personId: 4,
      payableAccounts: [2],
      flags: { 'sales.create': true, 'money.prices': true, 'money.profit': true, 'payments.commissions': true, 'clients.delete': true, 'payables.accounts': true, 'report.financiers': true },
    },
    false
  );
  assert.equal(p.flags['sales.view'], true, 'registrar implica ver');
  assert.equal(p.flags['clients.view'], true, 've los clientes de sus ventas');
  assert.equal(p.flags['money.profit'], false, 'ganancias solo con todos los montos');
  assert.equal(p.flags['payments.commissions'], false, 'pagar comisiones sin verlas no');
  assert.equal(p.flags['clients.delete'], false, 'borrar clientes solo con alcance total');
  assert.equal(p.flags['payables.accounts'], false, 'crear cuentas solo si ve todas');
  assert.equal(p.flags['report.financiers'], false, 'reporte de financieras sin ver financieras no');
  assert.deepEqual(p.payableAccounts, [2]);
});

test('permisos de la primera versión se convierten', async () => {
  const { normalizePermissions } = await import('../shared/domain.ts');
  const p = normalizePermissions({ scope: 'all', personId: null, clients: 'edit', sales: 'edit', services: 'view', money: 'prices', payments: 'none', payables: 'none', inventory: 'edit', reports: true, export: false, delete: false, catalogs: true, profiles: ['office'] }, false);
  assert.equal(p.flags['sales.create'], true);
  assert.equal(p.flags['sales.delete'], false);
  assert.equal(p.flags['services.view'], true);
  assert.equal(p.flags['services.create'], false);
  assert.equal(p.flags['money.prices'], true);
  assert.equal(p.flags['money.commissions'], false);
  assert.equal(p.flags['inventory.count'], true);
  assert.equal(p.flags['report.summary'], true);
  assert.equal(p.flags['report.financiers'], false);
  assert.equal(p.flags['catalogs.brands'], true);
});
