/**
 * Lo que el usuario puede hacer, para mostrar u ocultar partes de la
 * pantalla. Es solo presentacion: el servidor aplica los mismos permisos.
 */
import type { PermissionFlag, Permissions } from '../../../shared/domain.ts';
import { useData } from './store.tsx';

type Section = 'clients' | 'sales' | 'services' | 'payments' | 'payables' | 'inventory';

export interface Access {
  admin: boolean;
  /** Dueno: ve el registro de actividad (nunca en la vista previa). */
  owner: boolean;
  scope: 'all' | 'own';
  personId: number | null;
  /** El permiso detallado, p. ej. can('sales.create'). */
  can: (flag: PermissionFlag) => boolean;
  canSee: (section: Section) => boolean;
  /** Puede registrar o editar algo de la seccion (para mostrar el formulario). */
  canEdit: (section: Section) => boolean;
  /** Ve lo que paga el cliente (valor de venta, abono, cobro de servicio). */
  prices: boolean;
  /** Ve las ganancias (implica todos los montos). */
  costs: boolean;
  /** Ve al menos un reporte. */
  reports: boolean;
  export: boolean;
  /** Puede editar al menos un catalogo. */
  catalogs: boolean;
  /** Puede registrar algo con el boton "+". */
  canRegister: boolean;
}

const EDIT_FLAGS: Record<Section, PermissionFlag[]> = {
  clients: ['clients.create', 'clients.edit'],
  sales: ['sales.create', 'sales.edit'],
  services: ['services.create', 'services.edit'],
  payments: ['payments.commissions', 'payments.technicians', 'payments.financiers'],
  payables: ['payables.charges', 'payables.pay', 'payables.accounts'],
  inventory: ['inventory.move', 'inventory.count', 'inventory.products'],
};

export function accessOf(p: Permissions, owner = false): Access {
  const f = p.flags;
  // Borrar es solo del dueno, aunque otro usuario sea administrador.
  const can = (flag: PermissionFlag) => Boolean(f[flag]) && (owner || !flag.endsWith('.delete'));
  return {
    admin: p.admin,
    owner,
    scope: p.scope,
    personId: p.personId,
    can,
    canSee: (section) => can(`${section}.view` as PermissionFlag),
    canEdit: (section) => EDIT_FLAGS[section].some(can),
    prices: can('money.prices'),
    costs: can('money.profit'),
    reports: Object.keys(f).some((k) => k.startsWith('report.') && f[k as PermissionFlag]),
    export: can('export'),
    catalogs: can('catalogs.team') || can('catalogs.financiers') || can('catalogs.suppliers') || can('catalogs.brands'),
    canRegister: can('credit.create') || can('sales.create') || can('services.create') || can('clients.create') || can('payables.charges') || can('inventory.move'),
  };
}

export const useAccess = () => {
  const data = useData();
  return accessOf(data.me.permissions, data.me.owner && !data.viewer);
};

/** Datos que faltan en una venta, sin pedir lo que este usuario no ve. */
export function visibleMissing(missing: string[], access: Pick<Access, 'can'>) {
  const hidden = new Set<string>();
  if (!access.can('money.prices')) hidden.add('Valor de la venta');
  if (!access.can('money.financier')) hidden.add('Lo que pagó la financiera');
  if (!access.can('money.commissions')) hidden.add('Comisión');
  if (!access.can('money.costs')) hidden.add('Proveedores');
  return missing.filter((m) => !hidden.has(m));
}
