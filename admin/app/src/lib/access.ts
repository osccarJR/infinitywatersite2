/**
 * Lo que el usuario puede hacer, para mostrar u ocultar partes de la
 * pantalla. Es solo presentacion: el servidor aplica los mismos permisos.
 */
import type { Permissions } from '../../../shared/domain.ts';
import { useData } from './store.tsx';

export interface Access extends Permissions {
  /** Ve lo que paga el cliente (valor de venta, abono, cobro de servicio). */
  prices: boolean;
  /** Ve todo el dinero: ganancias, costos, comisiones, financieras. */
  costs: boolean;
  canEdit: (section: 'clients' | 'sales' | 'services' | 'payments' | 'payables' | 'inventory') => boolean;
  canSee: (section: 'sales' | 'services' | 'payments' | 'payables' | 'inventory') => boolean;
  /** Puede registrar algo con el boton "+". */
  canRegister: boolean;
}

export function accessOf(p: Permissions): Access {
  const canEdit: Access['canEdit'] = (section) => p[section] === 'edit';
  return {
    ...p,
    prices: p.money !== 'none',
    costs: p.money === 'all',
    canEdit,
    canSee: (section) => p[section] !== 'none',
    canRegister: p.sales === 'edit' || p.services === 'edit' || p.clients === 'edit',
  };
}

export const useAccess = () => accessOf(useData().me.permissions);

/** Datos que faltan en una venta, sin pedir lo que este usuario no ve. */
export function visibleMissing(missing: string[], access: Pick<Access, 'prices' | 'costs'>) {
  const hidden = new Set<string>();
  if (!access.costs) ['Lo que pagó la financiera', 'Comisión', 'Proveedores'].forEach((x) => hidden.add(x));
  if (!access.prices) hidden.add('Valor de la venta');
  return missing.filter((m) => !hidden.has(m));
}
