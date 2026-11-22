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
