/**
 * Boton rojo "Salir", siempre arriba a la derecha en todas las pantallas:
 * cualquiera cierra su sesion de un toque (p. ej. al probar con el usuario de
 * un vendedor y volver al propio). En la vista previa ("Ver como") sale de ella.
 */
import { LogOut } from 'lucide-react';
import { useStore } from '../lib/store.tsx';
import { useFeedback } from './sheet.tsx';

export function SignOutButton() {
  const { data, signOut } = useStore();
  const { confirm } = useFeedback();
  if (!data) return null;
  const previewing = Boolean(data.viewer);
  const out = async () => {
    if (previewing) return signOut();
    if (await confirm({ title: '¿Cerrar sesión?', message: `Sales del usuario de ${data.me.name}. Para volver a entrar necesitas usuario y contraseña.`, confirm: 'Cerrar sesión', danger: true })) await signOut();
  };
  return (
    <button type="button" className="signout-btn" onClick={out} aria-label={previewing ? 'Salir de la vista previa' : 'Cerrar sesión'}>
      <LogOut size={17} strokeWidth={2.4} />
      <span>{previewing ? 'Salir de vista' : 'Salir'}</span>
    </button>
  );
}
