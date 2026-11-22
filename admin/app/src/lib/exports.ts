/**
 * Excel (CSV) generado en la app con lo que el usuario esta viendo: respeta
 * sus permisos (solo lleva los montos y registros que puede ver) y los
 * filtros de la pantalla.
 */
import type { PermissionFlag, Sale, Service } from '../../../shared/domain.ts';
import { SALE_STATUS_LABEL, SERVICE_KIND_LABEL, SERVICE_PAYMENT_LABEL, WATER_LABEL, equipmentSummary, formatAddress, saleMoney } from '../../../shared/domain.ts';
import type { Data } from './store.tsx';
import type { Access } from './access.ts';
import { saveFile } from './api.ts';
import { previewBlockedMessage, previewTarget } from './preview.ts';

type Cell = string | number | null | undefined;
export interface Column<T> {
  label: string;
  value: (row: T) => Cell;
  /** Solo si el usuario tiene este permiso (un monto, ver contacto...). */
  need?: PermissionFlag;
}

export const dollars = (cents: number | null | undefined) => (cents == null ? '' : (cents / 100).toFixed(2));

export function toCsv(header: string[], rows: Cell[][]) {
  const cell = (value: Cell) => {
    let text = value == null ? '' : String(value);
    // Evita que Excel interprete el texto como formula.
    if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return '﻿' + [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function exportRows<T>(name: string, rows: T[], columns: Column<T>[], access: Access, today: string) {
  const preview = previewTarget();
  if (preview) throw new Error(previewBlockedMessage(preview.name));
  const visible = columns.filter((c) => !c.need || access.can(c.need));
  saveFile(`infinitywater-${name}-${today}.csv`, toCsv(visible.map((c) => c.label), rows.map((row) => visible.map((c) => c.value(row)))));
}

export function exportSales(sales: Sale[], data: Data, access: Access) {
  const person = (id: number | null) => (id ? data.personById.get(id)?.name ?? '' : '');
  exportRows<Sale>(
    'ventas',
    sales,
    [
      { label: 'Venta #', value: (s) => s.id },
      { label: 'Fecha de venta', value: (s) => s.saleDate },
      { label: 'Estado', value: (s) => SALE_STATUS_LABEL[s.status] },
      { label: 'Cliente', value: (s) => data.clientById.get(s.clientId)?.name },
      { label: 'Teléfono', value: (s) => data.clientById.get(s.clientId)?.phone, need: 'clients.contact' },
      {
        need: 'clients.contact',
        label: 'Dirección de instalación',
        value: (s) => {
          const c = data.clientById.get(s.clientId);
          return s.installAddress || s.installCity ? formatAddress({ address: s.installAddress, city: s.installCity, state: s.installStateCode, zip: s.installZip }) : formatAddress(c ?? {});
        },
      },
      { label: 'Marca', value: (s) => (s.brandId ? data.brands.find((b) => b.id === s.brandId)?.name : '') },
      { label: 'Agua', value: (s) => (s.waterSource ? WATER_LABEL[s.waterSource] : '') },
      { label: 'Equipo', value: (s) => equipmentSummary(s.equipment) },
      { label: 'Fecha de instalación', value: (s) => s.installDate },
      { label: 'Técnico', value: (s) => person(s.installerId) },
      { label: 'Vendedor', value: (s) => person(s.sellerId) },
      { label: 'Forma de pago', value: (s) => (s.paymentMethod === 'financed' ? 'Financiado' : s.paymentMethod === 'cash' ? 'Cash' : '') },
      { label: 'Financiera', value: (s) => (s.financierId ? data.financierById.get(s.financierId)?.name : '') },
      { label: 'Valor de la venta', value: (s) => dollars(s.price), need: 'money.prices' },
      { label: 'Abono / cobrado en cash', value: (s) => dollars(s.cashDown), need: 'money.prices' },
      { label: 'Pagó la financiera', value: (s) => dollars(s.fundedAmount), need: 'money.financier' },
      { label: 'Comisión', value: (s) => dollars(s.commission), need: 'money.commissions' },
      { label: 'Pago al técnico', value: (s) => dollars(s.installerPay), need: 'money.techpay' },
      { label: 'Costo proveedores', value: (s) => dollars(saleMoney(s).supplierCost), need: 'money.costs' },
      { label: 'Ganancia', value: (s) => dollars(saleMoney(s).profit), need: 'money.profit' },
      { label: 'Próximo mantenimiento', value: (s) => s.nextServiceDate },
      { label: 'Notas', value: (s) => s.notes },
    ],
    access,
    data.today
  );
}

export function exportServices(services: Service[], data: Data, access: Access) {
  exportRows<Service>(
    'servicio-tecnico',
    services,
    [
      { label: 'Servicio #', value: (s) => s.id },
      { label: 'Reportado', value: (s) => s.reportedDate },
      { label: 'Cliente', value: (s) => data.clientById.get(s.clientId)?.name },
      { label: 'Teléfono', value: (s) => data.clientById.get(s.clientId)?.phone, need: 'clients.contact' },
      { label: 'Tipo', value: (s) => SERVICE_KIND_LABEL[s.kind] },
      { label: 'Problema', value: (s) => s.problem },
      { label: 'Solución', value: (s) => s.solution },
      { label: 'Técnico', value: (s) => (s.technicianId ? data.personById.get(s.technicianId)?.name : '') },
      { label: 'Visita', value: (s) => s.visitDate },
      { label: 'Estado', value: (s) => (s.status === 'open' ? 'Abierto' : 'Resuelto') },
      { label: 'Cerrado', value: (s) => s.closedDate },
      { label: 'Cobro', value: (s) => (s.billing === 'warranty' ? 'Garantía' : s.billing === 'charged' ? 'Cobrado' : '') },
      { label: 'Cobrado', value: (s) => dollars(s.amount), need: 'money.prices' },
      { label: 'Medio de pago', value: (s) => (s.paymentMethod ? SERVICE_PAYMENT_LABEL[s.paymentMethod] : '') },
      { label: 'Pago al técnico', value: (s) => dollars(s.technicianPay), need: 'money.techpay' },
    ],
    access,
    data.today
  );
}
