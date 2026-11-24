/**
 * Usuarios y permisos (solo administradores).
 *
 * Cada usuario tiene un perfil (Vendedor, Tecnico, Oficina, Contador) que se
 * puede ajustar punto por punto, y un boton "Ver como" que abre el sistema
 * exactamente como lo ve esa persona, sin poder guardar nada.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Boxes, Check, CreditCard, Eye, FileSpreadsheet, HandCoins, Plus, Receipt, ShieldCheck, Users as UsersIcon, Wallet, Wrench, X, ClipboardSignature, Landmark } from 'lucide-react';
import type { PermissionFlag, Permissions, User } from '../../../shared/domain.ts';
import { ADMIN_PERMISSIONS, PERMISSION_AREAS, PERMISSION_PRESETS, areaSummary, mergePresets, normalizePermissions, permissionsSummary, presetsOf, redundantPresets } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { navigate, useLeaveGuard } from '../lib/router.tsx';
import { api } from '../lib/api.ts';
import { dateWithYear, localDate } from '../lib/format.ts';
import { Avatar, Badge, Empty, Group, IconBox, Page, Row, SegmentedRow, SwitchRow, TextField } from '../ui/kit.tsx';
import { Picker, Sheet, useFeedback } from '../ui/sheet.tsx';
import { PickerRow } from '../ui/pickers.tsx';
import { ProfilePhoto } from '../ui/photo.tsx';

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
              leading={<Avatar name={user.name} photo={user.avatar} />}
              title={
                <>
                  {user.name} {user.owner && <Badge tone="violet">Dueño</Badge>} {user.id === data.me.id && <Badge tone="blue">Tú</Badge>} {!user.active && <Badge>Desactivado</Badge>}
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
  const [presets, setPresets] = useState<string[]>(['seller']);
  const [personId, setPersonId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // El aviso se va en cuanto se corrige algo.
  useEffect(() => setError(null), [form, presets, personId]);
  const [created, setCreated] = useState<{ id: number; username: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ name: '', username: '', password: suggestPassword() });
    setPresets(['seller']);
    autoPicked.current = true;
    setPersonId(null);
    setError(null);
    setCreated(null);
  }, [open]);

  // Si el nombre coincide COMPLETO con alguien del equipo, se elige solo (y se
  // corrige mientras se escribe). Antes bastaban 3 letras: "Ant" elegia a Anthony
  // en vez de Antonio. Si la persona se eligio a mano, no se toca.
  const autoPicked = useRef(true);
  useEffect(() => {
    if (!autoPicked.current) return;
    const key = plainName(form.name);
    const match = key.length >= 3 ? data.people.filter((p) => p.active && plainName(p.name) === key) : [];
    setPersonId(match.length === 1 ? match[0].id : null);
  }, [form.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdminChoice = presets.includes('admin');
  const merged = isAdminChoice ? null : mergePresets(presets, personId);
  const needsPerson = merged?.scope === 'own';
  const toggle = (key: string) => {
    setError(null);
    setPresets((current) => togglePreset(current, key) ?? current);
  };

  const save = async () => {
    setError(null);
    if (!form.name.trim()) return setError('Escribe el nombre de la persona.');
    if (!/^[a-z0-9._-]{3,40}$/.test(form.username)) return setError('Escribe el usuario: de 3 a 40 letras o números, sin espacios.');
    if (form.password.length < 10) return setError('La contraseña debe tener al menos 10 caracteres.');
    if (needsPerson && !personId) return setError('Elige quién es en el equipo: así el sistema sabe cuáles son sus ventas y sus servicios.');
    setBusy(true);
    try {
      const role: Role = isAdminChoice ? 'admin' : 'member';
      const permissions = merged ? { ...merged, personId } : undefined;
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
      onSubmit={save}
      submitLabel="Crear usuario"
      busy={busy}
      error={error}
      guard
    >
      <Group>
        <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Nombre" maxLength={80} autoFocus />
        <TextField label="Usuario" value={form.username} onChange={(username) => setForm({ ...form, username: username.toLowerCase().replace(/\s/g, '') })} placeholder="ej. carlos" maxLength={40} />
        <TextField label="Contraseña" value={form.password} onChange={(password) => setForm({ ...form, password })} />
      </Group>
      <div className="group-label">Qué hace en el negocio</div>
      <PresetCards value={presets} onToggle={toggle} />
      {needsPerson && (
        <Group footer="Verá solo las ventas, instalaciones y servicios de esta persona.">
          <TeamPicker
            value={personId}
            onChange={(v) => {
              autoPicked.current = false;
              setPersonId(v);
            }}
            newName={form.name}
          />
        </Group>
      )}
      <p className="group-foot">Puedes marcar varios perfiles (por ejemplo Oficina + Técnico) y después ajustar cada permiso por separado.</p>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Perfiles                                                             */
