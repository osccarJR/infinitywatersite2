/**
 * Permisos detallados de cada usuario (servidor y app).
 *
 * Cada accion es un interruptor propio ("sales.create", "money.commissions"...).
 * Las dependencias se corrigen solas en `normalizePermissions` (p. ej. quien
 * registra ventas tiene que poder verlas; las ganancias solo con todos los
 * montos), en un solo lugar para el servidor y la app.
 */

/* ------------------------------------------------------------------ */
/* Catalogo de permisos                                                 */
/* ------------------------------------------------------------------ */

export const REPORT_KEYS = ['summary', 'sellers', 'brands', 'equipment', 'financiers', 'receivables', 'technicians', 'service', 'cities', 'expenses', 'inventory'] as const;
export type ReportKey = (typeof REPORT_KEYS)[number];

export const FLAG_KEYS = [
  'clients.view',
  'clients.contact',
  'clients.create',
  'clients.edit',
  'clients.delete',
  'sales.view',
  'sales.create',
  'sales.edit',
  'sales.status',
  'sales.delete',
  'services.view',
  'services.create',
  'services.edit',
  'services.delete',
  'credit.create',
  'credit.review',
  'bank.manage',
  'money.prices',
  'money.financier',
  'money.commissions',
  'money.techpay',
  'money.costs',
  'money.profit',
  'payments.view',
  'payments.commissions',
  'payments.technicians',
  'payments.financiers',
  'payables.view',
  'payables.charges',
  'payables.pay',
  'payables.accounts',
  'payables.delete',
  'inventory.view',
  'inventory.move',
  'inventory.count',
  'inventory.products',
  'inventory.delete',
  ...REPORT_KEYS.map((k) => `report.${k}` as const),
  'export',
  'catalogs.team',
  'catalogs.financiers',
  'catalogs.suppliers',
  'catalogs.brands',
] as const;
export type PermissionFlag = (typeof FLAG_KEYS)[number];
export type Flags = Record<PermissionFlag, boolean>;

export interface Permissions {
  admin: boolean;
  /**
   * all: todo el negocio. own: solo lo suyo (las ventas que vendio o instalo,
   * los servicios que atendio y lo que registro), segun `personId`.
   */
  scope: 'all' | 'own';
  /** Persona del equipo que es este usuario: con ella ve su propia comision o su pago. */
  personId: number | null;
  flags: Flags;
  /** Cuentas por pagar que puede ver (null = todas). */
  payableAccounts: number[] | null;
  /** Perfiles marcados (se pueden combinar). Solo para mostrarlos. */
  profiles?: string[];
}

