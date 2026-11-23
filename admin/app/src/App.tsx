/**
 * Estructura de la app: acceso, navegacion (barra lateral en escritorio,
 * pestanas abajo en el telefono), boton "+" y rutas.
 */
import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { BarChart3, Boxes, ChevronRight, ClipboardSignature, ShieldCheck, CreditCard, Eye, HandCoins, History, House, LayoutGrid, Lock, PackagePlus, Plus, Receipt, Settings, UserPlus, Users, Wrench } from 'lucide-react';
import { StoreProvider, useData, useStore } from './lib/store.tsx';
import { accessOf, type Access } from './lib/access.ts';
import { permissionsSummary } from '../../shared/domain.ts';
import { Link, matchRoute, navigate, useLocation } from './lib/router.tsx';
import { FeedbackProvider, Sheet } from './ui/sheet.tsx';
import { Avatar, IconBox, PrivacyToggle, Spinner } from './ui/kit.tsx';
import { useAmountsHidden } from './lib/privacy.ts';
import { Login } from './screens/Login.tsx';
import { Home } from './screens/Home.tsx';
import { Clients } from './screens/Clients.tsx';
import { ClientDetail } from './screens/ClientDetail.tsx';
import { ClientForm } from './screens/ClientForm.tsx';
import { Sales } from './screens/Sales.tsx';
import { SaleDetail } from './screens/SaleDetail.tsx';
import { SaleForm } from './screens/SaleForm.tsx';
import { Services } from './screens/Services.tsx';
import { ServiceForm } from './screens/ServiceForm.tsx';
import { Settings as SettingsScreen, CatalogScreen, PeopleScreen, AccountScreen } from './screens/Settings.tsx';
import { Payments } from './screens/Payments.tsx';

// Secciones que no se usan a diario: se descargan al abrirlas (la app inicial pesa menos).
const UsersScreen = lazy(() => import('./screens/Users.tsx').then((m) => ({ default: m.UsersScreen })));
const UserScreen = lazy(() => import('./screens/Users.tsx').then((m) => ({ default: m.UserScreen })));
const Payables = lazy(() => import('./screens/Payables.tsx').then((m) => ({ default: m.Payables })));
const PayableAccountScreen = lazy(() => import('./screens/Payables.tsx').then((m) => ({ default: m.PayableAccountScreen })));
const Inventory = lazy(() => import('./screens/Inventory.tsx').then((m) => ({ default: m.Inventory })));
const InventoryItemScreen = lazy(() => import('./screens/Inventory.tsx').then((m) => ({ default: m.InventoryItemScreen })));
const Reports = lazy(() => import('./screens/Reports.tsx').then((m) => ({ default: m.Reports })));
const WarrantyPrint = lazy(() => import('./screens/WarrantyPrint.tsx').then((m) => ({ default: m.WarrantyPrint })));
const InvoicePrint = lazy(() => import('./screens/InvoicePrint.tsx').then((m) => ({ default: m.InvoicePrint })));
const ServicePrint = lazy(() => import('./screens/ServicePrint.tsx').then((m) => ({ default: m.ServicePrint })));
const CreditList = lazy(() => import('./screens/Credit.tsx').then((m) => ({ default: m.CreditList })));
const CreditForm = lazy(() => import('./screens/Credit.tsx').then((m) => ({ default: m.CreditForm })));
const CreditDetail = lazy(() => import('./screens/Credit.tsx').then((m) => ({ default: m.CreditDetail })));
const ContractForm = lazy(() => import('./screens/Credit.tsx').then((m) => ({ default: m.ContractForm })));
const CreditPrint = lazy(() => import('./screens/CreditPrint.tsx').then((m) => ({ default: m.CreditPrint })));
const ContractPrint = lazy(() => import('./screens/CreditPrint.tsx').then((m) => ({ default: m.ContractPrint })));
const Audit = lazy(() => import('./screens/Audit.tsx').then((m) => ({ default: m.Audit })));

export function App() {
  return (
    <StoreProvider>
      <FeedbackProvider>
        <Gate />
      </FeedbackProvider>
    </StoreProvider>
  );
}