/* ------------------------------------------------------------------ */

const ADMIN_CARD = { key: 'admin', label: 'Administrador', text: 'Todo: dinero, pagos, usuarios y respaldo. Como tú.' };

/**
 * Marca o desmarca un perfil. Administrador va solo (ya lo incluye todo).
 * Devuelve null si quedaria sin ningun perfil.
 */
function togglePreset(current: string[], key: string): string[] | null {
  if (key === 'admin') return current.includes('admin') ? null : ['admin'];
  const base = current.filter((k) => k !== 'admin');
  const next = base.includes(key) ? base.filter((k) => k !== key) : [...base, key];
  return next.length ? next : null;
}

function PresetCards({ value, onToggle, custom }: { value: string[]; onToggle: (key: string) => void; custom?: boolean }) {
  const cards = [...PERMISSION_PRESETS, ADMIN_CARD];
  const multi = value.length > 1;
  const label = (k: string) => cards.find((c) => c.key === k)?.label;
  const redundant = redundantPresets(value.filter((k) => k !== 'admin'));
  return (
    <>
      <div className="preset-grid" role="group" aria-label="Perfiles (puedes marcar varios)">
        {cards.map((card) => {
          const on = value.includes(card.key);
          return (
            <button key={card.key} type="button" role="checkbox" aria-checked={on} className={`preset-card${on ? ' on' : ''}`} onClick={() => onToggle(card.key)}>
              <span className="preset-head">
                <b>{card.label}</b>
                <span className="preset-check square">{on && <Check size={14} strokeWidth={3} />}</span>
              </span>
              <span className="preset-text">{card.text}</span>
            </button>
          );
        })}
        {custom && (
          <div className="preset-card on custom">
            <span className="preset-head">
              <b>Personalizado</b>
              <span className="preset-check square"><Check size={14} strokeWidth={3} /></span>
            </span>
            <span className="preset-text">Ajustado a mano, punto por punto (abajo).</span>
          </div>
        )}
      </div>
      <p className="preset-hint">
        {multi
          ? `Combinados: ${value.map(label).join(' + ')}. Tiene lo más amplio de cada perfil.`
          : 'Puedes marcar varios perfiles: tendrá lo más amplio de cada uno.'}
        {redundant.length > 0 && (
          <span className="preset-note">
            {' '}
            {redundant.map(label).join(' y ')} no {redundant.length === 1 ? 'agrega' : 'agregan'} nada: los otros perfiles marcados ya lo incluyen.
          </span>
        )}
      </p>
    </>
  );
}

const plainName = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Quien es en el equipo. Si la persona no esta, se agrega desde aqui como
 * vendedor: asi aparece enseguida en la lista de vendedores de las ventas.
 */
