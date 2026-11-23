/** Avisos de creditos en Inicio (por revisar, aprobadas por firmar...). */
import { BadgeCheck, ClipboardSignature, List, Plus, ShieldAlert, XCircle } from 'lucide-react';
import type { CreditSummary } from '../../../shared/credit.ts';
import { useData } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { Link } from '../lib/router.tsx';

/* ------------------------------------------------------------------ */

export function CreditAlerts() {
  const data = useData();
  const a = useAccess();
  const fills = a.can('credit.create');
  const reviews = a.can('credit.review');
  if (!fills && !reviews) return null;
  const toReview = reviews ? data.credit.filter((c) => c.status === 'submitted') : [];
  const mine = (c: CreditSummary) => c.createdById === data.me.id || (a.personId != null && c.sellerId === a.personId);
  // La autorizacion la llena el vendedor; la oficina ve solo un resumen.
  const toSign = data.credit.filter((c) => c.status === 'approved' && mine(c));
  const waitingSign = reviews ? data.credit.filter((c) => c.status === 'approved' && !mine(c)) : [];
  const returned = data.credit.filter((c) => c.status === 'draft' && mine(c));
  const declined = data.credit.filter((c) => c.status === 'declined' && mine(c) && !reviews && c.decidedAt && Date.now() - Date.parse(`${c.decidedAt.replace(' ', 'T')}Z`) < 7 * 86_400_000);
  if (!toReview.length && !toSign.length && !returned.length && !declined.length && !waitingSign.length) return null;
  return (
    <div className="credit-alerts">
      {toReview.length > 0 && (
        <Link to="/creditos?filtro=submitted" className="credit-alert blue">
          <ShieldAlert size={22} />
          <span>
            <b>{toReview.length === 1 ? '1 solicitud de crédito por revisar' : `${toReview.length} solicitudes de crédito por revisar`}</b>
            <span>{toReview.slice(0, 3).map((c) => c.applicantName).join(', ')}</span>
          </span>
        </Link>
      )}
      {toSign.map((c) => (
        <Link key={c.id} to={`/creditos/${c.id}/autorizacion`} className="credit-alert green">
          <BadgeCheck size={22} />
          <span>
            <b>Crédito aprobado · {c.applicantName}</b>
            <span>Llena y hazle firmar la autorización de instalación</span>
          </span>
        </Link>
      ))}
      {waitingSign.length > 0 && (
        <Link to="/creditos?filtro=approved" className="credit-alert">
          <BadgeCheck size={22} />
          <span>
            <b>{waitingSign.length === 1 ? '1 crédito aprobado' : `${waitingSign.length} créditos aprobados`} esperando la firma del cliente</b>
            <span>{waitingSign.slice(0, 3).map((c) => c.applicantName).join(', ')}</span>
          </span>
        </Link>
      )}
      {returned.map((c) => (
        <Link key={c.id} to={`/creditos/${c.id}/editar`} className="credit-alert orange">
          <ClipboardSignature size={22} />
          <span>
            <b>{c.returnNote ? 'Devuelta por la oficina' : 'Solicitud sin enviar'} · {c.applicantName}</b>
            <span>{c.returnNote ?? 'Complétala, que firme el cliente y envíala a la oficina'}</span>
          </span>
        </Link>
      ))}
      {declined.map((c) => (
        <Link key={c.id} to={`/creditos/${c.id}`} className="credit-alert red">
          <XCircle size={22} />
          <span>
            <b>Crédito negado · {c.applicantName}</b>
            <span>Toca para ver el detalle</span>
          </span>
        </Link>
      ))}
    </div>
  );
}


/** Inicio de quien solo llena creditos: empezar una solicitud o ver las suyas. */
export function CreditStart() {
  const data = useData();
  const open = data.credit.filter((c) => c.status !== 'signed' && c.status !== 'declined').length;
  return (
    <div className="doc-actions">
      <Link to="/creditos/nueva" className="doc-action">
        <span className="doc-icon invoice">
          <Plus size={20} />
        </span>
        <span>
          <b>Nueva solicitud de crédito</b>
          <span>En casa del cliente: fotos de las IDs, datos y firmas</span>
        </span>
      </Link>
      <Link to="/creditos" className="doc-action">
        <span className="doc-icon order">
          <List size={20} />
        </span>
        <span>
          <b>Mis solicitudes</b>
          <span>{data.credit.length ? `${data.credit.length} en total · ${open} en proceso` : 'Todavía no tienes solicitudes'}</span>
        </span>
      </Link>
    </div>
  );
}
