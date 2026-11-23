/**
 * Solicitud de credito y autorizacion de instalacion (contrato).
 *
 * Proceso: el vendedor llena la solicitud en casa del cliente (fotos de las
 * IDs, datos, firmas del aplicante, coaplicante y vendedor) -> la oficina la
 * pasa a la financiera y la aprueba o la niega -> si se aprueba, el vendedor
 * llena la autorizacion de instalacion, firman cliente(s) y vendedor y se
 * crea la venta.
 *
 * Los datos de identidad (SSN, fecha de nacimiento, licencia) van aparte y
 * cifrados (`CreditSecret`); el resto (`CreditData`) es informacion normal.
 */
import type { Equipment } from './domain.ts';

export type CreditStatus = 'draft' | 'submitted' | 'approved' | 'declined' | 'signed';

export const CREDIT_STATUS_LABEL: Record<CreditStatus, string> = {
  draft: 'Por firmar',
  submitted: 'Por revisar',
  approved: 'Aprobada',
  declined: 'Negada',
  signed: 'Instalación autorizada',
};

export interface CreditPerson {
  firstName: string;
  lastName: string;
  cellPhone: string;
  homePhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  previousAddress: string;
  employer: string;
  years: string;
  salary: string;
  position: string;
  businessPhone: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  previousEmployer: string;
  otherIncome: string;
}

export type HomeStatus = 'paid' | 'mortgaged' | 'rent';

export interface CreditReference {
  name: string;
  relationship: string;
  phone: string;
}

export interface CreditData {
  applicant: CreditPerson;
  coApplicant: CreditPerson | null;
  home: { status: HomeStatus | null; company: string; monthlyPayment: string; howLong: string };
  references: CreditReference[];
  /** Lo que la oficina pidio corregir al devolverla. */
  returnNote?: string | null;
}

export interface CreditIdentity {
  ssn: string;
  dob: string;
  dl: string;
  dlExp: string;
}

export interface CreditSecret {
  applicant: CreditIdentity;
  coApplicant: CreditIdentity | null;
}

/** Evidencia de una firma electronica (la imagen va aparte, cifrada). */
export interface SignatureProof {
  name: string;
  at: string;
  ip: string | null;
  device: string | null;
  /** Huella (SHA-256) del documento tal como estaba al firmar. */
  hash: string;
}

export type CreditSigner = 'applicant' | 'coApplicant' | 'rep';
export type ContractSigner = 'buyer1' | 'buyer2' | 'rep';

export interface CreditDecision {
  financierId: number | null;
  approvedAmount: number | null;
  apr: number | null;
  termMonths: number | null;
  monthlyPayment: number | null;
  notes: string | null;
}

export type InstallSlot = 'am' | 'pm';

export interface ContractData {
  date: string;
  buyer1: { name: string; phone: string; email: string };
  buyer2: { name: string; phone: string; email: string } | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  waterTreatment: { brand: string; model: string };
  reverseOsmosis: { brand: string; model: string };
  other: string;
  /** Lo que se instala, para crear la venta. */
  equipment: Equipment;
  installDate: string | null;
  installSlot: InstallSlot | null;
  waterSource: 'city' | 'well' | null;
  iceMaker: boolean | null;
  people: number | null;
  floor: 'raised' | 'slab' | null;
  payment: 'card' | 'check' | null;
  /** Montos en centavos. */
  cashPrice: number | null;
  installation: number | null;
  taxes: number | null;
  downPayment: number | null;
  amountToFinance: number | null;
  payments: number | null;
  monthlyPayment: number | null;
  apr: number | null;
}

/** Lo que se ve en la lista (sin datos de identidad). */
export interface CreditSummary {
  id: number;
  status: CreditStatus;
  brandId: number | null;
  clientId: number | null;
  sellerId: number | null;
  saleId: number | null;
  appDate: string;
  amount: number | null;
  applicantName: string;
  coApplicantName: string | null;
  city: string;
  financierId: number | null;
  submittedAt: string | null;
  decidedAt: string | null;
  signedAt: string | null;
  createdBy: string | null;
  createdById: number | null;
  updatedAt: string;
  purged: boolean;
}

export interface CreditApp extends CreditSummary {
  data: CreditData;
  /** Tapado (•••-••-1234) salvo para quien la esta llenando o la aprueba. */
  secret: CreditSecret;
  secretMasked: boolean;
  signatures: Partial<Record<CreditSigner, SignatureProof>>;
  decision: CreditDecision | null;
  decidedBy: string | null;
  contract: ContractData | null;
  contractSignatures: Partial<Record<ContractSigner, SignatureProof>>;
  /** Archivos guardados (fotos de IDs y firmas). */
  files: string[];
}

export const ID_PHOTOS = ['id1-front', 'id1-back', 'id2-front', 'id2-back'] as const;
export type IdPhotoKind = (typeof ID_PHOTOS)[number];
export const CREDIT_SIGNATURE_FILE: Record<CreditSigner, string> = { applicant: 'sig-applicant', coApplicant: 'sig-co', rep: 'sig-rep' };
export const CONTRACT_SIGNATURE_FILE: Record<ContractSigner, string> = { buyer1: 'sig-buyer1', buyer2: 'sig-buyer2', rep: 'sig-rep2' };
export const CREDIT_FILE_KINDS = [...ID_PHOTOS, ...Object.values(CREDIT_SIGNATURE_FILE), ...Object.values(CONTRACT_SIGNATURE_FILE)];