function TeamPicker({ value, onChange, optional, newName }: { value: number | null; onChange: (id: number | null) => void; optional?: boolean; newName?: string }) {
  const data = useData();
  const { reload } = useStore();
  const [open, setOpen] = useState(false);
  const create = async (name: string) => {
    const { person } = await api<{ person: { id: number } }>('/people', { method: 'POST', body: { name: name.trim() || newName?.trim() || '', phone: null, isSeller: true, isInstaller: false } });
    await reload();
    return person.id;
  };
  const options = data.people
    .filter((p) => p.active || p.id === value)
    .map((p) => ({ id: p.id, label: p.name, sublabel: [p.isSeller && 'Vende', p.isInstaller && 'Instala'].filter(Boolean).join(' · '), inactive: !p.active }));
  return (
    <>
      <PickerRow field="permissions.personId" label="Quién es en el equipo" value={value ? data.personById.get(value)?.name : null} placeholder={optional ? 'Opcional' : 'Elegir'} onOpen={() => setOpen(true)} />
      <Picker
        open={open}
        onClose={() => setOpen(false)}
        title="Quién es en el equipo"
        options={options}
        value={value}
        onSelect={onChange}
        onCreate={create}
        createLabel="Agregar al equipo como vendedor"
        searchPlaceholder="Buscar o escribir el nombre"
        {...(optional ? { allowNone: 'Nadie del equipo' } : {})}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Un usuario: permisos, acceso y "Ver como"                             */
/* ------------------------------------------------------------------ */

const AREA_LOOK: Record<string, { icon: React.ReactNode; color: string }> = {
  clients: { icon: <UsersIcon size={17} />, color: '#0a72c2' },
  sales: { icon: <Receipt size={17} />, color: '#1d9a46' },
  services: { icon: <Wrench size={17} />, color: '#ff9500' },
  credit: { icon: <ClipboardSignature size={17} />, color: '#1d9a46' },
  bank: { icon: <Landmark size={17} />, color: '#0a72c2' },
  money: { icon: <Wallet size={17} />, color: '#6a3fdc' },
  payments: { icon: <HandCoins size={17} />, color: '#0f7a3c' },
  payables: { icon: <CreditCard size={17} />, color: '#e5484d' },
  inventory: { icon: <Boxes size={17} />, color: '#5856d6' },
  reports: { icon: <BarChart3 size={17} />, color: '#16a3c4' },
  other: { icon: <FileSpreadsheet size={17} />, color: '#636366' },
};

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

  useEffect(() => {
    if (!user) return;
    // Si hoy es administrador y se le cambia el perfil, se parte de Oficina.
    const p = user.role === 'admin' ? mergePresets(['office'], null) : user.permissions;
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
  const selected = role === 'admin' ? ['admin'] : presetsOf(perms);
  const set = <K extends keyof Permissions>(key: K, value: Permissions[K]) => setPerms((p) => normalizePermissions({ ...p, [key]: value }, false));
  const [area, setArea] = useState<string | null>(null);
  const isMe = user?.id === data.me.id;
  // La cuenta del dueno solo la cambia el dueno.
  const lockedOwner = Boolean(user?.owner && !data.me.owner);

  const choosePreset = async (key: string) => {
    if (!selected && !(await confirm({ title: 'Reemplazar los permisos', message: 'Tiene permisos ajustados a mano. Al elegir un perfil se reemplazan por los del perfil.', confirm: 'Reemplazar' }))) return;
    const next = togglePreset(selected ?? [], key);
    if (!next) return toast('Deja al menos un perfil marcado.', 'error');
    if (next[0] === 'admin') return setRole('admin');
    setRole('member');
    setPerms((p) => mergePresets(next, p.personId, p.payableAccounts));
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
        <ProfilePhoto name={user.name} photo={user.avatar} />
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
      <PresetCards value={selected ?? []} onToggle={isMe || user.owner ? () => toast(user.owner ? 'La cuenta del dueño siempre tiene acceso a todo.' : 'Tu propio acceso no se puede reducir.', 'error') : choosePreset} custom={!selected} />
      {isMe && role === 'admin' && <p className="group-foot">Eres administrador. Para no quedarte fuera, tu propio acceso no se puede reducir.</p>}

      {role === 'member' && (
        <>
          <Group label="Alcance" footer={perms.scope === 'own' ? 'Solo lo suyo: las ventas que vendió o instaló, los servicios que atendió, lo que registró desde su usuario y los clientes de todo eso.' : 'Si es parte del equipo, elígelo: así ve su propia comisión o su pago aunque no vea los demás montos.'}>
            <SegmentedRow
              title="Qué ve"
              options={[
                { value: 'all', label: 'Todo el negocio' },
                { value: 'own', label: 'Solo lo suyo' },
              ]}
              value={perms.scope}
              onChange={(v) => set('scope', v)}
            />
            <TeamPicker value={perms.personId} onChange={(v) => set('personId', v)} optional={perms.scope === 'all'} />
          </Group>

          <Group label="Qué puede hacer" footer="Toca cada sección para activar o quitar acciones una por una.">
            {PERMISSION_AREAS.map((x) => {
              const summary = areaSummary(perms, x.key);
              const off = summary === 'Sin acceso' || summary === 'Ningún monto';
              const accounts = x.key === 'payables' && perms.flags['payables.view'] && perms.payableAccounts ? ` · ${perms.payableAccounts.length} ${perms.payableAccounts.length === 1 ? 'cuenta' : 'cuentas'}` : '';
              return (
                <Row
                  key={x.key}
                  onClick={() => setArea(x.key)}
                  leading={<IconBox icon={(AREA_LOOK[x.key] ?? AREA_LOOK.other).icon} color={off ? '#c7c7cc' : (AREA_LOOK[x.key] ?? AREA_LOOK.other).color} />}
                  title={x.label}
                  subtitle={<span className={off ? 'faint' : undefined}>{summary + accounts}</span>}
                />
              );
            })}
          </Group>
        </>
      )}

      <PermissionSummary p={effective} name={user.name.split(' ')[0]} />

      {data.me.owner && !data.viewer && (
        <Group>
          <Row to={`/actividad?usuario=${user.id}`} leading={<IconBox icon={<ShieldCheck size={17} />} color="#1d1d1f" />} title={`Ver lo que ha hecho ${user.name.split(' ')[0]}`} subtitle="Registro de actividad: cambios, accesos y descargas" />
        </Group>
      )}

      {lockedOwner ? (
        <p className="group-foot">Esta es la cuenta del dueño: solo {user.name.split(' ')[0]} puede cambiar su nombre, su contraseña o sus permisos.</p>
      ) : (
      <>
        <AccessCard user={user} onSaved={setUsers} />
        {!isMe && !user.owner && (
          <Group>
            <button type="button" className={`row ${user.active ? 'danger' : 'action'}`} onClick={toggleActive}>
              {user.active ? 'Quitarle el acceso' : 'Devolverle el acceso'}
            </button>
          </Group>
        )}
      </>
      )}

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

      <AreaSheet areaKey={area} perms={perms} onChange={setPerms} onClose={() => setArea(null)} />
    </Page>
  );
}

/** En palabras: que puede y que no puede hacer, seccion por seccion. */
function PermissionSummary({ p, name }: { p: Permissions; name: string }) {
  const data = useData();
  const lines = useMemo(() => {
    if (p.admin) return [{ on: true, label: 'Todo', text: 'Incluidos usuarios, permisos y el respaldo completo' }];
    const scope = { on: true, label: 'Alcance', text: p.scope === 'all' ? 'Todo el negocio' : 'Solo lo suyo (sus ventas, instalaciones y servicios)' };
    const areas = PERMISSION_AREAS.map((x) => {
      let text = areaSummary(p, x.key);
      if (x.key === 'payables' && p.flags['payables.view'] && p.payableAccounts) {
        const names = p.payableAccounts.map((id) => data.payableAccounts.find((a) => a.id === id)?.name).filter(Boolean);
        text += ` · solo ${names.length ? names.join(', ') : 'ninguna cuenta'}`;
      }
      return { on: text !== 'Sin acceso' && text !== 'Ningún monto', label: x.label, text };
    });
    return [scope, ...areas, { on: false, label: 'Usuarios y respaldo', text: 'Solo administradores' }];
  }, [p, data.payableAccounts]);

  return (
    <>
      <div className="group-label">Resumen: qué puede hacer {name}</div>
      <div className="perm-summary">
        <ul>
          {lines.map((line) => (
            <li key={line.label} className={line.on ? 'yes' : 'no'}>
              {line.on ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
              <span><b>{line.label}:</b> {line.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Interruptores de una seccion. Lo que depende de otro permiso se muestra apagado con la razon. */
function AreaSheet({ areaKey, perms, onChange, onClose }: { areaKey: string | null; perms: Permissions; onChange: (p: Permissions) => void; onClose: () => void }) {
  const data = useData();
  const area = PERMISSION_AREAS.find((x) => x.key === areaKey);
  if (!area) return <Sheet open={false} onClose={onClose} title="" children={null} />;
  const viewFlag = area.flags[0].flag;
  const isSectionView = viewFlag.endsWith('.view');

  const toggle = (flag: PermissionFlag, value: boolean) => {
    const flags = { ...perms.flags, [flag]: value };
    // Quitar "Ver" quita todo lo de la seccion; las ganancias encienden todos los montos.
    if (!value && flag === viewFlag && isSectionView) for (const x of area.flags) flags[x.flag] = false;
    if (value && flag === 'money.profit') for (const x of area.flags) flags[x.flag] = true;
    onChange(normalizePermissions({ ...perms, flags }, false));
  };
  /** Si al activarlo el sistema lo vuelve a apagar, depende de algo que falta. */
  const blocked = (flag: PermissionFlag) => !perms.flags[flag] && flag !== 'money.profit' && !normalizePermissions({ ...perms, flags: { ...perms.flags, [flag]: true } }, false).flags[flag];
  const setAll = (value: boolean) => {
    const flags = { ...perms.flags };
    for (const x of area.flags) flags[x.flag] = value;
    onChange(normalizePermissions({ ...perms, flags }, false));
  };
  const toggleAccount = (id: number) => {
    const current = perms.payableAccounts ?? [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChange(normalizePermissions({ ...perms, payableAccounts: next }, false));
  };

  return (
    <Sheet open={areaKey != null} onClose={onClose} title={area.label} right={<button type="button" className="link-btn strong" onClick={onClose}>Listo</button>}>
      <p className="muted" style={{ textAlign: 'center', margin: '0 0 14px', fontSize: 14.5 }}>{area.text}</p>
      {(area.key === 'reports' || area.key === 'money') && (
        <div className="amount-chips" style={{ marginTop: 0, justifyContent: 'center' }}>
          <button type="button" onClick={() => setAll(true)}>{area.key === 'money' ? 'Todos los montos' : 'Todos'}</button>
          <button type="button" onClick={() => setAll(false)}>Ninguno</button>
        </div>
      )}
      <Group>
        {area.flags.map((x) => {
          const isBlocked = blocked(x.flag);
          return (
            <SwitchRow
              key={x.flag}
              label={x.label}
              subtitle={x.hint ? <span className={isBlocked ? 'orange' : undefined}>{x.hint}</span> : undefined}
              checked={perms.flags[x.flag]}
              onChange={(v) => toggle(x.flag, v)}
              disabled={isBlocked}
            />
          );
        })}
      </Group>
      {area.key === 'payables' && perms.flags['payables.view'] && (
        <>
          <Group label="Qué cuentas ve" footer={perms.payableAccounts ? 'Solo verá los gastos y pagos de las cuentas marcadas.' : 'Ve todas las cuentas, también las que se creen después.'}>
            <SegmentedRow
              title="Cuentas"
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'some', label: 'Solo algunas' },
              ]}
              value={perms.payableAccounts ? 'some' : 'all'}
              onChange={(v) => onChange(normalizePermissions({ ...perms, payableAccounts: v === 'all' ? null : [] }, false))}
            />
          </Group>
          {perms.payableAccounts && (
            <Group>
              {data.payableAccounts.length === 0 && <Empty inGroup title="Aún no hay cuentas" text="Créalas en Cuentas por pagar." />}
              {data.payableAccounts.map((acc) => (
                <SwitchRow key={acc.id} label={acc.name} checked={perms.payableAccounts!.includes(acc.id)} onChange={() => toggleAccount(acc.id)} />
              ))}
            </Group>
          )}
        </>
      )}
    </Sheet>
  );
}

/**
 * Usuario y contrasena, siempre a la vista al final: nombre, usuario y una
 * contrasena nueva (vacia = sigue con la que tenia). La actual no se puede ver
 * (se guarda cifrada); si la olvido, se le pone una nueva aqui.
 */
function AccessCard({ user, onSaved }: { user: User; onSaved: (users: User[]) => void }) {
  const { toast } = useFeedback();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => {
    setName(user.name);
    setUsername(user.username);
    setPassword('');
    setError(null);
  }, [user.id, user.name, user.username]);

  const changed = name.trim() !== user.name || username !== user.username || password.length > 0;

  const save = async () => {
    setError(null);
    if (!name.trim()) return setError('Escribe el nombre.');
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) return setError('El usuario va sin espacios: de 3 a 40 letras o números (puede llevar punto o guion).');
    if (password && password.length < 10) return setError('La contraseña nueva necesita al menos 10 caracteres (o déjala vacía para mantener la actual).');
    setBusy(true);
    try {
      const body = {
        ...(name.trim() !== user.name ? { name: name.trim() } : {}),
        ...(username !== user.username ? { username } : {}),
        ...(password ? { password } : {}),
      };
      const { users } = await api<{ users: User[] }>(`/users/${user.id}`, { method: 'PUT', body });
      onSaved(users);
      if (password) setShown({ username, password });
      else toast('Guardado');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const message = shown ? `Tus datos para entrar al sistema:\nadmin.infinitywatersite.com\nUsuario: ${shown.username}\nContraseña: ${shown.password}` : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast('Copiado: pégalo en WhatsApp');
    } catch {
      toast('No se pudo copiar: anótalos a mano.', 'error');
    }
  };

  return (
    <>
      <Group label="Usuario y contraseña" footer="Así entra al sistema. La contraseña actual no se puede ver (se guarda protegida): si la olvidó, escribe una nueva o toca «Generar una». Si dejas la contraseña vacía, sigue con la que tenía. Al poner una nueva se cierran sus sesiones abiertas.">
        <TextField label="Nombre" value={name} onChange={setName} maxLength={80} autoComplete="off" autoCapitalize="words" field="access-name" />
        <TextField label="Usuario" value={username} onChange={(v) => setUsername(v.toLowerCase().replace(/\s/g, ''))} maxLength={40} autoComplete="off" field="access-username" />
        <TextField label="Contraseña nueva" value={password} onChange={setPassword} placeholder="Vacía = mantener la actual" maxLength={200} autoComplete="off" field="access-password" />
        <button type="button" className="row action" onClick={() => setPassword(suggestPassword())}>
          <span className="row-label">Generar una contraseña</span>
        </button>
      </Group>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="btn block access-save" onClick={save} disabled={!changed || busy}>
        {busy ? 'Guardando…' : 'Guardar usuario y contraseña'}
      </button>
      <Sheet open={shown != null} onClose={() => setShown(null)} title="Listo" left={<span />} right={<button type="button" className="link-btn strong" onClick={() => setShown(null)}>OK</button>}>
        <p className="muted" style={{ textAlign: 'center', marginBottom: 16 }}>Pásale estos datos a {user.name.split(' ')[0]}. La contraseña no se vuelve a mostrar.</p>
        <Group>
          <Row title="Dirección" value={<b style={{ color: 'var(--text)' }}>admin.infinitywatersite.com</b>} />
          <Row title="Usuario" value={<b style={{ color: 'var(--text)' }}>{shown?.username}</b>} />
          <Row title="Contraseña" value={<b style={{ color: 'var(--text)', fontFamily: 'ui-monospace, monospace' }}>{shown?.password}</b>} />
        </Group>
        <button type="button" className="btn block" onClick={copy}>
          Copiar para mandar por WhatsApp
        </button>
      </Sheet>
    </>
  );
}
