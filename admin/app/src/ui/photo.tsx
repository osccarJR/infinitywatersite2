/**
 * Foto de perfil: elegir una imagen y encuadrarla en el circulo (mover con
 * el dedo o el mouse y acercar). Se guarda recortada, cuadrada y liviana
 * (512x512 JPEG), asi carga al instante en cualquier telefono.
 */
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Camera, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import type { User } from '../../../shared/domain.ts';
import { api } from '../lib/api.ts';
import { useStore } from '../lib/store.tsx';
import { Sheet, useFeedback } from './sheet.tsx';
import { Avatar } from './kit.tsx';
import { createPortal } from 'react-dom';

const VIEW = 280; // tamano del circulo en pantalla
const OUT = 512; // tamano de la foto guardada

export function PhotoEditor({ hasPhoto }: { hasPhoto: boolean }) {
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const input = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Escala para que la foto cubra el circulo con zoom 1.
  const base = img ? Math.max(VIEW / img.naturalWidth, VIEW / img.naturalHeight) : 1;
  const scale = base * zoom;
  const w = img ? img.naturalWidth * scale : 0;
  const h = img ? img.naturalHeight * scale : 0;
  // Que nunca quede un hueco dentro del circulo.
  const clamp = (p: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(VIEW - w, p.x)),
    y: Math.min(0, Math.max(VIEW - h, p.y)),
  });

  useEffect(() => {
    if (!src) return;
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      const s = Math.max(VIEW / image.naturalWidth, VIEW / image.naturalHeight);
      setPos({ x: (VIEW - image.naturalWidth * s) / 2, y: (VIEW - image.naturalHeight * s) / 2 });
    };
    image.onerror = () => setError('No se pudo abrir esa imagen. Prueba con otra.');
    image.src = src;
  }, [src]);

  useEffect(() => {
    setPos((p) => clamp(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, img]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Elige una foto (JPG o PNG).', 'error');
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      setSrc(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos(clamp({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y }));
  };
  const up = () => {
    drag.current = null;
  };

  /** Acercar manteniendo el centro del circulo en el mismo punto de la foto. */
  const setZoomCentered = (next: number) => {
    const z = Math.min(4, Math.max(1, next));
    const cx = (VIEW / 2 - pos.x) / scale;
    const cy = (VIEW / 2 - pos.y) / scale;
    const s2 = base * z;
    setZoom(z);
    setPos({ x: VIEW / 2 - cx * s2, y: VIEW / 2 - cy * s2 });
  };

  const save = async () => {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d')!;
      const k = OUT / VIEW;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, pos.x * k, pos.y * k, w * k, h * k);
      const image = canvas.toDataURL('image/jpeg', 0.86);
      await api<{ user: User }>('/auth/avatar', { method: 'PUT', body: { image } });
      await reload();
      toast('Foto de perfil guardada');
      setSrc(null);
      setImg(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!(await confirm({ title: '¿Quitar tu foto?', message: 'Volverán a salir tus iniciales.', confirm: 'Quitar foto', danger: true }))) return;
    try {
      await api('/auth/avatar', { method: 'DELETE' });
      await reload();
      toast('Foto quitada');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="photo-actions">
        <button type="button" className="btn small gray" onClick={() => input.current?.click()}>
          <Camera size={16} /> {hasPhoto ? 'Cambiar foto' : 'Poner foto'}
        </button>
        {hasPhoto && (
          <button type="button" className="btn small gray danger-text" onClick={remove} aria-label="Quitar foto">
            <Trash2 size={16} />
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <Sheet
        open={src != null}
        onClose={() => {
          setSrc(null);
          setImg(null);
        }}
        title="Tu foto"
        left={
          <button type="button" className="link-btn" onClick={() => { setSrc(null); setImg(null); }}>
            Cancelar
          </button>
        }
        onSubmit={save}
        submitLabel="Usar esta foto"
        busy={busy || !img}
        error={error}
      >
        <p className="muted" style={{ textAlign: 'center', margin: '0 0 14px', fontSize: 14.5 }}>Mueve la foto y acerca para que tu cara quede en el círculo.</p>
        <div className="photo-crop" style={{ width: VIEW, height: VIEW }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {img && <img src={img.src} alt="" draggable={false} style={{ width: w, height: h, transform: `translate(${pos.x}px, ${pos.y}px)` }} />}
          <span className="photo-ring" aria-hidden="true" />
        </div>
        <div className="photo-zoom">
          <button type="button" className="icon-btn" onClick={() => setZoomCentered(zoom - 0.25)} aria-label="Alejar">
            <ZoomOut size={20} />
          </button>
          <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoomCentered(Number(e.target.value))} aria-label="Acercar" />
          <button type="button" className="icon-btn" onClick={() => setZoomCentered(zoom + 0.25)} aria-label="Acercar">
            <ZoomIn size={20} />
          </button>
        </div>
      </Sheet>
    </>
  );
}

/** Foto grande de perfil; al tocarla se ve en pantalla completa. */
export function ProfilePhoto({ name, photo }: { name: string; photo: string | null }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  if (!photo) return <Avatar name={name} size="xl" />;
  return (
    <>
      <button type="button" className="profile-photo" onClick={() => setOpen(true)} aria-label={`Ver la foto de ${name}`}>
        <Avatar name={name} size="xl" photo={photo} />
      </button>
      {open &&
        createPortal(
          <div className="photo-viewer" onClick={() => setOpen(false)} role="dialog" aria-label={`Foto de ${name}`}>
            <img src={photo} alt={name} />
            <span>{name}</span>
          </div>,
          document.body
        )}
    </>
  );
}
