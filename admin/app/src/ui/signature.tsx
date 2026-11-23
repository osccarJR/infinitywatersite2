/**
 * Firma con el dedo (o el mouse) en la pantalla, y la hoja que pasa de un
 * firmante al siguiente: cada uno marca que acepta firmar electronicamente y
 * firma. Se entrega cada firma como PNG recortado (fondo transparente).
 */
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Eraser } from 'lucide-react';
import { Sheet } from './sheet.tsx';

export interface SignaturePadHandle {
  empty: boolean;
}

function SignaturePad({ onChange }: { onChange: (png: string | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const box = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  const setup = () => {
    const c = canvas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = c.getBoundingClientRect();
    c.width = Math.round(width * ratio);
    c.height = Math.round(height * ratio);
    const ctx = c.getContext('2d')!;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0b1f3a';
    ctx.lineWidth = 2.6;
    box.current = null;
    setEmpty(true);
    onChange(null);
  };

  useEffect(() => {
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const grow = (p: { x: number; y: number }) => {
    const b = box.current;
    box.current = b ? { x0: Math.min(b.x0, p.x), y0: Math.min(b.y0, p.y), x1: Math.max(b.x1, p.x), y1: Math.max(b.y1, p.y) } : { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
  };

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvas.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    last.current = p;
    grow(p);
    const ctx = canvas.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1f3a';
    ctx.fill();
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    e.preventDefault();
    const ctx = canvas.current!.getContext('2d')!;
    const p = point(e);
    const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    grow(p);
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const b = box.current;
    // Un toque suelto no es una firma.
    if (!b || (b.x1 - b.x0 < 24 && b.y1 - b.y0 < 12)) return;
    setEmpty(false);
    onChange(exportPng());
  };

  /** Solo el trazo, recortado y en tamano razonable. */
  const exportPng = () => {
    const c = canvas.current!;
    const b = box.current!;
    const ratio = c.width / c.getBoundingClientRect().width;
    const pad = 8;
    const sx = Math.max(0, (b.x0 - pad) * ratio);
    const sy = Math.max(0, (b.y0 - pad) * ratio);
    const sw = Math.min(c.width - sx, (b.x1 - b.x0 + pad * 2) * ratio);
    const sh = Math.min(c.height - sy, (b.y1 - b.y0 + pad * 2) * ratio);
    const scale = Math.min(1, 700 / sw);
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(sw * scale));
    out.height = Math.max(1, Math.round(sh * scale));
    out.getContext('2d')!.drawImage(c, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  };

  return (
    <div className="sig-pad">
      <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} aria-label="Firme aquí" />
      <div className="sig-line" aria-hidden="true" />
      {empty && <span className="sig-hint">Firme aquí con el dedo · Sign here</span>}
      <button type="button" className="sig-clear" onClick={setup}>
        <Eraser size={16} /> Borrar
      </button>
    </div>
  );
}

export interface Signer {
  key: string;
  /** "Aplicante", "Coaplicante", "Vendedor"... */
  role: string;
  name: string;
}

/**
 * Hoja de firmas: un firmante a la vez. `onDone` recibe las firmas por clave;
 * si falla (error del servidor) la hoja sigue abierta con el aviso.
 */
export function SignSheet({
  open,
  onClose,
  title,
  signers,
  agreement,
  finishLabel,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  signers: Signer[];
  /** Lo que se esta firmando (texto en ingles y espanol). */
  agreement: ReactNode;
  finishLabel: string;
  onDone: (signatures: Record<string, string>) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [sigs, setSigs] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(0);
      setSigs({});
      setCurrent(null);
      setAgreed(false);
      setError(null);
    }
  }, [open]);

  const signer = signers[step];
  const lastStep = step === signers.length - 1;

  const next = async () => {
    setError(null);
    if (!agreed) return setError('Marque la casilla para aceptar firmar electrónicamente.');
    if (!current) return setError('Falta la firma.');
    const all = { ...sigs, [signer.key]: current };
    if (!lastStep) {
      setSigs(all);
      setCurrent(null);
      setAgreed(false);
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      await onDone(all);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!signer) return null;
  return (
    <Sheet open={open} onClose={onClose} title={title} onSubmit={next} submitLabel={lastStep ? finishLabel : 'Siguiente firma'} busy={busy} error={error}>
      <div className="sig-steps">
        {signers.map((s, i) => (
          <span key={s.key} className={i === step ? 'on' : i < step ? 'done' : ''}>
            {i < step ? '✓ ' : ''}
            {s.role}
          </span>
        ))}
      </div>
      <div className="sig-who">
        <span>{signer.role}</span>
        <b>{signer.name || '—'}</b>
      </div>
      <div className="sig-agreement">{agreement}</div>
      <label className="sig-consent">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          Yo, <b>{signer.name || signer.role}</b>, acepto firmar este documento electrónicamente y que mi firma electrónica vale igual que mi firma a mano.
          <i> I agree to sign this document electronically and that my electronic signature has the same effect as my handwritten signature.</i>
        </span>
      </label>
      {/* Un lienzo nuevo por firmante. */}
      <SignaturePad key={signer.key} onChange={setCurrent} />
    </Sheet>
  );
}
