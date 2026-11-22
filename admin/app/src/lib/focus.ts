/**
 * Llevar al usuario al campo que tiene el problema: baja la pantalla hasta
 * el, lo resalta un momento y pone el cursor ahi. Los campos se marcan con
 * data-field="saleDate", "client.create.phone"... (las mismas rutas que usa
 * la validacion del servidor).
 */
export function focusField(root: HTMLElement | null, field: string | undefined): boolean {
  if (!root || !field) return false;
  // Exacto y, si no existe, el contenedor mas cercano ("equipment.roType" -> "equipment").
  const parts = field.split('.');
  let el: HTMLElement | null = null;
  for (let n = parts.length; n > 0 && !el; n--) {
    el = root.querySelector<HTMLElement>(`[data-field="${CSS.escape(parts.slice(0, n).join('.'))}"]`);
  }
  return el ? reveal(el) : false;
}

/** Primer monto mal escrito del formulario. */
export function focusInvalid(root: HTMLElement | null): boolean {
  const input = root?.querySelector<HTMLElement>('[aria-invalid="true"]');
  return input ? reveal(input.closest<HTMLElement>('.row, .row-block') ?? input) : false;
}

function reveal(el: HTMLElement) {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('field-flash');
  void el.offsetWidth; // reinicia la animacion
  el.classList.add('field-flash');
  setTimeout(() => el.classList.remove('field-flash'), 2600);
  const target = el.matches('input, textarea, select, button') ? el : el.querySelector<HTMLElement>('input, textarea, select, button');
  setTimeout(() => target?.focus({ preventScroll: true }), 380);
  return true;
}
