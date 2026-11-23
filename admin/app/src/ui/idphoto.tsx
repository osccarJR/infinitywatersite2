/**
 * Foto de una ID (licencia, pasaporte...): se toma con la camara del telefono,
 * se achica (lado mayor 1600 px, JPEG) para que suba rapido aunque la senal
 * sea mala y se guarda cifrada en el servidor.
 */
import { useRef, useState } from 'react';
import { Camera, RotateCcw, Trash2 } from 'lucide-react';
import { useFeedback } from './sheet.tsx';

const MAX = 1600;

/** Archivo de la camara -> JPEG liviano (data URL). */
export async function compressPhoto(file: File): Promise<string> {
  // Data URL (no blob:): la politica de seguridad del panel solo deja data: en imagenes.
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la foto. Prueba otra vez.'));
    reader.readAsDataURL(file);
  });
  {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('No se pudo leer la foto. Prueba otra vez.'));
      el.src = url;
    });
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    let quality = 0.82;
    let out = canvas.toDataURL('image/jpeg', quality);
    // Debajo del limite del servidor (1 MB por envio), con margen.
    while (out.length > 950_000 && quality > 0.3) {
      quality -= 0.12;
      out = canvas.toDataURL('image/jpeg', quality);
    }
    return out;
  }
}

export function IdPhoto({
  label,
  src,
  disabled,
  onPick,
  onRemove,
  field,
}: {
  label: string;
  /** URL de la foto guardada (o null si no hay). */
  src: string | null;
  disabled?: boolean;
  onPick: (dataUrl: string) => Promise<void>;
  onRemove?: () => Promise<void>;
  field?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { confirm } = useFeedback();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      await onPick(await compressPhoto(file));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="id-photo" data-field={field}>
      {/* Sin "capture": el iPhone deja elegir entre tomar la foto o usar una que ya tiene (p. ej. de WhatsApp). */}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {src ? (
        <div className="id-photo-img">
          <img src={src} alt={label} />
          {!disabled && (
            <div className="id-photo-actions">
              <button type="button" onClick={() => input.current?.click()} disabled={busy}>
                <RotateCcw size={15} /> Repetir
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={async () => {
                    if (await confirm({ title: '¿Quitar esta foto?', confirm: 'Quitar', danger: true })) onRemove().catch((err) => setError(err.message));
                  }}
                  disabled={busy}
                  aria-label="Quitar foto"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button type="button" className="id-photo-empty" onClick={() => input.current?.click()} disabled={disabled || busy}>
          <Camera size={26} />
          <span>{busy ? 'Subiendo…' : 'Tomar foto'}</span>
        </button>
      )}
      <span className="id-photo-label">{label}</span>
      {error && <span className="id-photo-error">{error}</span>}
    </div>
  );
}