function Gate() {
  const { status, error, reload } = useStore();
  const { path } = useLocation();
  if (status === 'loading')
    return (
      <div className="splash">
        <Spinner />
      </div>
    );
  if (status === 'login') return <Login />;
  if (status === 'error')
    return (
      <div className="splash" style={{ textAlign: 'center', padding: 24 }}>
        <div>
          <p className="empty-title">No se pudo cargar</p>
          <p className="muted" style={{ margin: '6px 0 18px' }}>{error}</p>
          <button type="button" className="btn" onClick={() => reload().catch(() => {})}>
            Reintentar
          </button>
        </div>
      </div>
    );
  // Documentos para imprimir: pagina limpia, sin menus.
  const print = matchRoute('/imprimir/garantia/:id', path);
  if (print && /^\d+$/.test(print.id)) {
    return (
      <Suspense fallback={<div className="splash"><Spinner /></div>}>
        <WarrantyPrint id={Number(print.id)} />
      </Suspense>
    );
  }
  const printInvoice = matchRoute('/imprimir/factura/:id', path);
  if (printInvoice && /^\d+$/.test(printInvoice.id)) {
    return (
      <Suspense fallback={<div className="splash"><Spinner /></div>}>
        <InvoicePrint id={Number(printInvoice.id)} />
      </Suspense>
    );
  }
  const printCredit = matchRoute('/imprimir/credito/:id', path);
  if (printCredit && /^\d+$/.test(printCredit.id)) {
    return (
      <Suspense fallback={<div className="splash"><Spinner /></div>}>
        <CreditPrint id={Number(printCredit.id)} copy={new URLSearchParams(location.search).get('copia') === 'cliente'} />
      </Suspense>
    );
  }
  const printContract = matchRoute('/imprimir/autorizacion/:id', path);
  if (printContract && /^\d+$/.test(printContract.id)) {
    return (
      <Suspense fallback={<div className="splash"><Spinner /></div>}>
        <ContractPrint id={Number(printContract.id)} draft={new URLSearchParams(location.search).get('borrador') === '1'} justSigned={new URLSearchParams(location.search).get('firmado') === '1'} />
      </Suspense>
    );
  }
  const printService = matchRoute('/imprimir/servicio/:id', path);
  if (printService && /^\d+$/.test(printService.id)) {
    return (
      <Suspense fallback={<div className="splash"><Spinner /></div>}>
        <ServicePrint id={Number(printService.id)} />
      </Suspense>
    );
  }
  return <Shell />;
}

/* ------------------------------------------------------------------ */
/* Rutas                                                                */
/* ------------------------------------------------------------------ */

const ROUTES: [string, (p: Record<string, string>, q: URLSearchParams) => ReactNode][] = [
  ['/', () => <Home />],
  ['/clientes', () => <Clients />],
  ['/clientes/nuevo', () => <ClientForm />],
  ['/clientes/:id', (p) => <ClientDetail id={Number(p.id)} />],
  ['/clientes/:id/editar', (p) => <ClientForm id={Number(p.id)} />],
  ['/ventas', (_, q) => <Sales initialFilter={q.get('filtro')} />],
  ['/ventas/nueva', (_, q) => <SaleForm clientId={Number(q.get('cliente')) || null} legacy={q.get('anterior') === '1'} />],
  ['/ventas/:id', (p) => <SaleDetail id={Number(p.id)} />],
  ['/ventas/:id/editar', (p) => <SaleForm id={Number(p.id)} />],
  ['/servicio', (_, q) => <Services initialFilter={q.get('filtro')} />],
  ['/servicio/nuevo', (_, q) => <ServiceForm clientId={Number(q.get('cliente')) || null} saleId={Number(q.get('venta')) || null} />],
  ['/servicio/:id', (p) => <ServiceForm id={Number(p.id)} />],
  ['/creditos', (_, q) => <CreditList initialFilter={q.get('filtro')} />],
  ['/creditos/nueva', () => <CreditForm />],
  ['/creditos/:id', (p) => <CreditDetail id={Number(p.id)} />],
  ['/creditos/:id/editar', (p) => <CreditForm id={Number(p.id)} />],
  ['/creditos/:id/autorizacion', (p) => <ContractForm id={Number(p.id)} />],
  ['/pagos', (_, q) => <Payments initialTab={q.get('tab')} />],
  ['/pagar', (_, q) => <Payables action={q.get('nuevo')} />],
  ['/pagar/:id', (p) => <PayableAccountScreen id={Number(p.id)} />],
  ['/inventario', (_, q) => <Inventory action={q.get('nuevo')} />],
  ['/inventario/:id', (p) => <InventoryItemScreen id={Number(p.id)} />],
  ['/reportes', (_, q) => <Reports initial={q.get('r')} />],
  ['/actividad', (_, q) => <Audit initialUser={Number(q.get('usuario')) || null} />],
  ['/ajustes', () => <SettingsScreen />],
  ['/ajustes/equipo', () => <PeopleScreen />],
  ['/ajustes/financieras', () => <CatalogScreen table="financiers" />],
  ['/ajustes/proveedores', () => <CatalogScreen table="suppliers" />],
  ['/ajustes/marcas', () => <CatalogScreen table="brands" />],
  ['/ajustes/usuarios', () => <UsersScreen />],
  ['/ajustes/usuarios/:id', (p) => <UserScreen id={Number(p.id)} />],
  ['/ajustes/cuenta', () => <AccountScreen />],
];

