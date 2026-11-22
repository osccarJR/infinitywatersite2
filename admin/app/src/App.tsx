/**
 * Estructura de la app: acceso, navegacion (barra lateral en escritorio,
 * pestanas abajo en el telefono), boton "+" y rutas.
 */
import { useState, type ReactNode } from 'react';
import { ChevronRight, HandCoins, History, House, Plus, Receipt, Settings, UserPlus, Users, Wrench } from 'lucide-react';
import { StoreProvider, useData, useStore } from './lib/store.tsx';
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
import { Settings as SettingsScreen, CatalogScreen, PeopleScreen, UsersScreen, AccountScreen } from './screens/Settings.tsx';
import { Payments } from './screens/Payments.tsx';

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
  ['/pagos', (_, q) => <Payments initialTab={q.get('tab')} />],
  ['/ajustes', () => <SettingsScreen />],
  ['/ajustes/equipo', () => <PeopleScreen />],
  ['/ajustes/financieras', () => <CatalogScreen table="financiers" />],
  ['/ajustes/proveedores', () => <CatalogScreen table="suppliers" />],
  ['/ajustes/marcas', () => <CatalogScreen table="brands" />],
  ['/ajustes/usuarios', () => <UsersScreen />],
  ['/ajustes/cuenta', () => <AccountScreen />],
];

function resolve(path: string, query: URLSearchParams) {
  for (const [pattern, render] of ROUTES) {
    const params = matchRoute(pattern, path);
    // Los :id son numericos; "nuevo"/"nueva" son rutas fijas declaradas antes.
    if (params && Object.values(params).every((v) => /^\d+$/.test(v))) {
      return { key: pattern, node: render(params, query) };
    }
  }
  return { key: '404', node: <NotFound /> };
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

const NAV = [
  { to: '/', label: 'Inicio', icon: House },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/ventas', label: 'Ventas', icon: Receipt },
  { to: '/servicio', label: 'Servicio técnico', short: 'Servicio', icon: Wrench },
  { to: '/pagos', label: 'Pagos', icon: HandCoins },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
];

const isActive = (to: string, path: string) => (to === '/' ? path === '/' : path === to || path.startsWith(to + '/'));

function Shell() {
  const { path, query } = useLocation();
  const data = useData();
  // Al tapar o destapar los montos se vuelve a pintar todo con el formato nuevo.
  useAmountsHidden();
  const [plusOpen, setPlusOpen] = useState(false);
  const route = resolve(path, query);
  const openServices = data.services.filter((s) => s.status === 'open').length;
  // En los formularios del telefono se oculta la barra de pestanas: queda solo
  // la barra de Guardar, sin dos barras apiladas.
  const isForm = /^\/(ventas\/(nueva|\d+\/editar)|servicio\/(nuevo|\d+)|clientes\/(nuevo|\d+\/editar))$/.test(path);

  const pendingPayments = data.sales.filter((s) => s.status === 'active' && (((s.commission ?? 0) > 0 && !s.commissionPaid) || (s.paymentMethod === 'financed' && !s.fundedPaid))).length;
  const counts: Record<string, number | undefined> = {
    '/clientes': data.clients.length || undefined,
    '/servicio': openServices || undefined,
    '/pagos': pendingPayments || undefined,
  };

  return (
    <div className={`app${isForm ? ' no-tabbar' : ''}`}>
      <aside className="sidebar">
        <Link to="/" className="brand brand-duo" aria-label="Inicio · Infinity Water y Magic Water">
          <span className="brand-logos">
            <img src="/admin/logo-infinity.webp" alt="Infinity Water" />
            <img src="/admin/logo-magic.webp" alt="Magic Water" />
          </span>
          <span className="brand-sub">Gestión del negocio</span>
        </Link>
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={`nav-item${isActive(to, path) ? ' active' : ''}`} aria-current={isActive(to, path) ? 'page' : undefined}>
            <Icon size={19} strokeWidth={2} />
            {label}
            {counts[to] != null && <span className="count">{counts[to]}</span>}
          </Link>
        ))}
        <button type="button" className="btn" onClick={() => setPlusOpen(true)}>
          <Plus size={20} strokeWidth={2.5} />
          Registrar
        </button>
        <PrivacyToggle />
        <div className="sidebar-foot">
          <Link to="/ajustes/cuenta" className={`account-card${path === '/ajustes/cuenta' ? ' active' : ''}`} aria-label={`Mi cuenta: ${data.me.name}`}>
            <Avatar name={data.me.name} />
            <span className="account-text">
              <span className="account-name">{data.me.name}</span>
              <span className="account-sub">Mi cuenta · {data.me.username}</span>
            </span>
            <ChevronRight size={18} color="var(--text-3)" />
          </Link>
        </div>
      </aside>

      <main className="main" key={route.key + path}>
        {route.node}
      </main>

      <nav className="tabbar" aria-label="Secciones">
        {NAV.slice(0, 2).map((item) => (
          <TabLink key={item.to} {...item} active={isActive(item.to, path)} />
        ))}
        <button type="button" className="tab" onClick={() => setPlusOpen(true)} aria-label="Registrar">
          <span className="tab-plus">
            <Plus size={26} strokeWidth={2.6} />
          </span>
        </button>
        {NAV.slice(2, 4).map((item) => (
          <TabLink key={item.to} {...item} active={isActive(item.to, path)} />
        ))}
      </nav>

      <PlusSheet open={plusOpen} onClose={() => setPlusOpen(false)} />
    </div>
  );
}

function TabLink({ to, label, short, icon: Icon, active }: { to: string; label: string; short?: string; icon: typeof House; active: boolean }) {
  return (
    <Link to={to} className={`tab${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
      <Icon size={24} strokeWidth={active ? 2.3 : 1.9} />
      {short ?? label}
    </Link>
  );
}

/** El boton "+": las cuatro formas de registrar algo. */
function PlusSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  const actions = [
    {
      to: '/ventas/nueva',
      icon: <Receipt size={22} />,
      color: 'var(--accent)',
      title: 'Venta nueva',
      text: 'La que hiciste hoy o esta semana.',
    },
    {
      to: '/ventas/nueva?anterior=1',
      icon: <History size={22} />,
      color: '#6a3fdc',
      title: 'Cliente anterior',
      text: 'Ponte al día: registra lo que tiene instalado, aunque falten datos.',
    },
    {
      to: '/servicio/nuevo',
      icon: <Wrench size={22} />,
      color: '#ff9500',
      title: 'Servicio técnico',
      text: 'Un cliente reporta un problema o toca mantenimiento.',
    },
    {
      to: '/clientes/nuevo',
      icon: <UserPlus size={22} />,
      color: '#34c759',
      title: 'Solo el cliente',
      text: 'Sus datos de contacto, sin venta todavía.',
    },
  ];
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

