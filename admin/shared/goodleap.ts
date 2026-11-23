/**
 * Formulario "Warranties & Right to Cancel" que exige GoodLeap (auditoria de
 * la financiera). Cuando el credito sale con GoodLeap, el cliente y el
 * vendedor lo firman ademas de la autorizacion de instalacion.
 *
 * El texto va TAL CUAL lo mando GoodLeap (encabezado "Infinity Water" y su
 * direccion, sin importar la marca de la venta), con los errores de escritura
 * corregidos ("Fort Meyers" -> "Fort Myers"). La traduccion al espanol es
 * solo para que el cliente entienda lo que firma; no se imprime.
 */

/** Version del texto: va en la huella de la firma. Cambiarla si cambia el formulario. */
export const GOODLEAP_DOC_VERSION = 'goodleap-warranties-2026-11b';

/** La financiera es GoodLeap (por el nombre en el catalogo). */
export const isGoodLeap = (name: string | null | undefined) => /good\s*-?\s*leap/i.test(name ?? '');

export const GOODLEAP_DOC = {
  title: 'Infinity Water',
  address: '835 Youngreen Dr, Fort Myers, FL 33913 | 475-685-8464',
  heading: 'WARRANTIES & RIGHT TO CANCEL',
  sections: [
    {
      title: 'AUTHORIZATION',
      en: 'This agreement authorizes the contractor to perform the work described in the estimate and/or proposal provided to the customer.',
      es: 'Este acuerdo autoriza al contratista a realizar el trabajo descrito en el presupuesto y/o la propuesta entregada al cliente.',
    },
    {
      title: 'WARRANTIES',
      en: 'The contractor warrants to the homeowner that materials and equipment furnished under the contract are of good quality and free from known defects. In addition to all manufacturer warranties, the contractor warrants that all work performed will conform to trade best practices and customs and provides an additional One-year (1) workmanship warranty to correct any defect in the work performed. This warranty excludes damage or defects caused by abuse, neglect, alterations to work not performed by the contractor, improper operation, and normal wear and tear. If the homeowner fails to notify contractor of defects within the one-year period or does not provide the contractor adequate opportunity to correct such defects, the homeowner waives the right to require corrections and waives any claims for breach of warranty.',
      es: 'El contratista garantiza al propietario que los materiales y equipos entregados bajo el contrato son de buena calidad y libres de defectos conocidos. Además de todas las garantías del fabricante, el contratista garantiza que todo el trabajo se hará según las mejores prácticas del oficio y da una garantía adicional de mano de obra de un (1) año para corregir cualquier defecto del trabajo realizado. Esta garantía no cubre daños o defectos causados por abuso, negligencia, cambios hechos por otros, mal uso ni el desgaste normal. Si el propietario no avisa al contratista de los defectos dentro de ese año, o no le da oportunidad de corregirlos, pierde el derecho a exigir las correcciones y a reclamar la garantía.',
    },
    {
      title: 'RIGHT TO CANCEL',
      en: 'Customer agrees and acknowledges that under state and federal law, Customer has a right to cancel this Agreement upon written notice to Company within three (3) business days of the Effective Date hereof without penalty.',
      es: 'El cliente reconoce que, según la ley estatal y federal, tiene derecho a cancelar este acuerdo, sin penalidad, avisando por escrito a la empresa dentro de los tres (3) días hábiles siguientes a la fecha de este acuerdo.',
    },
    {
      title: 'LIMITATION ON CANCELLATION',
      en: 'The homeowner may rescind this agreement within three (3) days after signing. Rescission may be made by giving verbal or written notice via email or text to the sales representative or manager primarily responsible for overseeing the performance of the work.',
      es: 'El propietario puede anular este acuerdo dentro de los tres (3) días siguientes a la firma. Puede hacerlo avisando de palabra o por escrito, por correo electrónico o mensaje de texto, al vendedor o al encargado responsable del trabajo.',
    },
  ],
};

/**
 * La venta necesita el formulario de GoodLeap firmado: financiada con GoodLeap y
 * activa. Los "clientes anteriores" (ventas ya hechas que se pasan al sistema) no
 * lo piden, salvo que la venta sea de los ultimos 14 dias: asi no sirve marcar
 * "cliente anterior" para saltarse el formulario en una venta nueva.
 */
export function goodleapRequired(s: { paymentMethod: string | null; status: string; isLegacy: boolean; saleDate: string }, financierName: string | null | undefined, today: string) {
  if (s.paymentMethod !== 'financed' || s.status !== 'active' || !isGoodLeap(financierName)) return false;
  if (!s.isLegacy) return true;
  const recent = new Date(`${today}T12:00:00Z`);
  recent.setUTCDate(recent.getUTCDate() - 14);
  return s.saleDate >= recent.toISOString().slice(0, 10);
}
