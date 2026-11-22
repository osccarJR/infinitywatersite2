import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Client } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { goBack, navigate, useLeaveGuard } from '../lib/router.tsx';
import { focusField } from '../lib/focus.ts';
import { api } from '../lib/api.ts';
import { formatPhone } from '../lib/format.ts';
import { Empty, Group, Page, StackField, TextField } from '../ui/kit.tsx';
import { ClientExtraFields, ClientFields, EMPTY_CLIENT, clientDraftToInput, type ClientDraft } from '../ui/pickers.tsx';
import { useFeedback } from '../ui/sheet.tsx';

export function ClientForm({ id }: { id?: number }) {
  const data = useData();
  const { reload } = useStore();
  const { toast } = useFeedback();
  const existing = id ? data.clientById.get(id) : undefined;

  const [draft, setDraft] = useState<ClientDraft>(() =>
    existing
      ? {
          name: existing.name,
          phone: existing.phone ?? '',
          email: existing.email ?? '',
          address: existing.address ?? '',
          city: existing.city ?? '',
          state: existing.state ?? '',
          zip: existing.zip ?? '',
          language: existing.language,
          source: existing.source,
        }
      : { ...EMPTY_CLIENT }
  );
  const [phone2, setPhone2] = useState(existing?.phone2 ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirm } = useFeedback();
  const snapshot = () => JSON.stringify({ draft, phone2, notes });
  const initial = useRef<string | null>(null);
  initial.current ??= snapshot();
  const savedId = useRef<number | null>(id ?? null);
  const version = useRef<string | undefined>(existing?.updatedAt);
  const leaving = useRef(false);

  useEffect(() => setError(null), [draft, phone2, notes]);

  useLeaveGuard(
    () => !leaving.current && snapshot() !== initial.current,
    () => confirm({ title: '¿Salir sin guardar?', message: 'Lo que escribiste se perderá.', confirm: 'Salir sin guardar', cancel: 'Seguir editando', danger: true })
  );

  if (id && !existing) {
    return (
      <Page title="Cliente" back={{ label: 'Clientes', to: '/clientes' }}>
        <Empty title="Este cliente no existe" />
      </Page>
    );
  }

  // Aviso de posible duplicado por telefono.
  const digits = draft.phone.replace(/\D/g, '');
  const duplicate =
    digits.length >= 10 ? data.clients.find((c) => c.id !== id && (c.phone ?? '').replace(/\D/g, '').endsWith(digits.slice(-10))) : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Escribe el nombre del cliente');
      focusField(formRef.current, 'name');
      return;
    }
    setBusy(true);
    setError(null);
    const saveId = savedId.current;
    const body = {
      ...clientDraftToInput(draft),
      phone2: phone2.trim() || null,
      notes: notes.trim() || null,
      ...(saveId ? { expectedUpdatedAt: version.current } : {}),
    };
    let client: Client;
    try {
      ({ client } = await api<{ client: Client }>(saveId ? `/clients/${saveId}` : '/clients', { method: saveId ? 'PUT' : 'POST', body }));
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
      focusField(formRef.current, err.field);
      return;
    }
    savedId.current = client.id;
    version.current = client.updatedAt;
    try {
      await reload();
    } catch {
      setBusy(false);
      setError('Se guardó, pero no se pudo actualizar la pantalla. Revisa tu conexión y toca Guardar otra vez.');
      return;
    }
    leaving.current = true;
    toast(id ? 'Cambios guardados' : 'Cliente agregado');
    if (id) goBack(`/clientes/${id}`, { force: true });
    else navigate(`/clientes/${client.id}`, { replace: true, force: true });
  };

  const back = id ? { label: 'Cliente', to: `/clientes/${id}` } : { label: 'Clientes', to: '/clientes' };

  return (
    <Page title={id ? 'Editar cliente' : 'Cliente nuevo'} back={back} narrow>
      <form onSubmit={submit} noValidate ref={formRef}>
        <Group label="Contacto">
          <ClientFields draft={draft} onChange={setDraft} autoFocus={!id} />
          <TextField
            field="phone2"
            label="Teléfono 2"
            type="tel"
            inputMode="tel"
            value={phone2}
            onChange={setPhone2}
            onBlur={() => phone2 && setPhone2(formatPhone(phone2))}
            placeholder="opcional"
          />
        </Group>
        {duplicate && (
          <div className="group-foot" style={{ color: 'var(--orange)' }}>
            Ojo: {duplicate.name} ya tiene este teléfono.
          </div>
        )}

        <Group label="Más datos">
          <ClientExtraFields draft={draft} onChange={setDraft} />
        </Group>

        <Group label="Notas">
          <StackField label="Notas internas" value={notes} onChange={setNotes} placeholder="Cómo llegar, perro en el patio, mejor hora para llamar…" multiline />
        </Group>

        <div className="form-actions">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="button" className="btn gray" onClick={() => goBack(back.to)}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Guardando…' : id ? 'Guardar cambios' : 'Agregar cliente'}
          </button>
        </div>
      </form>
    </Page>
  );
}