/** Dias que se guardan el SSN, la licencia y las fotos de las IDs despues de decidir. */
export const CREDIT_KEEP_DAYS = 90;

export const emptyPerson = (): CreditPerson => ({
  firstName: '', lastName: '', cellPhone: '', homePhone: '', email: '', address: '', city: '', state: '', zip: '', previousAddress: '',
  employer: '', years: '', salary: '', position: '', businessPhone: '', employerAddress: '', employerCity: '', employerState: '', employerZip: '', previousEmployer: '', otherIncome: '',
});
export const emptyIdentity = (): CreditIdentity => ({ ssn: '', dob: '', dl: '', dlExp: '' });
export const emptyCreditData = (): CreditData => ({
  applicant: emptyPerson(),
  coApplicant: null,
  home: { status: null, company: '', monthlyPayment: '', howLong: '' },
  references: [0, 1, 2].map(() => ({ name: '', relationship: '', phone: '' })),
});

export const personName = (p: Pick<CreditPerson, 'firstName' | 'lastName'> | null | undefined) =>
  p ? `${p.firstName} ${p.lastName}`.replace(/\s+/g, ' ').trim() : '';

/* ------------------------------------------------------------------ */
/* Datos de identidad                                                   */
/* ------------------------------------------------------------------ */

export const MASK_CHAR = '•';
export const isMasked = (v: string) => v.includes(MASK_CHAR);
const digits = (v: string) => v.replace(/\D/g, '');

/** 123456789 -> 123-45-6789 */
export function formatSsn(v: string) {
  const d = digits(v).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

export function maskIdentity(id: CreditIdentity): CreditIdentity {
  const ssn = digits(id.ssn);
  return {
    ssn: ssn ? `${MASK_CHAR.repeat(3)}-${MASK_CHAR.repeat(2)}-${ssn.slice(-4)}` : '',
    dob: id.dob ? `${MASK_CHAR.repeat(2)}/${MASK_CHAR.repeat(2)}/${id.dob.slice(0, 4)}` : '',
    dl: id.dl ? `${MASK_CHAR.repeat(Math.max(id.dl.length - 4, 2))}${id.dl.slice(-4)}` : '',
    dlExp: id.dlExp,
  };
}

export const maskSecret = (s: CreditSecret): CreditSecret => ({
  applicant: maskIdentity(s.applicant),
  coApplicant: s.coApplicant ? maskIdentity(s.coApplicant) : null,
});

/* ------------------------------------------------------------------ */
/* Contrato                                                             */
/* ------------------------------------------------------------------ */

export const SLOT_LABEL: Record<InstallSlot, string> = { am: '8:00 am – 1:00 pm', pm: '1:00 pm – 6:00 pm' };

/** Franja del contrato a partir de la hora del panel ("10:00 am – 12:00 pm" -> am). */
export function slotOf(time: string | null | undefined): InstallSlot | null {
  const m = /(\d{1,2})(?::\d{2})?\s*(am|pm)/i.exec(time ?? '');
  if (!m) return null;
  const h = (Number(m[1]) % 12) + (m[2].toLowerCase() === 'pm' ? 12 : 0);
  return h < 13 ? 'am' : 'pm';
}

export function contractTotals(c: Pick<ContractData, 'cashPrice' | 'installation' | 'taxes' | 'downPayment'>) {
  const total = (c.cashPrice ?? 0) + (c.installation ?? 0) + (c.taxes ?? 0);
  const balance = Math.max(total - (c.downPayment ?? 0), 0);
  return { total, balance };
}

const FIXED_HOLIDAYS = ['01-01', '06-19', '07-04', '11-11', '12-25'];
/** Feriados federales que caen en un dia de la semana (lunes de enero, etc.). */
function movingHoliday(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const weekday = d.getUTCDay();
  const nth = Math.ceil(day / 7);
  const last = day + 7 > new Date(Date.UTC(d.getUTCFullYear(), month, 0)).getUTCDate();
  return (
    (weekday === 1 && ((month === 1 && nth === 3) || (month === 2 && nth === 3) || (month === 5 && last) || (month === 9 && nth === 1) || (month === 10 && nth === 2))) ||
    (weekday === 4 && month === 11 && nth === 4)
  );
}

/**
 * Ultimo dia para cancelar una venta hecha en casa del cliente: 3 dias
 * habiles despues de firmar (no cuentan los domingos ni los feriados
 * federales).
 */
export function cancelDeadline(signedIso: string) {
  let d = new Date(`${signedIso}T12:00:00Z`);
  let left = 3;
  while (left > 0) {
    d = new Date(d.getTime() + 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    if (d.getUTCDay() === 0 || FIXED_HOLIDAYS.includes(iso.slice(5)) || movingHoliday(iso)) continue;
    left--;
  }
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Marca y logo                                                         */
/* ------------------------------------------------------------------ */

/** Logo de cada marca (si no hay archivo, se escribe el nombre). */
export function brandLogo(name: string | null | undefined): string | null {
  const n = (name ?? '').toLowerCase();
  if (n.includes('magic')) return '/admin/logo-magic.webp';
  if (n.includes('infinity')) return '/admin/logo-infinity.webp';
  // 4Elements y MAGNUM: el padre manda los logos; mientras, va el nombre escrito.
  return null;
}

/** Nombre de la marca como va en los documentos ("INFINITY WATER"). */
export const brandUpper = (name: string | null | undefined) => (name || 'Infinity Water').toUpperCase();
