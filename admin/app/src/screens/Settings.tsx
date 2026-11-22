/**
 * Ajustes: equipo, financieras, proveedores, usuarios, cuenta, exportar y
 * respaldo.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { DatabaseBackup, Download, KeyRound, Landmark, LogOut, Package, Plus, Smartphone, UserCog, Users } from 'lucide-react';
import type { CatalogItem, Person, User } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { api, download } from '../lib/api.ts';
import { dateWithYear, localDate, plural } from '../lib/format.ts';
import { Avatar, Badge, Empty, Group, IconBox, Page, Row, SwitchRow, TextField } from '../ui/kit.tsx';
import { Sheet, useFeedback } from '../ui/sheet.tsx';

export function Settings() {
  const data = useData();
  const { signOut } = useStore();
  const { confirm } = useFeedback();

  const logout = async () => {
    if (await confirm({ title: '¿Cerrar sesión?', confirm: 'Cerrar sesión' })) await signOut();
  };

  return (
    <Page title="Ajustes" back={{ label: 'Inicio', to: '/' }} narrow>
      <Group>
        <Row
          to="/ajustes/cuenta"
          leading={<Avatar name={data.me.name} />}
          title={<span style={{ fontWeight: 600 }}>{data.me.name}</span>}
          subtitle={`Usuario: ${data.me.username}`}
        />
      </Group>

      <Group label="Catálogos" footer="También se agregan solos desde los formularios de venta y servicio.">
        <Row to="/ajustes/equipo" leading={<IconBox icon={<Users size={17} />} color="#0a72c2" />} title="Equipo" subtitle="Vendedores y técnicos" value={data.people.length || undefined} />
        <Row to="/ajustes/financieras" leading={<IconBox icon={<Landmark size={17} />} color="#5856d6" />} title="Financieras" value={data.financiers.length || undefined} />
        <Row to="/ajustes/proveedores" leading={<IconBox icon={<Package size={17} />} color="#ff9500" />} title="Proveedores" value={data.suppliers.length || undefined} />
      </Group>

      <Group label="Acceso">
        <Row to="/ajustes/usuarios" leading={<IconBox icon={<UserCog size={17} />} color="#8e8e93" />} title="Usuarios" subtitle="Quién puede entrar al sistema" />
        <Row to="/ajustes/cuenta" leading={<IconBox icon={<KeyRound size={17} />} color="#34c759" />} title="Cambiar mi contraseña" />
      </Group>

      <Group label="Exportar a Excel" footer="Archivos CSV que abren en Excel o Google Sheets. Útiles para el contador.">
        <Row onClick={() => download('/export/sales')} leading={<IconBox icon={<Download size={17} />} color="#1d8a3a" />} title="Ventas" value={data.sales.length} chevron={false} />
        <Row onClick={() => download('/export/clients')} leading={<IconBox icon={<Download size={17} />} color="#1d8a3a" />} title="Clientes" value={data.clients.length} chevron={false} />
        <Row onClick={() => download('/export/services')} leading={<IconBox icon={<Download size={17} />} color="#1d8a3a" />} title="Servicio técnico" value={data.services.length} chevron={false} />
      </Group>

      <Group label="Respaldo" footer="El servidor guarda una copia automática cada día y conserva las de los últimos 30 días.">
        <Row onClick={() => download('/backup')} leading={<IconBox icon={<DatabaseBackup size={17} />} color="#636366" />} title="Descargar copia completa" chevron={false} />
      </Group>

      <Group label="En el teléfono">
        <Row
          leading={<IconBox icon={<Smartphone size={17} />} color="#0a72c2" />}
          title="Úsalo como una app"
          subtitle="iPhone: en Safari toca Compartir y luego “Agregar a pantalla de inicio”. Android: menú ⋮ y “Instalar app”."
          clamp
        />
      </Group>

      <div className="group" style={{ marginTop: 26 }}>
        <button type="button" className="row danger" onClick={logout}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Equipo                                                               */
/* ------------------------------------------------------------------ */