/** Que permiso pide cada parte de la app (el servidor exige lo mismo). */
const ROUTE_ACCESS: [RegExp, (a: Access) => boolean][] = [
  [/^\/ventas\/nueva$/, (a) => a.can('sales.create')],
  [/^\/ventas\/\d+\/editar$/, (a) => a.canEdit('sales')],
  [/^\/ventas/, (a) => a.canSee('sales')],
  [/^\/servicio\/nuevo$/, (a) => a.can('services.create')],
  [/^\/servicio/, (a) => a.canSee('services')],
  [/^\/clientes\/nuevo$/, (a) => a.can('clients.create')],
  [/^\/clientes\/\d+\/editar$/, (a) => a.can('clients.edit')],
  [/^\/clientes/, (a) => a.can('clients.view')],
  [/^\/creditos/, (a) => a.can('credit.create') || a.can('credit.review')],
  [/^\/pagos/, (a) => a.canSee('payments')],
  [/^\/pagar/, (a) => a.canSee('payables')],
  [/^\/inventario/, (a) => a.canSee('inventory')],
  [/^\/reportes/, (a) => a.reports],
  [/^\/actividad/, (a) => a.owner],
  [/^\/ajustes\/usuarios/, (a) => a.admin],
  [/^\/ajustes\/equipo/, (a) => a.can('catalogs.team')],
  [/^\/ajustes\/financieras/, (a) => a.can('catalogs.financiers')],
  [/^\/ajustes\/proveedores/, (a) => a.can('catalogs.suppliers')],
  [/^\/ajustes\/marcas/, (a) => a.can('catalogs.brands')],
];

function resolve(path: string, query: URLSearchParams, access: Access) {
  const rule = ROUTE_ACCESS.find(([pattern]) => pattern.test(path));
  if (rule && !rule[1](access)) return { key: 'denied', node: <NoAccess /> };
  for (const [pattern, render] of ROUTES) {
    const params = matchRoute(pattern, path);
    // Los :id son numericos; "nuevo"/"nueva" son rutas fijas declaradas antes.
    if (params && Object.values(params).every((v) => /^\d+$/.test(v))) {
      return { key: pattern, node: render(params, query) };
    }
  }
  return { key: '404', node: <NotFound /> };
}

