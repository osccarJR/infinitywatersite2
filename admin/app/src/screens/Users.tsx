/**
 * Usuarios y permisos (solo administradores).
 *
 * Cada usuario tiene un perfil (Vendedor, Tecnico, Oficina, Contador) que se
 * puede ajustar punto por punto, y un boton "Ver como" que abre el sistema
 * exactamente como lo ve esa persona, sin poder guardar nada.
 */
import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, KeyRound, Plus, ShieldCheck, UserCog, X } from 'lucide-react';
import type { Permissions, User } from '../../../shared/domain.ts';
import { ADMIN_PERMISSIONS, PERMISSION_PRESETS, normalizePermissions, permissionsSummary, presetOf } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { navigate, useLeaveGuard } from '../lib/router.tsx';
import { api } from '../lib/api.ts';
import { dateWithYear, localDate } from '../lib/format.ts';
import { Avatar, Badge, Empty, Group, Page, Row, SegmentedRow, SwitchRow, TextField } from '../ui/kit.tsx';
import { Picker, Sheet, useFeedback } from '../ui/sheet.tsx';
import { PickerRow } from '../ui/pickers.tsx';

type Role = 'admin' | 'member';

/** Contrasena facil de dictar: cuatro bloques de cuatro, sin letras que se confundan. */
function suggestPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join('')).join('-');
}

function useUsers() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<{ users: User[] }>('/users')
      .then((r) => setUsers(r.users))
      .catch((err) => setError(err.message));
  }, []);
  return { users, setUsers, error };
}

/* ------------------------------------------------------------------ */
/* Lista                                                                */
/* ------------------------------------------------------------------ */

export function UsersScreen() {
  const data = useData();
  const { users, setUsers, error } = useUsers();
  const [adding, setAdding] = useState(false);

  return (
    <Page
      title="Usuarios"
      subtitle="Quién entra al sistema y qué puede ver"
      back={{ label: 'Ajustes', to: '/ajustes' }}
      actions={
        <button type="button" className="icon-btn" onClick={() => setAdding(true)} aria-label="Agregar usuario">
          <Plus size={24} />
        </button>
      }
      narrow
    >
      {error && <p className="field-error">{error}</p>}
      {users && (
        <Group footer="Toca un usuario para cambiar sus permisos o ver el sistema tal como lo ve esa persona. Cada cambio queda registrado con el nombre de quien lo hizo.">
          {users.map((user) => (
            <Row
              key={user.id}
              to={`/ajustes/usuarios/${user.id}`}
              leading={<Avatar name={user.name} />}
              title={
                <>
                  {user.name} {user.id === data.me.id && <Badge tone="blue">Tú</Badge>} {!user.active && <Badge>Desactivado</Badge>}
                </>
              }
              subtitle={
                <>
                  <span style={{ display: 'block' }}>{permissionsSummary(user.permissions)}</span>
                  <span className="faint">
                    {user.username} · {user.lastLoginAt ? `último acceso ${dateWithYear(localDate(user.lastLoginAt))}` : 'nunca ha entrado'}
                  </span>
                </>
              }
            />
          ))}
        </Group>
      )}
      {!users && !error && <Empty title="Cargando usuarios…" />}
      <NewUserSheet open={adding} onClose={() => setAdding(false)} onSaved={setUsers} />
    </Page>
  );
}

function NewUserSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (users: User[]) => void }) {
  const data = useData();
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [preset, setPreset] = useState<string>('seller');
  const [personId, setPersonId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: number; username: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ name: '', username: '', password: suggestPassword() });
    setPreset('seller');
    setPersonId(null);
    setError(null);
    setCreated(null);
  }, [open]);

  // Si el nombre coincide con alguien del equipo, se sugiere solo.
  useEffect(() => {
    if (personId != null || form.name.trim().length < 3) return;
    const match = data.people.find((p) => p.active && p.name.toLowerCase().startsWith(form.name.trim().toLowerCase()));
    if (match) setPersonId(match.id);
  }, [form.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = PERMISSION_PRESETS.find((p) => p.key === preset);
  const needsPerson = chosen?.permissions.scope === 'own';

  const save = async () => {
    setError(null);
    if (needsPerson && !personId) return setError('Elige quién es en el equipo: así el sistema sabe cuáles son sus ventas y sus servicios.');
    setBusy(true);
    try {
      const role: Role = preset === 'admin' ? 'admin' : 'member';
      const permissions = chosen ? { ...chosen.permissions, personId } : undefined;
      const { users, id } = await api<{ users: User[]; id: number }>('/users', {
        method: 'POST',
        body: { username: form.username, name: form.name, password: form.password, role, ...(permissions ? { permissions } : {}) },
      });
      onSaved(users);
      setCreated({ id, username: form.username, password: form.password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <Sheet open={open} onClose={onClose} title="Usuario creado" left={<span />} right={<button type="button" className="link-btn strong" onClick={onClose}>OK</button>}>
        <p className="muted" style={{ textAlign: 'center', marginBottom: 16 }}>Pásale estos datos a la persona. La contraseña no se vuelve a mostrar.</p>
        <Group>
          <Row title="Usuario" value={<b style={{ color: 'var(--text)' }}>{created.username}</b>} />
          <Row title="Contraseña" value={<b style={{ color: 'var(--text)', fontFamily: 'ui-monospace, monospace' }}>{created.password}</b>} />
          <Row title="Dirección" value={<span style={{ fontSize: 14 }}>{location.origin}/admin</span>} />
        </Group>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <button type="button" className="btn block" onClick={() => { onClose(); navigate(`/ajustes/usuarios/${created.id}`); }}>
            <ShieldCheck size={18} /> Revisar sus permisos
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nuevo usuario"
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save} disabled={busy}>Crear</button>}
    >
      <Group>
        <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Nombre" maxLength={80} autoFocus />
        <TextField label="Usuario" value={form.username} onChange={(username) => setForm({ ...form, username: username.toLowerCase().replace(/\s/g, '') })} placeholder="ej. carlos" maxLength={40} />
        <TextField label="Contraseña" value={form.password} onChange={(password) => setForm({ ...form, password })} />
      </Group>
      <div className="group-label">Qué hace en el negocio</div>
      <PresetCards value={preset} onChange={setPreset} />
      {needsPerson && (
        <Group footer="Verá solo las ventas, instalaciones y servicios de esta persona.">
          <TeamPicker value={personId} onChange={setPersonId} />
        </Group>
      )}
      <p className="group-foot">Después puedes ajustar cada permiso por separado.</p>
      {error && <p className="field-error">{error}</p>}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Perfiles                                                             */
/* ------------------------------------------------------------------ */

const ADMIN_CARD = { key: 'admin', label: 'Administrador', text: 'Todo: dinero, pagos, usuarios y respaldo. Como tú.' };

function PresetCards({ value, onChange, custom }: { value: string | null; onChange: (key: string) => void; custom?: boolean }) {
  const cards = [...PERMISSION_PRESETS, ADMIN_CARD];
  return (
    <div className="preset-grid" role="radiogroup" aria-label="Perfil">
      {cards.map((card) => (
        <button key={card.key} type="button" role="radio" aria-checked={value === card.key} className={`preset-card${value === card.key ? ' on' : ''}`} onClick={() => onChange(card.key)}>
          <span className="preset-head">
            <b>{card.label}</b>
            <span className="preset-check">{value === card.key && <Check size={14} strokeWidth={3} />}</span>
          </span>
          <span className="preset-text">{card.text}</span>
        </button>
      ))}
      {custom && (
        <div className="preset-card on custom">
          <span className="preset-head">
            <b>Personalizado</b>
            <span className="preset-check"><Check size={14} strokeWidth={3} /></span>
          </span>
          <span className="preset-text">Ajustado a mano, punto por punto (abajo).</span>
        </div>
      )}
    </div>
  );
}

function TeamPicker({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
  const data = useData();
  const [open, setOpen] = useState(false);
  const options = data.people
    .filter((p) => p.active || p.id === value)
    .map((p) => ({ id: p.id, label: p.name, sublabel: [p.isSeller && 'Vende', p.isInstaller && 'Instala'].filter(Boolean).join(' · '), inactive: !p.active }));
  return (
    <>
      <PickerRow field="permissions.personId" label="Quién es en el equipo" value={value ? data.personById.get(value)?.name : null} placeholder="Elegir" onOpen={() => setOpen(true)} />
      <Picker open={open} onClose={() => setOpen(false)} title="Quién es en el equipo" options={options} value={value} onSelect={onChange} empty="Agrega primero a la persona en Ajustes → Equipo." />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Un usuario: permisos, acceso y "Ver como"                             */
/* ------------------------------------------------------------------ */

const LEVEL_OPTIONS = [
  { value: 'none' as const, label: 'No' },
  { value: 'view' as const, label: 'Ver' },
  { value: 'edit' as const, label: 'Ver y editar' },
];

export function UserScreen({ id }: { id: number }) {
  const data = useData();
  const { setPreview } = useStore();
  const { toast, confirm } = useFeedback();
  const { users, setUsers, error: loadError } = useUsers();
  const user = users?.find((u) => u.id === id);

  const [role, setRole] = useState<Role>('member');
  const [perms, setPerms] = useState<Permissions>(ADMIN_PERMISSIONS);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [access, setAccess] = useState<'name' | 'password' | null>(null);

  useEffect(() => {
    if (!user) return;
    const p = user.role === 'admin' ? { ...PERMISSION_PRESETS[2].permissions, personId: null } : user.permissions;
    setRole(user.role);
    setPerms(normalizePermissions(p, false));
    setSaved(JSON.stringify({ role: user.role, p: normalizePermissions(p, false) }));
  }, [user]);

  const current = JSON.stringify({ role, p: perms });
  const dirty = Boolean(user) && current !== saved;
  useLeaveGuard(
    () => dirty,
    () => confirm({ title: '¿Salir sin guardar los permisos?', confirm: 'Salir sin guardar', cancel: 'Seguir editando', danger: true })
  );

  const effective = role === 'admin' ? ADMIN_PERMISSIONS : perms;
  const presetKey = role === 'admin' ? 'admin' : presetOf(perms);
  const set = <K extends keyof Permissions>(key: K, value: Permissions[K]) => setPerms((p) => normalizePermissions({ ...p, [key]: value }, false));
  const isMe = user?.id === data.me.id;

  const choosePreset = (key: string) => {
    if (key === 'admin') return setRole('admin');
    const preset = PERMISSION_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setRole('member');
    setPerms((p) => normalizePermissions({ ...preset.permissions, personId: p.personId }, false));
  };

  const save = async () => {
    if (!user) return;
    setError(null);
    if (role === 'member' && perms.scope === 'own' && !perms.personId) {
      return setError('Con “solo lo suyo”, elige quién es en el equipo: así el sistema sabe cuáles son sus ventas y servicios.');
    }
    setBusy(true);
    try {
      const { users: next } = await api<{ users: User[] }>(`/users/${user.id}`, { method: 'PUT', body: { role, ...(role === 'member' ? { permissions: perms } : {}) } });
      setUsers(next);
      toast('Permisos guardados');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const previewAs = async () => {
    if (!user) return;
    if (dirty && !(await confirm({ title: 'Guarda primero', message: 'La vista previa muestra los permisos guardados, no los que estás cambiando.', confirm: 'Ver igual', cancel: 'Volver' }))) return;
    await setPreview({ id: user.id, name: user.name });
    navigate('/', { force: true });
  };

  const toggleActive = async () => {
    if (!user) return;
    const turningOff = user.active;
    if (turningOff && !(await confirm({ title: `¿Quitarle el acceso a ${user.name}?`, message: 'Se cierra su sesión en todos sus equipos. Sus registros se conservan.', confirm: 'Quitar acceso', danger: true }))) return;
    try {
      const { users: next } = await api<{ users: User[] }>(`/users/${user.id}`, { method: 'PUT', body: { active: !user.active } });
      setUsers(next);
      toast(turningOff ? 'Ya no puede entrar' : 'Puede entrar de nuevo');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  if (loadError) return <Page title="Usuario" back={{ label: 'Usuarios', to: '/ajustes/usuarios' }}><p className="field-error">{loadError}</p></Page>;
  if (!users) return <Page title="Usuario" back={{ label: 'Usuarios', to: '/ajustes/usuarios' }} narrow><Empty title="Cargando…" /></Page>;
  if (!user) return <Page title="Usuario" back={{ label: 'Usuarios', to: '/ajustes/usuarios' }} narrow><Empty title="Este usuario no existe" /></Page>;

  return (
    <Page title={user.name} hideTitle back={{ label: 'Usuarios', to: '/ajustes/usuarios' }} narrow>
      <div className="hero-head">
        <Avatar name={user.name} size="lg" />
        <h1 className="large-title">{user.name}</h1>
        <p className="muted">
          {user.username} · {user.lastLoginAt ? `último acceso ${dateWithYear(localDate(user.lastLoginAt))}` : 'nunca ha entrado'}
          {!user.active && <> · <Badge tone="red">Sin acceso</Badge></>}
        </p>
      </div>

      {!isMe && user.role !== 'admin' && (
        <button type="button" className="preview-cta" onClick={previewAs}>
          <span className="preview-cta-icon"><Eye size={22} /></span>
          <span>
            <b>Ver el sistema como {user.name.split(' ')[0]}</b>
            <span>Lo mismo que ve en su teléfono, con sus permisos. Sin riesgo: no se guarda nada.</span>
          </span>
        </button>
      )}

      <div className="group-label">Perfil</div>
      <PresetCards value={presetKey} onChange={isMe ? () => toast('Tu propio acceso no se puede reducir.', 'error') : choosePreset} custom={!presetKey} />
      {isMe && role === 'admin' && <p className="group-foot">Eres administrador. Para no quedarte fuera, tu propio acceso no se puede reducir.</p>}

      {role === 'member' && (
        <>
          <Group label="Qué ve" footer={perms.scope === 'own' ? 'Solo lo suyo: las ventas que vendió o instaló, los servicios que atendió, lo que registró desde su usuario y los clientes de todo eso.' : undefined}>
            <SegmentedRow
              title="Alcance"
              options={[
                { value: 'all', label: 'Todo el negocio' },
                { value: 'own', label: 'Solo lo suyo' },
              ]}
              value={perms.scope}
              onChange={(v) => set('scope', v)}
            />
            {perms.scope === 'own' && <TeamPicker value={perms.personId} onChange={(v) => set('personId', v)} />}
            <SegmentedRow
              title="Clientes"
              options={[
                { value: 'view', label: 'Ver' },
                { value: 'edit', label: 'Ver y editar' },
              ]}
              value={perms.clients}
              onChange={(v) => set('clients', v)}
            />
            <SegmentedRow title="Ventas" options={LEVEL_OPTIONS} value={perms.sales} onChange={(v) => set('sales', v)} />
            <SegmentedRow title="Servicio técnico" options={LEVEL_OPTIONS} value={perms.services} onChange={(v) => set('services', v)} />
            <SegmentedRow title="Inventario" options={LEVEL_OPTIONS} value={perms.inventory} onChange={(v) => set('inventory', v)} />
          </Group>

          <Group label="Dinero" footer={perms.money !== 'all' ? 'Pagos y cuentas por pagar solo se pueden dar a quien ve todos los montos.' : 'Ve ganancias, costos, comisiones y lo que pagan las financieras.'}>
            <SegmentedRow
              title="Montos"
              options={[
                { value: 'none', label: 'Ninguno' },
                { value: 'prices', label: 'Solo precios' },
                { value: 'all', label: 'Todo' },
              ]}
              value={perms.money}
              onChange={(v) => set('money', v)}
            />
            {perms.money === 'all' && (
              <>
                <SegmentedRow title="Pagos" subtitle="comisiones, técnicos, financieras" options={LEVEL_OPTIONS} value={perms.payments} onChange={(v) => set('payments', v)} />
                <SegmentedRow title="Cuentas por pagar" subtitle="tarjetas y proveedores" options={LEVEL_OPTIONS} value={perms.payables} onChange={(v) => set('payables', v)} />
              </>
            )}
          </Group>

          <Group label="Además">
            <SwitchRow label="Reportes" subtitle="Solo con lo que puede ver" checked={perms.reports} onChange={(v) => set('reports', v)} />
            <SwitchRow label="Descargar a Excel" subtitle="Solo lo que puede ver" checked={perms.export} onChange={(v) => set('export', v)} />
            <SwitchRow label="Borrar registros" subtitle="Ventas, servicios y gastos que puede editar" checked={perms.delete} onChange={(v) => set('delete', v)} />
            <SwitchRow label="Editar catálogos" subtitle="Equipo, financieras, proveedores y marcas" checked={perms.catalogs} onChange={(v) => set('catalogs', v)} />
          </Group>
        </>
      )}

      <PermissionSummary p={effective} name={user.name.split(' ')[0]} />

      <Group label="Acceso">
        <Row onClick={() => setAccess('name')} leading={<UserCog size={19} color="var(--text-2)" />} title="Cambiar nombre" value={user.name} />
        <Row onClick={() => setAccess('password')} leading={<KeyRound size={19} color="var(--text-2)" />} title="Nueva contraseña" />
        {!isMe && (
          <button type="button" className={`row ${user.active ? 'danger' : 'action'}`} onClick={toggleActive}>
            {user.active ? 'Quitarle el acceso' : 'Devolverle el acceso'}
          </button>
        )}
      </Group>

      {(dirty || error) && (
        <div className="save-bar">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="button" className="btn gray" onClick={() => { const s = JSON.parse(saved); setRole(s.role); setPerms(s.p); setError(null); }} disabled={busy}>
            Descartar
          </button>
          <button type="button" className="btn" onClick={save} disabled={busy || !dirty}>
            {busy ? 'Guardando…' : 'Guardar permisos'}
          </button>
        </div>
      )}

      <AccessSheet user={user} mode={access} onClose={() => setAccess(null)} onSaved={setUsers} />
    </Page>
  );
}

/** En palabras: que puede y que no puede hacer. Lo entiende cualquiera. */
function PermissionSummary({ p, name }: { p: Permissions; name: string }) {
  const lines = useMemo(() => {
    const yes: string[] = [];
    const no: string[] = [];
    const level = (l: 'none' | 'view' | 'edit', what: string) => (l === 'edit' ? yes.push(`Ver y registrar ${what}`) : l === 'view' ? yes.push(`Ver ${what} (sin cambiar nada)`) : no.push(`Ver ${what}`));
    if (p.admin) return { yes: ['Todo, incluidos usuarios, permisos y el respaldo completo'], no: [] };
    yes.push(p.scope === 'all' ? 'Todo el negocio, no solo lo suyo' : 'Solo lo suyo (sus ventas, instalaciones y servicios)');
    p.clients === 'edit' ? yes.push('Ver y editar clientes') : yes.push('Ver clientes');
    level(p.sales, 'ventas');
    level(p.services, 'servicio técnico');
    level(p.inventory, 'inventario');
    if (p.money === 'all') yes.push('Todos los montos: ganancias, costos y comisiones');
    else if (p.money === 'prices') {
      yes.push(p.scope === 'own' ? 'Precios de venta y su propia comisión' : 'Precios de venta y cobros');
      no.push('Ganancias, costos, comisiones de otros y lo que paga la financiera');
    } else no.push('Ningún monto de dinero');
    level(p.payments, 'pagos de comisiones y técnicos');
    level(p.payables, 'cuentas por pagar');
    (p.reports ? yes : no).push('Reportes');
    (p.export ? yes : no).push('Descargar a Excel');
    (p.delete ? yes : no).push('Borrar registros');
    no.push('Usuarios, permisos y respaldo completo');
    return { yes, no };
  }, [p]);

  return (
    <>
      <div className="group-label">Resumen: qué puede hacer {name}</div>
      <div className="perm-summary">
        <ul>
          {lines.yes.map((line) => (
            <li key={line} className="yes"><Check size={15} strokeWidth={3} /> {line}</li>
          ))}
          {lines.no.map((line) => (
            <li key={line} className="no"><X size={15} strokeWidth={3} /> {line}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

function AccessSheet({ user, mode, onClose, onSaved }: { user: User; mode: 'name' | 'password' | null; onClose: () => void; onSaved: (users: User[]) => void }) {
  const { toast } = useFeedback();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (!mode) return;
    setError(null);
    setShown(null);
    setValue(mode === 'name' ? user.name : suggestPassword());
  }, [mode, user]);

  const save = async () => {
    setError(null);
    try {
      const { users } = await api<{ users: User[] }>(`/users/${user.id}`, { method: 'PUT', body: mode === 'name' ? { name: value } : { password: value } });
      onSaved(users);
      if (mode === 'password') setShown(value);
      else {
        toast('Guardado');
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (shown) {
    return (
      <Sheet open={mode != null} onClose={onClose} title="Contraseña nueva" left={<span />} right={<button type="button" className="link-btn strong" onClick={onClose}>OK</button>}>
        <p className="muted" style={{ textAlign: 'center', marginBottom: 16 }}>Pásasela a {user.name}. Sus sesiones abiertas se cerraron.</p>
        <Group>
          <Row title="Usuario" value={<b style={{ color: 'var(--text)' }}>{user.username}</b>} />
          <Row title="Contraseña" value={<b style={{ color: 'var(--text)', fontFamily: 'ui-monospace, monospace' }}>{shown}</b>} />
        </Group>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={mode != null}
      onClose={onClose}
      title={mode === 'name' ? 'Nombre' : 'Nueva contraseña'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save}>Guardar</button>}
    >
      <Group footer={mode === 'password' ? 'Sugerida automáticamente; puedes escribir otra (mínimo 10 caracteres). Al cambiarla se cierran sus sesiones.' : undefined}>
        <TextField label={mode === 'name' ? 'Nombre' : 'Contraseña'} value={value} onChange={setValue} maxLength={mode === 'name' ? 80 : 200} />
        {mode === 'password' && (
          <button type="button" className="row action" onClick={() => setValue(suggestPassword())}>
            <span className="row-label">Generar otra</span>
          </button>
        )}
      </Group>
      {error && <p className="field-error">{error}</p>}
    </Sheet>
  );
}