export function PeopleScreen() {
  const data = useData();
  const [editing, setEditing] = useState<Person | 'new' | null>(null);
  const counts = (id: number) => ({
    sold: data.sales.filter((s) => s.sellerId === id).length,
    installed: data.sales.filter((s) => s.installerId === id).length + data.services.filter((s) => s.technicianId === id).length,
  });

  return (
    <Page
      title="Equipo"
      subtitle="Vendedores y técnicos"
      back={{ label: 'Ajustes', to: '/ajustes' }}
      actions={
        <button type="button" className="icon-btn" onClick={() => setEditing('new')} aria-label="Agregar persona">
          <Plus size={24} />
        </button>
      }
      narrow
    >
      {data.people.length === 0 ? (
        <Empty icon={<Users size={40} />} title="Aún no hay nadie" text="Agrega a quienes venden e instalan." action={<button type="button" className="btn" onClick={() => setEditing('new')}>Agregar persona</button>} />
      ) : (
        <Group>
          {data.people.map((person) => {
            const c = counts(person.id);
            return (
              <Row
                key={person.id}
                onClick={() => setEditing(person)}
                leading={<Avatar name={person.name} />}
                title={
                  <>
                    {person.name} {!person.active && <Badge>Inactivo</Badge>}
                  </>
                }
                subtitle={[
                  person.isSeller && `Vende (${c.sold})`,
                  person.isInstaller && `Instala (${c.installed})`,
                  person.phone,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            );
          })}
        </Group>
      )}
      <PersonSheet person={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

function PersonSheet({ person, onClose }: { person: Person | 'new' | null; onClose: () => void }) {
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const [form, setForm] = useState({ name: '', phone: '', isSeller: true, isInstaller: false, active: true });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!person) return;
    setError(null);
    setForm(person === 'new' ? { name: '', phone: '', isSeller: true, isInstaller: false, active: true } : { name: person.name, phone: person.phone ?? '', isSeller: person.isSeller, isInstaller: person.isInstaller, active: person.active });
  }, [person]);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const isNew = person === 'new';
      await api(isNew ? '/people' : `/people/${(person as Person).id}`, { method: isNew ? 'POST' : 'PUT', body: { ...form, phone: form.phone || null } });
      await reload();
      toast(isNew ? 'Persona agregada' : 'Cambios guardados');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!person || person === 'new') return;
    if (!(await confirm({ title: `¿Borrar a ${person.name}?`, confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/people/${person.id}`, { method: 'DELETE' });
      await reload();
      toast('Borrado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Sheet
      open={person != null}
      onClose={onClose}
      title={person === 'new' ? 'Nueva persona' : 'Editar'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={() => save()} disabled={busy}>Guardar</button>}
    >
      <form onSubmit={save}>
        <Group>
          <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Nombre" autoFocus={person === 'new'} maxLength={80} />
          <TextField label="Teléfono" type="tel" inputMode="tel" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} placeholder="Opcional" />
        </Group>
        <Group label="Qué hace">
          <SwitchRow label="Vende" checked={form.isSeller} onChange={(isSeller) => setForm({ ...form, isSeller })} />
          <SwitchRow label="Instala y da servicio técnico" checked={form.isInstaller} onChange={(isInstaller) => setForm({ ...form, isInstaller })} />
        </Group>
        {person !== 'new' && (
          <Group footer="Si ya no trabaja con ustedes, desactívalo: deja de salir en las listas pero sus ventas se conservan.">
            <SwitchRow label="Activo" checked={form.active} onChange={(active) => setForm({ ...form, active })} />
          </Group>
        )}
        {error && <p className="field-error">{error}</p>}
        {person !== 'new' && (
          <div className="group" style={{ marginTop: 22 }}>
            <button type="button" className="row danger" onClick={remove}>Borrar</button>
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Financieras y proveedores                                            */
/* ------------------------------------------------------------------ */

export function CatalogScreen({ table }: { table: 'financiers' | 'suppliers' }) {
  const data = useData();
  const [editing, setEditing] = useState<CatalogItem | 'new' | null>(null);
  const isFin = table === 'financiers';
  const items = isFin ? data.financiers : data.suppliers;
  const usage = (id: number) =>
    isFin ? data.sales.filter((s) => s.financierId === id).length : data.sales.filter((s) => s.suppliers.some((x) => x.supplierId === id)).length;

  return (
    <Page
      title={isFin ? 'Financieras' : 'Proveedores'}
      back={{ label: 'Ajustes', to: '/ajustes' }}
      actions={
        <button type="button" className="icon-btn" onClick={() => setEditing('new')} aria-label="Agregar">
          <Plus size={24} />
        </button>
      }
      narrow
    >
      {items.length === 0 ? (
        <Empty
          icon={isFin ? <Landmark size={40} /> : <Package size={40} />}
          title={isFin ? 'Sin financieras' : 'Sin proveedores'}
          text="Agrégalas aquí o directamente al registrar una venta."
          action={<button type="button" className="btn" onClick={() => setEditing('new')}>Agregar</button>}
        />
      ) : (
        <Group>
          {items.map((item) => (
            <Row
              key={item.id}
              onClick={() => setEditing(item)}
              title={
                <>
                  {item.name} {!item.active && <Badge>Inactiva</Badge>}
                </>
              }
              value={plural(usage(item.id), 'venta', 'ventas')}
            />
          ))}
        </Group>
      )}
      <CatalogSheet table={table} item={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

function CatalogSheet({ table, item, onClose }: { table: 'financiers' | 'suppliers'; item: CatalogItem | 'new' | null; onClose: () => void }) {
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setError(null);
    setName(item === 'new' ? '' : item.name);
    setActive(item === 'new' ? true : item.active);
  }, [item]);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    try {
      const isNew = item === 'new';
      await api(isNew ? `/${table}` : `/${table}/${(item as CatalogItem).id}`, { method: isNew ? 'POST' : 'PUT', body: { name, active } });
      await reload();
      toast('Guardado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async () => {
    if (!item || item === 'new') return;
    if (!(await confirm({ title: `¿Borrar ${item.name}?`, confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/${table}/${item.id}`, { method: 'DELETE' });
      await reload();
      toast('Borrado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Sheet
      open={item != null}
      onClose={onClose}
      title={item === 'new' ? 'Agregar' : 'Editar'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={() => save()}>Guardar</button>}
    >
      <form onSubmit={save}>
        <Group>
          <TextField label="Nombre" value={name} onChange={setName} placeholder="Nombre" autoFocus={item === 'new'} maxLength={80} />
          {item !== 'new' && <SwitchRow label="Activa" checked={active} onChange={setActive} />}
        </Group>
        {error && <p className="field-error">{error}</p>}
        {item !== 'new' && (
          <div className="group" style={{ marginTop: 22 }}>
            <button type="button" className="row danger" onClick={remove}>Borrar</button>
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Usuarios y cuenta                                                    */
/* ------------------------------------------------------------------ */

function suggestPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join('')).join('-');
}

export function UsersScreen() {
  const data = useData();
  const [users, setUsers] = useState<User[] | null>(null);
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ users: User[] }>('/users')
      .then((r) => setUsers(r.users))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Page
      title="Usuarios"
      subtitle="Quién puede entrar al sistema"
      back={{ label: 'Ajustes', to: '/ajustes' }}
      actions={
        <button type="button" className="icon-btn" onClick={() => setEditing('new')} aria-label="Agregar usuario">
          <Plus size={24} />
        </button>
      }
      narrow
    >
      {error && <p className="field-error">{error}</p>}
      <Group footer="Todos los usuarios ven y editan todo. Cada cambio queda registrado con el nombre de quien lo hizo.">
        {(users ?? []).map((user) => (
          <Row
            key={user.id}
            onClick={() => setEditing(user)}
            leading={<Avatar name={user.name} />}
            title={
              <>
                {user.name} {user.id === data.me.id && <Badge tone="blue">Tú</Badge>} {!user.active && <Badge>Desactivado</Badge>}
              </>
            }
            subtitle={`${user.username} · ${user.lastLoginAt ? `último acceso ${dateWithYear(localDate(user.lastLoginAt))}` : 'nunca ha entrado'}`}
          />
        ))}
      </Group>
      <UserSheet user={editing} onClose={() => setEditing(null)} onSaved={setUsers} />
    </Page>
  );
}

function UserSheet({ user, onClose, onSaved }: { user: User | 'new' | null; onClose: () => void; onSaved: (users: User[]) => void }) {
  const data = useData();
  const { toast } = useFeedback();
  const [form, setForm] = useState({ username: '', name: '', password: '', active: true });
  const [error, setError] = useState<string | null>(null);
  const [shownPassword, setShownPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setError(null);
    setShownPassword(null);
    setForm(user === 'new' ? { username: '', name: '', password: suggestPassword(), active: true } : { username: user.username, name: user.name, password: '', active: user.active });
  }, [user]);

  const save = async () => {
    setError(null);
    try {
      const isNew = user === 'new';
      const body = isNew
        ? { username: form.username, name: form.name, password: form.password }
        : { name: form.name, active: form.active, ...(form.password ? { password: form.password } : {}) };
      const { users } = await api<{ users: User[] }>(isNew ? '/users' : `/users/${(user as User).id}`, { method: isNew ? 'POST' : 'PUT', body });
      onSaved(users);
      if (form.password) setShownPassword(form.password);
      else {
        toast('Guardado');
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (shownPassword) {
    return (
      <Sheet open={user != null} onClose={onClose} title="Listo" left={<span />} right={<button type="button" className="link-btn strong" onClick={onClose}>OK</button>}>
        <p className="muted" style={{ textAlign: 'center', marginBottom: 16 }}>Pásale estos datos a la persona. La contraseña no se vuelve a mostrar.</p>
        <Group>
          <Row title="Usuario" value={<b style={{ color: 'var(--text)' }}>{form.username}</b>} />
          <Row title="Contraseña" value={<b style={{ color: 'var(--text)', fontFamily: 'ui-monospace, monospace' }}>{shownPassword}</b>} />
          <Row title="Dirección" value={<span style={{ fontSize: 14 }}>{location.origin}/admin</span>} />
        </Group>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={user != null}
      onClose={onClose}
      title={user === 'new' ? 'Nuevo usuario' : 'Editar usuario'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save}>Guardar</button>}
    >
      <Group>
        <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Nombre" maxLength={80} />
        {user === 'new' && (
          <TextField label="Usuario" value={form.username} onChange={(username) => setForm({ ...form, username: username.toLowerCase().replace(/\s/g, '') })} placeholder="ej. carlos" maxLength={40} />
        )}
      </Group>
      <Group label={user === 'new' ? 'Contraseña' : 'Nueva contraseña'} footer={user === 'new' ? 'Sugerida automáticamente. Puedes cambiarla.' : 'Déjala vacía para no cambiarla. Al cambiarla se cierran sus sesiones abiertas.'}>
        <TextField label="Contraseña" value={form.password} onChange={(password) => setForm({ ...form, password })} placeholder={user === 'new' ? '' : 'Sin cambios'} />
        {user !== 'new' && (
          <button type="button" className="row action" onClick={() => setForm({ ...form, password: suggestPassword() })}>
            <span className="row-label">Generar una nueva</span>
          </button>
        )}
      </Group>
      {user !== 'new' && user && user.id !== data.me.id && (
        <Group footer="Un usuario desactivado no puede entrar.">
          <SwitchRow label="Puede entrar" checked={form.active} onChange={(active) => setForm({ ...form, active })} />
        </Group>
      )}
      {error && <p className="field-error">{error}</p>}
    </Sheet>
  );
}

export function AccountScreen() {
  const data = useData();
  const { signOut } = useStore();
  const { toast, confirm } = useFeedback();
  const logout = async () => {
    if (await confirm({ title: '¿Cerrar sesión?', message: 'Para volver a entrar necesitarás tu usuario y tu contraseña.', confirm: 'Cerrar sesión' })) await signOut();
  };
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (next !== repeat) return setError('Las dos contraseñas nuevas no coinciden.');
    setBusy(true);
    try {
      await api('/auth/password', { method: 'POST', body: { current, next } });
      toast('Contraseña cambiada');
      setCurrent('');
      setNext('');
      setRepeat('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Mi cuenta" back={{ label: 'Inicio', to: '/' }} narrow>
      <div className="hero-head">
        <Avatar name={data.me.name} size="lg" />
        <h1 className="large-title">{data.me.name}</h1>
        <p className="muted">Usuario: {data.me.username}</p>
      </div>
      <Group>
        <Row to="/ajustes" leading={<IconBox icon={<UserCog size={17} />} color="#8e8e93" />} title="Ajustes" subtitle="Equipo, financieras, proveedores, usuarios, exportar" />
      </Group>
      <form onSubmit={submit}>
        <Group label="Cambiar contraseña" footer="Mínimo 10 caracteres. Se cerrará la sesión en tus otros dispositivos.">
          <label className="row-block stack-field">
            <span className="label">Contraseña actual</span>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </label>
          <label className="row-block stack-field">
            <span className="label">Nueva contraseña</span>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </label>
          <label className="row-block stack-field">
            <span className="label">Repite la nueva</span>
            <input type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" />
          </label>
        </Group>
        {error && <p className="field-error">{error}</p>}
        <div style={{ marginTop: 18 }}>
          <button type="submit" className="btn block" disabled={busy || !current || !next || !repeat}>
            {busy ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>

      <div className="group" style={{ marginTop: 30 }}>
        <button type="button" className="row danger" onClick={logout}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </Page>
  );
}