function NoAccess() {
  return (
    <div className="page">
      <div className="empty" style={{ paddingTop: 120 }}>
        <span className="empty-icon"><Lock size={40} /></span>
        <div className="empty-title">No tienes acceso a esta sección</div>
        <p className="muted" style={{ maxWidth: 320, margin: '0 auto' }}>Si la necesitas, pídele al administrador que te dé permiso.</p>
        <Link to="/" className="btn small secondary">Ir al inicio</Link>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page">
      <div className="empty" style={{ paddingTop: 120 }}>
        <div className="empty-title">Esta página no existe</div>
        <Link to="/" className="btn small secondary">Ir al inicio</Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navegacion                                                           */
/* ------------------------------------------------------------------ */

type NavItem = { to: string; label: string; short?: string; icon: typeof House; color: string; show: (a: Access) => boolean };

const NAV: NavItem[] = [
  { to: '/', label: 'Inicio', icon: House, color: '#0a72c2', show: () => true },
  { to: '/clientes', label: 'Clientes', icon: Users, color: '#0a72c2', show: (a) => a.can('clients.view') },
  { to: '/ventas', label: 'Ventas', icon: Receipt, color: '#0a72c2', show: (a) => a.canSee('sales') },
  { to: '/servicio', label: 'Servicio técnico', short: 'Servicio', icon: Wrench, color: '#ff9500', show: (a) => a.canSee('services') },
  { to: '/creditos', label: 'Créditos', icon: ClipboardSignature, color: '#1d9a46', show: (a) => a.can('credit.create') || a.can('credit.review') },
  { to: '/pagos', label: 'Pagos', icon: HandCoins, color: '#1d9a46', show: (a) => a.canSee('payments') },
  { to: '/pagar', label: 'Cuentas por pagar', short: 'Por pagar', icon: CreditCard, color: '#e5484d', show: (a) => a.canSee('payables') },
  { to: '/inventario', label: 'Inventario', icon: Boxes, color: '#6a3fdc', show: (a) => a.canSee('inventory') },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, color: '#16a3c4', show: (a) => a.reports },
  { to: '/actividad', label: 'Registro de actividad', short: 'Actividad', icon: ShieldCheck, color: '#1d1d1f', show: (a) => a.owner },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, color: '#8e8e93', show: () => true },
];

const isActive = (to: string, path: string) => (to === '/' ? path === '/' : path === to || path.startsWith(to + '/'));