/** Secciones con sus interruptores, en el orden en que se muestran. */
export const PERMISSION_AREAS: { key: string; label: string; text: string; flags: { flag: PermissionFlag; label: string; hint?: string }[] }[] = [
  {
    key: 'clients',
    label: 'Clientes',
    text: 'La lista de clientes y sus datos',
    flags: [
      { flag: 'clients.view', label: 'Ver clientes' },
      { flag: 'clients.contact', label: 'Ver teléfono, correo y dirección', hint: 'Sin esto ve solo el nombre y la ciudad: no se puede llevar la lista de clientes.' },
      { flag: 'clients.create', label: 'Agregar clientes', hint: 'Al registrar una venta o un servicio también puede crear el cliente.' },
      { flag: 'clients.edit', label: 'Editar datos de clientes' },
    ],
  },
  {
    key: 'sales',
    label: 'Ventas',
    text: 'Ventas, instalaciones y mantenimientos',
    flags: [
      { flag: 'sales.view', label: 'Ver ventas' },
      { flag: 'sales.create', label: 'Registrar ventas', hint: 'Incluye clientes anteriores. Lo que registra lo puede corregir el mismo día.' },
      { flag: 'sales.edit', label: 'Editar ventas' },
      { flag: 'sales.status', label: 'Cancelar, declinar o marcar desinstalada' },
    ],
  },
  {
    key: 'services',
    label: 'Servicio técnico',
    text: 'Reportes de problemas, visitas y mantenimientos',
    flags: [
      { flag: 'services.view', label: 'Ver servicios' },
      { flag: 'services.create', label: 'Registrar servicios' },
      { flag: 'services.edit', label: 'Editar y cerrar servicios' },
    ],
  },
  {
    key: 'credit',
    label: 'Créditos',
    text: 'Solicitudes de crédito y autorizaciones de instalación',
    flags: [
      { flag: 'credit.create', label: 'Llenar solicitudes de crédito', hint: 'Ve solo las que llenó. Después de enviarla no ve el seguro social completo.' },
      { flag: 'credit.review', label: 'Aprobar o negar créditos', hint: 'Ve todas las solicitudes con el seguro social, la licencia y las fotos de las IDs. Solo para quien pasa los datos a la financiera.' },
    ],
  },
  {
    key: 'bank',
    label: 'Caja y bancos',
    text: 'Saldo y movimientos de caja y bancos',
    flags: [{ flag: 'bank.manage', label: 'Ver y registrar caja y bancos', hint: 'Lo que entra y sale de la caja y del banco. Solo para quien maneja el dinero: no viene en ningún perfil.' }],
  },
  {
    key: 'money',
    label: 'Montos',
    text: 'Qué cantidades de dinero ve',
    flags: [
      { flag: 'money.prices', label: 'Precios y cobros', hint: 'Valor de la venta, abono, lo cobrado al cliente y en servicios.' },
      { flag: 'money.financier', label: 'Financieras', hint: 'Lo que pagó la financiera y su descuento.' },
      { flag: 'money.commissions', label: 'Comisiones de todos', hint: 'Sin esto, quien vende ve solo la suya.' },
      { flag: 'money.techpay', label: 'Pagos a técnicos', hint: 'Sin esto, quien instala ve solo lo suyo.' },
      { flag: 'money.costs', label: 'Costos', hint: 'Proveedores de cada venta y costo del inventario.' },
      { flag: 'money.profit', label: 'Ganancias y márgenes', hint: 'Se calculan con todo lo anterior: al activarlo se activa todo.' },
    ],
  },
  {
    key: 'payments',
    label: 'Pagos',
    text: 'Comisiones, técnicos y financieras',
    flags: [
      { flag: 'payments.view', label: 'Ver lo pendiente', hint: 'Solo lo de los montos que puede ver.' },
      { flag: 'payments.commissions', label: 'Pagar comisiones', hint: 'Necesita ver las comisiones.' },
      { flag: 'payments.technicians', label: 'Pagar a técnicos', hint: 'Necesita ver los pagos a técnicos.' },
      { flag: 'payments.financiers', label: 'Registrar pagos de financieras', hint: 'Necesita ver lo de las financieras.' },
    ],
  },
  {
    key: 'payables',
    label: 'Cuentas por pagar',
    text: 'Tarjetas, proveedores y préstamos',
    flags: [
      { flag: 'payables.view', label: 'Ver cuentas por pagar' },
      { flag: 'payables.charges', label: 'Registrar y editar gastos' },
      { flag: 'payables.pay', label: 'Registrar pagos' },
      { flag: 'payables.accounts', label: 'Crear y editar cuentas', hint: 'Solo si ve todas las cuentas.' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventario',
    text: 'Productos, entradas, salidas y conteos',
    flags: [
      { flag: 'inventory.view', label: 'Ver inventario' },
      { flag: 'inventory.move', label: 'Registrar entradas y salidas' },
      { flag: 'inventory.count', label: 'Hacer conteos (ajustar existencia)' },
      { flag: 'inventory.products', label: 'Crear y editar productos' },
    ],
  },
  {
    key: 'reports',
    label: 'Reportes',
    text: 'Cuáles puede abrir (siempre con lo que puede ver)',
    flags: [
      { flag: 'report.summary', label: 'Resumen del negocio' },
      { flag: 'report.sellers', label: 'Vendedores' },
      { flag: 'report.brands', label: 'Marcas' },
      { flag: 'report.equipment', label: 'Qué se vende' },
      { flag: 'report.financiers', label: 'Financieras', hint: 'Necesita ver lo de las financieras.' },
      { flag: 'report.receivables', label: 'Cuentas por cobrar', hint: 'Necesita ver precios y financieras.' },
      { flag: 'report.technicians', label: 'Técnicos' },
      { flag: 'report.service', label: 'Servicio técnico' },
      { flag: 'report.cities', label: 'Ciudades' },
      { flag: 'report.expenses', label: 'Gastos y cuentas por pagar', hint: 'Necesita ver cuentas por pagar.' },
      { flag: 'report.inventory', label: 'Inventario', hint: 'Necesita ver el inventario.' },
    ],
  },
  {
    key: 'other',
    label: 'Excel y catálogos',
    text: 'Descargas y listas del negocio',
    flags: [
      { flag: 'export', label: 'Descargar a Excel', hint: 'Solo lo que puede ver.' },
      { flag: 'catalogs.team', label: 'Editar el equipo (vendedores y técnicos)' },
      { flag: 'catalogs.financiers', label: 'Editar financieras' },
      { flag: 'catalogs.suppliers', label: 'Editar proveedores' },
      { flag: 'catalogs.brands', label: 'Editar marcas' },
    ],
  },
];

const allFlags = (value: boolean) => Object.fromEntries(FLAG_KEYS.map((k) => [k, value])) as Flags;
const flagsOf = (list: readonly PermissionFlag[]) => {
  const flags = allFlags(false);
  for (const k of list) flags[k] = true;
  return flags;
};

export const ADMIN_PERMISSIONS: Permissions = { admin: true, scope: 'all', personId: null, flags: allFlags(true), payableAccounts: null };

/* ------------------------------------------------------------------ */
/* Perfiles                                                             */
/* ------------------------------------------------------------------ */

const ALL_REPORTS = REPORT_KEYS.map((k) => `report.${k}` as const);

export const PERMISSION_PRESETS: { key: string; label: string; text: string; scope: 'all' | 'own'; flags: PermissionFlag[] }[] = [
  {
    key: 'seller',
    label: 'Vendedor',
    text: 'Solo sus clientes y sus ventas, con el precio y su comisión. No ve ganancias ni lo de los demás.',
    scope: 'own',
    flags: ['clients.view', 'clients.contact', 'clients.create', 'clients.edit', 'sales.view', 'sales.create', 'sales.edit', 'services.view', 'credit.create', 'money.prices'],
  },
  {
    key: 'credit',
    label: 'Solo créditos',
    text: 'Solo la pantalla de Créditos: llena solicitudes y autorizaciones de instalación. No ve clientes, ventas ni montos del negocio.',
    scope: 'own',
    flags: ['credit.create'],
  },
  {
    key: 'technician',
    label: 'Técnico',
    text: 'Sus instalaciones y sus servicios, con la dirección y el equipo, y el inventario. Sin dinero.',
    scope: 'own',
    flags: ['clients.view', 'clients.contact', 'sales.view', 'services.view', 'services.create', 'services.edit', 'inventory.view', 'inventory.move'],
  },
  {
    key: 'office',
    label: 'Oficina',
    text: 'Registra clientes, ventas y servicios de todos, con precios. No ve ganancias, costos ni pagos.',
    scope: 'all',
    flags: [
      'clients.view', 'clients.contact', 'clients.create', 'clients.edit',
      'sales.view', 'sales.create', 'sales.edit', 'sales.status',
      'services.view', 'services.create', 'services.edit',
      'money.prices',
      'inventory.view', 'inventory.move', 'inventory.count', 'inventory.products',
      'report.summary', 'report.brands', 'report.equipment', 'report.service', 'report.cities', 'report.technicians',
      'catalogs.team', 'catalogs.financiers', 'catalogs.suppliers', 'catalogs.brands',
    ],
  },
  {
    key: 'cashier',
    label: 'Pagos y cobros',
    text: 'Paga comisiones y técnicos, cobra a financieras y lleva las tarjetas. No ve costos ni ganancias.',
    scope: 'all',
    flags: [
      'clients.view', 'clients.contact', 'sales.view', 'services.view',
      'money.prices', 'money.financier', 'money.commissions', 'money.techpay',
      'payments.view', 'payments.commissions', 'payments.technicians', 'payments.financiers',
      'payables.view', 'payables.charges', 'payables.pay',
      'report.summary', 'report.financiers', 'report.receivables', 'report.sellers', 'report.technicians', 'report.expenses',
    ],
  },
  {
    key: 'accountant',
    label: 'Contador',
    text: 'Ve todo el negocio con todos los montos, reportes y Excel. No puede cambiar nada.',
    scope: 'all',
    flags: [
      'clients.view', 'clients.contact', 'sales.view', 'services.view',
      'money.prices', 'money.financier', 'money.commissions', 'money.techpay', 'money.costs', 'money.profit',
      'payments.view', 'payables.view', 'inventory.view', ...ALL_REPORTS, 'export',
    ],
  },
];

export const PRESET_KEYS = PERMISSION_PRESETS.map((p) => p.key);

/* ------------------------------------------------------------------ */
/* Coherencia                                                           */
/* ------------------------------------------------------------------ */

const ACTIONS: Record<string, PermissionFlag[]> = {
  clients: ['clients.contact', 'clients.create', 'clients.edit', 'clients.delete'],
  sales: ['sales.create', 'sales.edit', 'sales.status', 'sales.delete'],
  services: ['services.create', 'services.edit', 'services.delete'],
  payments: ['payments.commissions', 'payments.technicians', 'payments.financiers'],
  payables: ['payables.charges', 'payables.pay', 'payables.accounts', 'payables.delete'],
  inventory: ['inventory.move', 'inventory.count', 'inventory.products', 'inventory.delete'],
};
const MONEY_PARTS: PermissionFlag[] = ['money.prices', 'money.financier', 'money.commissions', 'money.techpay', 'money.costs'];

/** Convierte los permisos de la primera version (niveles) a interruptores. */
function fromLegacy(r: any): Partial<Flags> {
  const lvl = (v: unknown) => (v === 'edit' ? 2 : v === 'view' ? 1 : 0);
  const f: Partial<Flags> = {};
  const clients = r.clients === 'edit' ? 2 : 1;
  f['clients.view'] = true;
  f['clients.contact'] = true;
  f['clients.create'] = f['clients.edit'] = clients === 2;
  f['clients.delete'] = Boolean(r.delete) && clients === 2 && r.scope === 'all';
  for (const sec of ['sales', 'services'] as const) {
    const l = lvl(r[sec]);
    f[`${sec}.view`] = l >= 1;
    f[`${sec}.create`] = f[`${sec}.edit`] = l === 2;
    f[`${sec}.delete`] = Boolean(r.delete) && l === 2;
  }
  f['sales.status'] = lvl(r.sales) === 2;
  f['money.prices'] = r.money === 'prices' || r.money === 'all';
  for (const k of ['money.financier', 'money.commissions', 'money.techpay', 'money.costs', 'money.profit'] as const) f[k] = r.money === 'all';
  f['payments.view'] = lvl(r.payments) >= 1;
  f['payments.commissions'] = f['payments.technicians'] = f['payments.financiers'] = lvl(r.payments) === 2;
  f['payables.view'] = lvl(r.payables) >= 1;
  f['payables.charges'] = f['payables.pay'] = f['payables.accounts'] = lvl(r.payables) === 2;
  f['payables.delete'] = Boolean(r.delete) && lvl(r.payables) === 2;
  f['inventory.view'] = lvl(r.inventory) >= 1;
  f['inventory.move'] = f['inventory.count'] = f['inventory.products'] = lvl(r.inventory) === 2;
  f['inventory.delete'] = Boolean(r.delete) && lvl(r.inventory) === 2;
  for (const k of ALL_REPORTS) f[k] = Boolean(r.reports);
  f.export = Boolean(r.export);
  for (const k of ['catalogs.team', 'catalogs.financiers', 'catalogs.suppliers', 'catalogs.brands'] as const) f[k] = Boolean(r.catalogs);
  return f;
}

/**
 * Permisos coherentes a partir de lo guardado o de lo que llega de la app.
 * Lo que no tiene sentido se corrige aqui (y solo aqui).
 */
export function normalizePermissions(raw: any, admin: boolean): Permissions {
  if (admin) return ADMIN_PERMISSIONS;
  const r = raw ?? {};
  const given: Partial<Flags> = r.flags && typeof r.flags === 'object' ? r.flags : typeof r.sales === 'string' ? fromLegacy(r) : {};
  const f = allFlags(false);
  for (const k of FLAG_KEYS) f[k] = given[k] === true;
  const scope: 'all' | 'own' = r.scope === 'all' ? 'all' : 'own';
  const personId = typeof r.personId === 'number' && Number.isInteger(r.personId) && r.personId > 0 ? r.personId : null;
  const payableAccounts: number[] | null = Array.isArray(r.payableAccounts)
    ? [...new Set<number>(r.payableAccounts.filter((x: unknown) => typeof x === 'number' && Number.isInteger(x) && x > 0))].sort((a, b) => a - b)
    : null;

  // Una accion implica poder ver su seccion.
  for (const [sec, actions] of Object.entries(ACTIONS)) if (actions.some((k) => f[k])) f[`${sec}.view` as PermissionFlag] = true;
  if (f['sales.view'] || f['services.view']) f['clients.view'] = true;
  // Ganancias: solo con todos los montos (con ellos se calcula la ganancia).
  f['money.profit'] = f['money.profit'] && MONEY_PARTS.every((k) => f[k]);
  // Pagos: cada uno con el monto que paga.
  f['payments.commissions'] &&= f['money.commissions'];
  f['payments.technicians'] &&= f['money.techpay'];
  f['payments.financiers'] &&= f['money.financier'];
  f['payments.view'] &&= f['sales.view'] && (f['money.commissions'] || f['money.techpay'] || f['money.financier'] || f['money.prices']);
  if (!f['payments.view']) for (const k of ACTIONS.payments) f[k] = false;
  if (!f['clients.view']) for (const k of ACTIONS.clients) f[k] = false;
  if (!f['sales.view']) for (const k of ACTIONS.sales) f[k] = false;
  if (!f['services.view']) for (const k of ACTIONS.services) f[k] = false;
  // Borrar un cliente borra todas sus ventas y servicios: solo con alcance total.
  f['clients.delete'] &&= scope === 'all';
  // Crear cuentas nuevas solo quien ve todas (si no, no veria la que crea).
  f['payables.accounts'] &&= payableAccounts === null;
  // Reportes que dependen de datos que no ve.
  const salesOrService = f['sales.view'] || f['services.view'];
  for (const k of ['report.summary', 'report.technicians'] as const) f[k] &&= salesOrService;
  for (const k of ['report.sellers', 'report.brands', 'report.equipment', 'report.cities'] as const) f[k] &&= f['sales.view'];
  f['report.financiers'] &&= f['sales.view'] && f['money.financier'];
  f['report.receivables'] &&= f['sales.view'] && f['money.financier'] && f['money.prices'];
  f['report.service'] &&= f['services.view'];
  f['report.expenses'] &&= f['payables.view'];
  f['report.inventory'] &&= f['inventory.view'];

  // Borrar es solo del dueno (superadministrador): nadie mas lo tiene.
  for (const k of FLAG_KEYS) if (k.endsWith('.delete')) f[k] = false;

  return {
    admin: false,
    scope,
    personId,
    flags: f,
    payableAccounts,
    ...(Array.isArray(r.profiles) ? { profiles: PRESET_KEYS.filter((k) => r.profiles.includes(k)) } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Perfiles combinables                                                 */
/* ------------------------------------------------------------------ */

/** Varios perfiles a la vez: lo mas amplio de cada uno ("todo el negocio" gana). */
export function mergePresets(keys: readonly string[], personId: number | null, payableAccounts: number[] | null = null): Permissions {
  const list = PERMISSION_PRESETS.filter((p) => keys.includes(p.key));
  const flags = flagsOf(list.flatMap((p) => p.flags));
  return normalizePermissions(
    { scope: list.some((p) => p.scope === 'all') ? 'all' : 'own', personId, flags, payableAccounts, profiles: [...keys] },
    false
  );
}

export const samePermissions = (a: Permissions, b: Permissions) =>
  a.admin === b.admin &&
  a.scope === b.scope &&
  FLAG_KEYS.every((k) => a.flags[k] === b.flags[k]) &&
  JSON.stringify(a.payableAccounts) === JSON.stringify(b.payableAccounts);

/** Perfiles marcados que no suman nada porque otro ya los incluye. */
export function redundantPresets(keys: string[]): string[] {
  if (keys.length < 2) return [];
  const all = mergePresets(keys, null);
  return keys.filter((k) => samePermissions(mergePresets(keys.filter((x) => x !== k), null), all));
}

/** Perfiles que dan exactamente estos permisos. ['admin'], o null si se ajusto a mano. */
export function presetsOf(p: Permissions): string[] | null {
  if (p.admin) return ['admin'];
  if (p.profiles?.length && samePermissions(mergePresets(p.profiles, p.personId, p.payableAccounts), p)) return p.profiles;
  const subsets: string[][] = [];
  for (let mask = 1; mask < 1 << PRESET_KEYS.length; mask++) subsets.push(PRESET_KEYS.filter((_, i) => mask & (1 << i)));
  subsets.sort((a, b) => a.length - b.length);
  for (const subset of subsets) if (samePermissions(mergePresets(subset, p.personId, p.payableAccounts), p)) return subset;
  return null;
}

/* ------------------------------------------------------------------ */
/* En palabras                                                          */
/* ------------------------------------------------------------------ */

export function moneySummary(p: Permissions) {
  const f = p.flags;
  if (f['money.profit']) return 'todos los montos';
  const parts = MONEY_PARTS.filter((k) => f[k]);
  if (!parts.length) return 'sin montos';
  if (parts.length === 1 && f['money.prices']) return 'solo precios';
  return 'montos parciales';
}

/** Resumen corto para la lista de usuarios ("Vendedor · solo lo suyo · solo precios"). */
export function permissionsSummary(p: Permissions): string {
  if (p.admin) return 'Administrador · todo';
  const presets = presetsOf(p);
  const label = presets ? presets.map((key) => PERMISSION_PRESETS.find((x) => x.key === key)!.label).join(' + ') : 'Personalizado';
  return `${label} · ${p.scope === 'own' ? 'solo lo suyo' : 'todo el negocio'} · ${moneySummary(p)}`;
}

/** Cuantos interruptores de una seccion estan activos (para la lista del editor). */
export function areaSummary(p: Permissions, areaKey: string): string {
  const area = PERMISSION_AREAS.find((a) => a.key === areaKey)!;
  const on = area.flags.filter((x) => p.flags[x.flag]);
  if (!on.length) return areaKey === 'money' ? 'Ningún monto' : 'Sin acceso';
  if (on.length === area.flags.length) return areaKey === 'money' ? 'Todos los montos' : 'Todo';
  if (areaKey === 'reports') return `${on.length} de ${area.flags.length}`;
  const short: Partial<Record<PermissionFlag, string>> = {
    'clients.view': 'Ver', 'clients.contact': 'contacto', 'clients.create': 'agregar', 'clients.edit': 'editar', 'clients.delete': 'borrar',
    'sales.view': 'Ver', 'sales.create': 'registrar', 'sales.edit': 'editar', 'sales.status': 'cancelar', 'sales.delete': 'borrar',
    'services.view': 'Ver', 'services.create': 'registrar', 'services.edit': 'editar', 'services.delete': 'borrar',
    'credit.create': 'Llenar', 'credit.review': 'aprobar',
    'bank.manage': 'Ver y registrar',
    'money.prices': 'Precios', 'money.financier': 'financieras', 'money.commissions': 'comisiones', 'money.techpay': 'técnicos', 'money.costs': 'costos', 'money.profit': 'ganancias',
    'payments.view': 'Ver', 'payments.commissions': 'comisiones', 'payments.technicians': 'técnicos', 'payments.financiers': 'financieras',
    'payables.view': 'Ver', 'payables.charges': 'gastos', 'payables.pay': 'pagos', 'payables.accounts': 'cuentas', 'payables.delete': 'borrar',
    'inventory.view': 'Ver', 'inventory.move': 'entradas y salidas', 'inventory.count': 'conteos', 'inventory.products': 'productos', 'inventory.delete': 'borrar',
    export: 'Excel', 'catalogs.team': 'equipo', 'catalogs.financiers': 'financieras', 'catalogs.suppliers': 'proveedores', 'catalogs.brands': 'marcas',
  };
  const text = on.map((x) => short[x.flag] ?? x.label).join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
