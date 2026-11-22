/**
 * Una cuenta por pagar dibujada como tarjeta de verdad: chip, pago sin
 * contacto, numero en relieve, red (Visa, Mastercard, American Express,
 * Discover) y colores de cada una. En la computadora se inclina con el mouse
 * y tiene un brillo que lo sigue.
 */
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Landmark, Store, User, Wallet } from 'lucide-react';
import type { CardColor, PayableAccount, PayableAccountKind } from '../../../shared/domain.ts';
import { PAYABLE_KIND_LABEL } from '../../../shared/domain.ts';
import { Link } from '../lib/router.tsx';

export type Network = 'visa' | 'mastercard' | 'amex' | 'discover' | null;

/** La red de la tarjeta, por el nombre que le puso el usuario. */
export function networkOf(account: Pick<PayableAccount, 'name' | 'kind'> & Partial<Pick<PayableAccount, 'network'>>): Network {
  if (account.kind !== 'card') return null;
  if (account.network === 'none') return null;
  if (account.network) return account.network;
  const name = account.name.toLowerCase();
  if (/visa/.test(name)) return 'visa';
  if (/master/.test(name)) return 'mastercard';
  if (/amex|american/.test(name)) return 'amex';
  if (/discover/.test(name)) return 'discover';
  return null;
}

/** Fondo de la tarjeta: el de su red; si no, segun el tipo de cuenta. */
/** Colores que se pueden elegir para una tarjeta. */
export const CARD_THEMES: Record<CardColor, { label: string; background: string }> = {
  black: { label: 'Negro', background: 'linear-gradient(135deg, #0b0b0d 0%, #222327 55%, #34363c 100%)' },
  silver: { label: 'Plata', background: 'linear-gradient(135deg, #4b525c 0%, #8d949e 45%, #b9bec6 70%, #6c737d 100%)' },
  gold: { label: 'Dorado', background: 'linear-gradient(135deg, #6e5114 0%, #b88e2f 40%, #e0c068 65%, #9a7424 100%)' },
  blue: { label: 'Azul', background: 'linear-gradient(135deg, #0a1a5c 0%, #1534a8 48%, #2f63e6 100%)' },
  navy: { label: 'Azul oscuro', background: 'linear-gradient(135deg, #050b24 0%, #0f1c4d 55%, #1d2f72 100%)' },
  green: { label: 'Verde', background: 'linear-gradient(135deg, #0b4a37 0%, #137a4c 55%, #2bb673 100%)' },
  teal: { label: 'Turquesa', background: 'linear-gradient(135deg, #0b5d6b 0%, #1f8e9f 45%, #6cc6cf 100%)' },
  purple: { label: 'Morado', background: 'linear-gradient(135deg, #3d1a8f 0%, #6a35d8 55%, #a46cf2 100%)' },
  red: { label: 'Rojo', background: 'linear-gradient(135deg, #5e0b16 0%, #b3172b 55%, #ec4a5a 100%)' },
  pink: { label: 'Rosado', background: 'linear-gradient(135deg, #7a1650 0%, #c2307f 55%, #f27bb5 100%)' },
  orange: { label: 'Naranja', background: 'linear-gradient(135deg, #7a3300 0%, #d1650a 55%, #f7a23a 100%)' },
};

export function cardTheme(account: Pick<PayableAccount, 'name' | 'kind'> & Partial<Pick<PayableAccount, 'color' | 'network'>>): string {
  if (account.color && CARD_THEMES[account.color]) return CARD_THEMES[account.color].background;
  const name = account.name.toLowerCase();
  switch (networkOf(account)) {
    case 'visa':
      return 'linear-gradient(135deg, #0a1a5c 0%, #1534a8 48%, #2f63e6 100%)';
    case 'mastercard':
      return 'linear-gradient(135deg, #111214 0%, #26282c 52%, #3a2f28 100%)';
    case 'amex':
      return 'linear-gradient(135deg, #0b5d6b 0%, #1f8e9f 45%, #6cc6cf 100%)';
    case 'discover':
      return 'linear-gradient(135deg, #1a1a1a 0%, #333 60%, #5a3a1c 100%)';
  }
  if (/personal/.test(name)) return 'linear-gradient(135deg, #3d1a8f 0%, #6a35d8 55%, #a46cf2 100%)';
  switch (account.kind) {
    case 'card':
      return 'linear-gradient(135deg, #073b6b 0%, #0a72c2 100%)';
    case 'supplier':
      return 'linear-gradient(135deg, #0b4a37 0%, #1d9a5a 100%)';
    case 'loan':
      return 'linear-gradient(135deg, #2c3240 0%, #5f6b80 100%)';
    case 'person':
      return 'linear-gradient(135deg, #64206f 0%, #b74fca 100%)';
    default:
      return 'linear-gradient(135deg, #3d4450 0%, #858e9c 100%)';
  }
}

const KIND_ICON: Record<PayableAccountKind, typeof Wallet> = { card: Wallet, supplier: Store, loan: Landmark, person: User, other: Wallet };