function Shell() {
  const { path, query } = useLocation();
  const data = useData();
  const access = accessOf(data.me.permissions, data.me.owner && !data.viewer);
  // Al tapar o destapar los montos se vuelve a pintar todo con el formato nuevo.
  useAmountsHidden();
  const [plusOpen, setPlusOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const route = resolve(path, query, access);
  const openServices = data.services.filter((s) => s.status === 'open').length;
  // En los formularios del telefono se oculta la barra de pestanas: queda solo
  // la barra de Guardar, sin dos barras apiladas.
  const isForm = /^\/(ventas\/(nueva|\d+\/editar)|servicio\/(nuevo|\d+)|clientes\/(nuevo|\d+\/editar)|creditos\/(nueva|\d+\/editar|\d+\/autorizacion))$/.test(path);

  const pendingPayments = access.canSee('payments')
    ? data.sales.filter(
        (s) =>
          s.status === 'active' &&
          ((access.can('money.commissions') && (s.commission ?? 0) > 0 && !s.commissionPaid) || (access.can('money.financier') && s.paymentMethod === 'financed' && !s.fundedPaid))
      ).length
    : 0;
  const counts: Record<string, number | undefined> = {
    '/clientes': data.clients.length || undefined,
    '/servicio': openServices || undefined,
    '/pagos': pendingPayments || undefined,
  };

  const nav = NAV.filter((item) => item.show(access));
  // Telefono: Inicio + dos secciones principales + "Mas" con el resto.
  // Primero lo que puede registrar (un tecnico ve Servicio, no Ventas).
  const createsIn: Record<string, boolean> = { '/clientes': access.can('clients.create'), '/ventas': access.can('sales.create'), '/servicio': access.can('services.create') };
  const primary = nav
    .filter((item) => ['/clientes', '/ventas', '/servicio'].includes(item.to))
    .sort((x, y) => Number(createsIn[y.to]) - Number(createsIn[x.to]))
    .slice(0, 2)
    .sort((x, y) => ['/clientes', '/ventas', '/servicio'].indexOf(x.to) - ['/clientes', '/ventas', '/servicio'].indexOf(y.to));
  // Quien casi no tiene secciones (p. ej. "Solo creditos") ve Creditos abajo, a un toque.
  const creditTab = nav.find((item) => item.to === '/creditos');
  if (primary.length < 2 && creditTab) primary.push(creditTab);
  const more = nav.filter((item) => item.to !== '/' && !primary.includes(item));

  return (
    <div className={`app${isForm ? ' no-tabbar' : ''}${data.viewer ? ' previewing' : ''}`}>
      {data.viewer && <PreviewBar />}
      <aside className="sidebar">
        <Link to="/" className="brand brand-duo" aria-label="Inicio · Infinity Water y Magic Water">
          <span className="brand-logos">
            <img src="/admin/logo-infinity.webp" alt="Infinity Water" />
            <img src="/admin/logo-magic.webp" alt="Magic Water" />
          </span>
          <span className="brand-sub">Gestión del negocio</span>
        </Link>
        <nav className="sidebar-nav" aria-label="Secciones">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={`nav-item${isActive(to, path) ? ' active' : ''}`} aria-current={isActive(to, path) ? 'page' : undefined}>
              <Icon size={19} strokeWidth={2} />
              {label}
              {counts[to] != null && <span className="count">{counts[to]}</span>}
            </Link>
          ))}
        </nav>
        {access.canRegister && (
          <button type="button" className="btn" onClick={() => setPlusOpen(true)}>
            <Plus size={20} strokeWidth={2.5} />
            Registrar
          </button>
        )}
        {access.prices && <PrivacyToggle />}
        <div className="sidebar-foot">
          <Link to="/ajustes/cuenta" className={`account-card${path === '/ajustes/cuenta' ? ' active' : ''}`} aria-label={`Mi cuenta: ${data.me.name}`}>
            <Avatar name={data.me.name} photo={data.me.avatar} />
            <span className="account-text">
              <span className="account-name">{data.me.name}</span>
              <span className="account-sub">Mi cuenta · {data.me.username}</span>
            </span>
            <ChevronRight size={18} color="var(--text-3)" />
          </Link>
        </div>
      </aside>

      <main className="main" key={route.key + path}>
        <Suspense fallback={<div className="splash inline"><Spinner /></div>}>{route.node}</Suspense>
      </main>

      <nav className="tabbar" aria-label="Secciones">
        <TabLink {...NAV[0]} active={isActive('/', path)} />
        {primary[0] && <TabLink {...primary[0]} active={isActive(primary[0].to, path)} />}
        {access.canRegister && (
          <button type="button" className="tab" onClick={() => setPlusOpen(true)} aria-label="Registrar">
            <span className="tab-plus">
              <Plus size={26} strokeWidth={2.6} />
            </span>
          </button>
        )}
        {primary[1] && <TabLink {...primary[1]} active={isActive(primary[1].to, path)} />}
        <button type="button" className={`tab${more.some((item) => isActive(item.to, path)) ? ' active' : ''}`} onClick={() => setMoreOpen(true)} aria-label="Más secciones">
          <LayoutGrid size={24} strokeWidth={1.9} />
          Más
        </button>
      </nav>

      <PlusSheet open={plusOpen} onClose={() => setPlusOpen(false)} access={access} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} items={more} counts={counts} />
    </div>
  );
}

/** Vista previa: aviso fijo arriba con salida en un toque. */
function PreviewBar() {
  const data = useData();
  const { setPreview } = useStore();
  const id = data.me.id;
  const exit = async () => {
    await setPreview(null);
    navigate(`/ajustes/usuarios/${id}`, { replace: true, force: true });
  };
  return (
    <div className="preview-bar" role="status">
      <Eye size={18} />
      <span className="preview-text">
        <b>Así ve el sistema {data.me.name}</b>
        <span>{permissionsSummary(data.me.permissions)} · vista previa, no se guarda nada</span>
      </span>
      <button type="button" className="preview-exit" onClick={exit}>
        Salir
      </button>
    </div>
  );
}

