/**
 * Entrada al sistema. Fondo vivo con los colores de la gota del logo y olas
 * de agua; en escritorio, panel de marca a la izquierda.
 */
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Lock, Receipt, User as UserIcon, Users, Wrench } from 'lucide-react';
import { api } from '../lib/api.ts';
import { useStore } from '../lib/store.tsx';
import type { User } from '../../../shared/domain.ts';
import { TIME_ZONE } from '../../../shared/domain.ts';

function greeting() {
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: TIME_ZONE }).format(new Date()));
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Olas de agua en bucle: cada capa es el doble de ancha y se desplaza la mitad. */
function Waves() {
  const wave = (y: number, amp: number) => {
    let d = `M0 ${y}`;
    for (let i = 0; i < 4; i++) {
      const x = i * 720;
      d += ` C${x + 180} ${y - amp}, ${x + 540} ${y + amp}, ${x + 720} ${y}`;
    }
    return `${d} L2880 320 L0 320 Z`;
  };
  return (
    <div className="login-waves" aria-hidden="true">
      <svg viewBox="0 0 2880 320" preserveAspectRatio="none" className="wave w1"><path d={wave(150, 46)} /></svg>
      <svg viewBox="0 0 2880 320" preserveAspectRatio="none" className="wave w2"><path d={wave(185, 38)} /></svg>
      <svg viewBox="0 0 2880 320" preserveAspectRatio="none" className="wave w3"><path d={wave(220, 30)} /></svg>
    </div>
  );
}

export function Login() {
  const { signedIn } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    try {
      if (sessionStorage.getItem('iw-session-ended')) {
        sessionStorage.removeItem('iw-session-ended');
        return 'Tu sesión se cerró (por seguridad o porque cambió la contraseña). Entra otra vez.';
      }
    } catch {
      /* sin almacenamiento */
    }
    return null;
  });
  const [state, setState] = useState<'idle' | 'busy' | 'ok'>('idle');
  const passwordRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /** Temblor corto ante un error (no se ejecuta si el sistema pide menos movimiento). */
  const shake = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    formRef.current?.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
      { duration: 420, easing: 'ease-out' }
    );
  };
  const hello = useRef(greeting()).current;

  useEffect(() => {
    document.title = 'Entrar · Infinity Water y Magic Water';
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError(!username.trim() ? 'Escribe tu usuario.' : 'Escribe tu contraseña.');
      shake();
      return;
    }
    setState('busy');
    setError(null);
    try {
      const { user } = await api<{ user: User }>('/auth/login', { method: 'POST', body: { username, password } });
      setState('ok');
      await new Promise((r) => setTimeout(r, 550)); // deja ver el ✓
      await signedIn(user);
    } catch (err: any) {
      setError(err.message);
      setState('idle');
      shake();
      setPassword('');
      passwordRef.current?.focus();
    }
  };

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => setCaps(event.getModifierState?.('CapsLock') ?? false);

  return (
    <div className="login">
      <div className="login-aurora" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <Waves />

      <div className="login-grid">
        {/* Panel de marca (solo escritorio) */}
        <aside className="login-brand" aria-hidden="true">
          <div className="login-brand-top">
            <span className="logo-pill">
              <img src="/admin/logo-infinity.webp" alt="" />
              <i />
              <img src="/admin/logo-magic.webp" alt="" />
            </span>
          </div>
          <h2>
            Todo tu negocio,
            <br />
            en un solo lugar.
          </h2>
          <ul>
            <li>
              <span><Users size={20} /></span>Clientes y lo que tienen instalado
            </li>
            <li>
              <span><Receipt size={20} /></span>Ventas, financieras y comisiones
            </li>
            <li>
              <span><Wrench size={20} /></span>Servicio técnico y mantenimientos
            </li>
          </ul>
          <p className="login-brand-foot">Infinity Water · Magic Water · Fort Myers, Florida</p>
        </aside>

        <main className="login-panel">
          <div className="login-head">
            <div className="logo-pill login-logos">
              <img src="/admin/logo-infinity.webp" alt="Infinity Water" />
              <i />
              <img src="/admin/logo-magic.webp" alt="Magic Water" />
            </div>
            <p className="login-eyebrow">{hello}</p>
            <h1>Gestión del negocio</h1>
            <p className="login-sub">Entra para ver cómo va el negocio.</p>
          </div>

          <form onSubmit={submit} noValidate className="login-form" ref={formRef}>
            <label className="login-field">
              <UserIcon size={20} className="login-icon" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                enterKeyHint="next"
                aria-invalid={Boolean(error) || undefined}
              />
              <span className="login-label">Usuario</span>
            </label>

            <label className="login-field">
              <Lock size={20} className="login-icon" />
              <input
                ref={passwordRef}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onKey}
                onKeyDown={onKey}
                placeholder=" "
                autoComplete="current-password"
                enterKeyHint="go"
                aria-invalid={Boolean(error) || undefined}
              />
              <span className="login-label">Contraseña</span>
              <button
                type="button"
                className="login-eye"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={show}
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>

            <div className={`login-msg${error ? ' error' : ''}`} role="alert" aria-live="assertive">
              {error ?? (caps ? 'Ojo: las mayúsculas están activadas.' : '')}
            </div>

            <button type="submit" className={`login-btn ${state}`} disabled={state !== 'idle'}>
              {state === 'busy' ? (
                <span className="login-spin" aria-label="Entrando" />
              ) : state === 'ok' ? (
                <>
                  <Check size={22} strokeWidth={3} /> Listo
                </>
              ) : (
                <>
                  Entrar <ArrowRight size={20} strokeWidth={2.4} />
                </>
              )}
            </button>
            <p className="login-note">Tu sesión queda abierta 30 días en este equipo.</p>
          </form>

          <p className="login-foot">Acceso solo para personal autorizado</p>
        </main>
      </div>
    </div>
  );
}