function Chip() {
  return (
    <svg className="pc-chip" viewBox="0 0 46 34" aria-hidden="true">
      <defs>
        <linearGradient id="pc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e3a1" />
          <stop offset="0.45" stopColor="#d9b55a" />
          <stop offset="1" stopColor="#a9802d" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="45" height="33" rx="6" fill="url(#pc-gold)" stroke="rgba(0,0,0,0.25)" />
      <g fill="none" stroke="rgba(90,60,10,0.55)" strokeWidth="1">
        <path d="M15 1v32M31 1v32M1 12h14M31 12h14M1 22h14M31 22h14" />
        <rect x="15" y="9" width="16" height="16" rx="3" />
      </g>
    </svg>
  );
}

function Contactless() {
  return (
    <svg className="pc-nfc" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M8.5 8.5a5 5 0 0 1 0 7" />
      <path d="M12 6a8.5 8.5 0 0 1 0 12" />
      <path d="M15.5 3.5a12 12 0 0 1 0 17" />
    </svg>
  );
}

/** Marca de la red, dibujada (no son imagenes externas). */
function NetworkMark({ network }: { network: Network }) {
  switch (network) {
    case 'mastercard':
      return (
        <svg className="pc-mark mc" viewBox="0 0 52 32" role="img" aria-label="Mastercard">
          <defs>
            <clipPath id="pc-mc-left">
              <circle cx="18" cy="16" r="14" />
            </clipPath>
          </defs>
          <circle cx="18" cy="16" r="14" fill="#eb001b" />
          <circle cx="34" cy="16" r="14" fill="#f79e1b" />
          <circle cx="34" cy="16" r="14" fill="#ff5f00" clipPath="url(#pc-mc-left)" />
        </svg>
      );
    case 'visa':
      return (
        <span className="pc-mark visa" role="img" aria-label="Visa">
          VISA
        </span>
      );
    case 'amex':
      return (
        <span className="pc-mark amex" role="img" aria-label="American Express">
          <span>AMERICAN</span>
          <span>EXPRESS</span>
        </span>
      );
    case 'discover':
      return (
        <span className="pc-mark discover" role="img" aria-label="Discover">
          DISC<i />VER
        </span>
      );
    default:
      return null;
  }
}

const dots = (last4: string, network: Network) => (network === 'amex' ? `•••• •••••• •${last4}` : `•••• •••• •••• ${last4}`);

export function PaymentCard({
  account,
  amountLabel,
  amount,
  dueLabel,
  dueTone,
  usage,
  to,
  large,
  footnote,
}: {
  account: PayableAccount;
  amountLabel: string;
  amount: ReactNode;
  dueLabel: ReactNode;
  dueTone?: 'alert';
  /** 0..1 del cupo usado (tarjetas con cupo). */
  usage: number | null;
  to?: string;
  large?: boolean;
  footnote?: ReactNode;
}) {
  const network = networkOf(account);
  const isCard = account.kind === 'card';
  const Icon = KIND_ICON[account.kind];

  // Inclinacion 3D con el mouse (solo con mouse y si el sistema no pide menos movimiento).
  const move = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width;
    const y = (event.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
    el.classList.add('tilting');
  };
  const leave = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.classList.remove('tilting');
  };

  const body = (
    <>
      <span className="pc-glare" aria-hidden="true" />
      <span className="pc-row pc-top">
        <span className="pc-bank">{account.name}</span>
        {isCard ? <Contactless /> : <span className="pc-kind"><Icon size={15} /> {PAYABLE_KIND_LABEL[account.kind]}</span>}
      </span>
      {isCard && (
        <span className="pc-row pc-chiprow">
          <Chip />
          {!account.active && <span className="pc-off">Inactiva</span>}
        </span>
      )}
      {isCard && account.last4 && <span className="pc-number num">{dots(account.last4, network)}</span>}
      <span className="pc-row pc-bottom">
        <span className="pc-field">
          <span className="pc-label">{amountLabel}</span>
          <span className="pc-amount num">{amount}</span>
        </span>
        <span className="pc-field pc-due">
          <span className="pc-label">Pago</span>
          <span className={`pc-due-value${dueTone ? ' ' + dueTone : ''}`}>{dueLabel}</span>
        </span>
        <NetworkMark network={network} />
      </span>
      {footnote && <span className="pc-foot">{footnote}</span>}
      {usage != null && (
        <span className="pc-usage" aria-label={`Uso del cupo ${Math.round(usage * 100)}%`}>
          <span style={{ width: `${Math.min(usage, 1) * 100}%` }} className={usage > 0.9 ? 'hot' : ''} />
        </span>
      )}
    </>
  );

  const className = `pay-card${large ? ' large' : ''}${network ? ' ' + network : ''}${isCard ? '' : ' plain'}`;
  const style = { background: cardTheme(account) } as CSSProperties;
  if (to) {
    return (
      <Link to={to} className={className} style={style} onMouseMove={move} onMouseLeave={leave} aria-label={`${account.name}: ${amountLabel}`}>
        {body}
      </Link>
    );
  }
  return (
    <div className={className} style={style} onMouseMove={move} onMouseLeave={leave}>
      {body}
    </div>
  );
}
