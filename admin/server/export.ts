/**
 * Exportacion a CSV para Excel o Google Sheets (el contador, impuestos).
 * Lleva BOM para que Excel lea bien las tildes; el dinero va en dolares.
 */
import type { DB } from './db.ts';
import * as repo from './repo.ts';
import {
  SALE_STATUS_LABEL,
  SERVICE_KIND_LABEL,
  SERVICE_PAYMENT_LABEL,
  serviceMoney,
  SOURCE_LABEL,
  WATER_LABEL,
  RO_TYPE_LABEL,
  equipmentSummary,
  saleMissing,
  saleMoney,
} from '../shared/domain.ts';

export type ExportKind = 'sales' | 'clients' | 'services';

const dollars = (cents: number | null | undefined) => (cents == null ? '' : (cents / 100).toFixed(2));
const yesNo = (v: boolean) => (v ? 'Sí' : 'No');

function toCsv(header: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (value: string | number | null | undefined) => {
    let text = value == null ? '' : String(value);
    // Evita que Excel interprete el texto como formula.
    if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return '﻿' + [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function exportCsv(db: DB, kind: ExportKind): string {
  const clients = new Map(repo.listClients(db).map((c) => [c.id, c]));
  const people = new Map(repo.listPeople(db).map((p) => [p.id, p.name]));
  const financiers = new Map(repo.listCatalog(db, 'financiers').map((f) => [f.id, f.name]));
  const suppliers = new Map(repo.listCatalog(db, 'suppliers').map((s) => [s.id, s.name]));
  const brands = new Map(repo.listCatalog(db, 'brands').map((b) => [b.id, b.name]));

  if (kind === 'clients') {
    const salesCount = new Map<number, number>();
    for (const sale of repo.listSales(db)) salesCount.set(sale.clientId, (salesCount.get(sale.clientId) ?? 0) + 1);
    return toCsv(
      ['ID', 'Nombre', 'Teléfono', 'Teléfono 2', 'Correo', 'Dirección', 'Ciudad', 'Estado', 'ZIP', 'Idioma', 'Cómo nos conoció', 'Ventas', 'Notas', 'Registrado'],
      [...clients.values()].map((c) => [
        c.id,
        c.name,
        c.phone,
        c.phone2,
        c.email,
        c.address,
        c.city,
        c.state,
        c.zip,
        c.language === 'es' ? 'Español' : c.language === 'en' ? 'Inglés' : '',
        c.source ? SOURCE_LABEL[c.source] : '',
        salesCount.get(c.id) ?? 0,
        c.notes,
        c.createdAt.slice(0, 10),
      ])
    );
  }

  if (kind === 'services') {
    return toCsv(
      ['ID', 'Fecha reporte', 'Cliente', 'Teléfono', 'Tipo', 'Problema', 'Qué se hizo', 'Técnico', 'Fecha visita', 'Estado', 'Fecha cierre', 'Garantía o cobrado', 'Cobrado ($)', 'Medio de pago', 'Pago al técnico ($)', 'Técnico pagado', 'Ganancia ($)', 'Venta #', 'Notas'],
      repo.listServices(db).map((v) => {
        const client = clients.get(v.clientId);
        return [
          v.id,
          v.reportedDate,
          client?.name,
          client?.phone,
          SERVICE_KIND_LABEL[v.kind],
          v.problem,
          v.solution,
          v.technicianId ? people.get(v.technicianId) : '',
          v.visitDate,
          v.status === 'open' ? 'Abierto' : 'Resuelto',
          v.closedDate,
          v.billing === 'warranty' ? 'Garantía' : v.billing === 'charged' ? 'Cobrado' : '',
          dollars(v.amount),
          v.paymentMethod ? SERVICE_PAYMENT_LABEL[v.paymentMethod] : '',
          dollars(v.technicianPay),
          v.technicianPay ? yesNo(v.technicianPaid) : '',
          dollars(serviceMoney(v).profit),
          v.saleId,
          v.notes,
        ];
      })
    );
  }

  return toCsv(
    [
      'Venta #', 'Estado', 'Marca', 'Fecha venta', 'Fecha instalación', 'Cliente', 'Teléfono', 'Dirección instalación', 'Ciudad', 'Estado', 'ZIP',
      'Agua', 'Filtros fuera de casa', 'Aireador', 'Ósmosis toda la casa (membranas)', 'Ósmosis en cocina', 'Tipo ósmosis', 'UV', 'Otro equipo', 'Resumen equipo',
      'Vendedor', 'Técnico instalador', 'Forma de pago', 'Financiera',
      'Valor de venta ($)', 'Abono / cobrado cash ($)', 'Financiado ($)', 'Pagó la financiera ($)', 'Descuento financiera ($)', 'Financiera ya pagó',
      'Proveedores', 'Costo proveedores ($)', 'Comisión ($)', 'Comisión pagada', 'Pago instalación ($)', 'Instalación pagada al técnico',
      'Ganancia ($)', 'Ganancia estimada', 'Próximo mantenimiento', 'Venta anterior (puesta al día)', 'Datos que faltan', 'Notas',
    ],
    repo.listSales(db).map((s) => {
      const client = clients.get(s.clientId);
      const m = saleMoney(s);
      const e = s.equipment;
      return [
        s.id,
        SALE_STATUS_LABEL[s.status],
        s.brandId ? brands.get(s.brandId) : '',
        s.saleDate,
        s.installDate,
        client?.name,
        client?.phone,
        s.installAddress ?? client?.address,
        s.installCity ?? client?.city,
        s.installAddress || s.installCity ? s.installStateCode : client?.state,
        s.installZip ?? client?.zip,
        s.waterSource ? WATER_LABEL[s.waterSource] : '',
        e.outdoorTanks,
        yesNo(e.aerator),
        e.wholeHouseRo || '',
        yesNo(e.ro),
        e.ro && e.roType ? RO_TYPE_LABEL[e.roType] : '',
        e.ro ? yesNo(e.roUv) : '',
        e.other,
        equipmentSummary(e),
        s.sellerId ? people.get(s.sellerId) : '',
        s.installerId ? people.get(s.installerId) : '',
        s.paymentMethod === 'financed' ? 'Financiado' : s.paymentMethod === 'cash' ? 'Cash' : '',
        s.financierId ? financiers.get(s.financierId) : '',
        dollars(s.price),
        dollars(s.cashDown),
        m.financed ? dollars(m.financedAmount) : '',
        dollars(s.fundedAmount),
        dollars(m.financierFee),
        m.financed ? yesNo(s.fundedPaid) : '',
        s.suppliers.map((row) => suppliers.get(row.supplierId)).join(' / '),
        dollars(m.supplierCost),
        dollars(s.commission),
        yesNo(s.commissionPaid),
        dollars(s.installerPay),
        s.installerPay ? yesNo(s.installerPaid) : '',
        dollars(m.profit),
        yesNo(m.estimate),
        s.nextServiceDate,
        yesNo(s.isLegacy),
        saleMissing(s).join(' / '),
        s.notes,
      ];
    })
  );
}