/** "Mas" en el telefono: el resto de secciones como cuadricula de apps. */
function MoreSheet({ open, onClose, items, counts }: { open: boolean; onClose: () => void; items: NavItem[]; counts: Record<string, number | undefined> }) {
  const data = useData();
  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  return (
    <Sheet open={open} onClose={onClose} title="Más">
      <div className="app-grid">
        {items.map(({ to, label, short, icon: Icon, color }) => (
          <button key={to} type="button" className="app-tile" onClick={() => go(to)}>
            <span className="app-tile-icon" style={{ background: color }}>
              <Icon size={24} strokeWidth={2} />
              {counts[to] != null && <span className="app-tile-badge">{counts[to]}</span>}
            </span>
            <span className="app-tile-label">{short ?? label}</span>
          </button>
        ))}
      </div>
      <button type="button" className="account-card more-account" onClick={() => go('/ajustes/cuenta')}>
        <Avatar name={data.me.name} photo={data.me.avatar} />
        <span className="account-text">
          <span className="account-name">{data.me.name}</span>
          <span className="account-sub">Mi cuenta · {data.me.username}</span>
        </span>
        <ChevronRight size={18} color="var(--text-3)" />
      </button>
    </Sheet>
  );
}

function TabLink({ to, label, short, icon: Icon, active }: { to: string; label: string; short?: string; icon: typeof House; active: boolean; [key: string]: unknown }) {
  return (
    <Link to={to} className={`tab${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
      <Icon size={24} strokeWidth={active ? 2.3 : 1.9} />
      {short ?? label}
    </Link>
  );
}

/** El boton "+": las formas de registrar algo, segun los permisos. */
function PlusSheet({ open, onClose, access }: { open: boolean; onClose: () => void; access: Access }) {
  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  const all = [
    {
      to: '/ventas/nueva',
      show: access.can('sales.create'),
      icon: <Receipt size={22} />,
      color: 'var(--accent)',
      title: 'Venta nueva',
      text: 'La que hiciste hoy o esta semana.',
    },
    {
      to: '/ventas/nueva?anterior=1',
      show: access.can('sales.create'),
      icon: <History size={22} />,
      color: '#6a3fdc',
      title: 'Cliente anterior',
      text: 'Ponte al día: registra lo que tiene instalado, aunque falten datos.',
    },
    {
      to: '/creditos/nueva',
      show: access.can('credit.create') || access.can('credit.review'),
      icon: <ClipboardSignature size={22} />,
      color: '#1d9a46',
      title: 'Solicitud de crédito',
      text: 'En casa del cliente: fotos de las IDs, datos y firmas.',
    },
    {
      to: '/servicio/nuevo',
      show: access.can('services.create'),
      icon: <Wrench size={22} />,
      color: '#ff9500',
      title: 'Servicio técnico',
      text: 'Un cliente reporta un problema o toca mantenimiento.',
    },
    {
      to: '/clientes/nuevo',
      show: access.can('clients.create'),
      icon: <UserPlus size={22} />,
      color: '#34c759',
      title: 'Solo el cliente',
      text: 'Sus datos de contacto, sin venta todavía.',
    },
    {
      to: '/pagar?nuevo=cargo',
      show: access.can('payables.charges'),
      icon: <CreditCard size={22} />,
      color: '#e5484d',
      title: 'Gasto o cuenta por pagar',
      text: 'Una compra con tarjeta, una factura de proveedor, una cuota.',
    },
    {
      to: '/inventario?nuevo=movimiento',
      show: access.can('inventory.move'),
      icon: <PackagePlus size={22} />,
      color: '#6a3fdc',
      title: 'Inventario',
      text: 'Entra mercancía o sale para una instalación.',
    },
  ];
  const actions = all.filter((a) => a.show);
  // Con una sola opcion (p. ej. "Solo creditos"), el "+" va directo.
  useEffect(() => {
    if (open && actions.length === 1) go(actions[0].to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title="Registrar">
      <div className="action-list">
        {actions.map((action) => (
          <button key={action.to} type="button" className="action-card" onClick={() => go(action.to)}>
            <IconBox icon={action.icon} color={action.color} />
            <span>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 17 }}>{action.title}</span>
              <span className="muted" style={{ fontSize: 14.5 }}>{action.text}</span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

