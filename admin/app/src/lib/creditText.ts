/**
 * Textos de la solicitud de credito y de la autorizacion de instalacion
 * (contrato), en ingles y espanol. Corregidos del formulario en papel:
 *  - Va la marca con la que se vende (Infinity, Magic Water, 4Elements...).
 *  - La ley y la licencia son las del estado de la venta (Florida), no la
 *    "Contractors State License Board" de California que traia el papel.
 *  - En Florida, el aviso "Buyer's right to cancel" de las ventas en casa del
 *    cliente, junto a la firma, y el aviso de cancelacion con las fechas.
 * Conviene que un abogado los revise.
 */

export const COMPANY_ADDRESS = { street: '3940 Metro Pkwy, Office 109', city: 'Fort Myers, FL 33916', line: '3940 Metro Pkwy, Office 109, Fort Myers, FL 33916' };
export const COMPANY_PHONES = ['+1 (239) 223-5394', '+1 (475) 685-8464'];
export const SECOND_OFFICE = '167 Davenport Ridge Road, Stamford, Connecticut 06903';

const STATE_NAMES: Record<string, string> = {
  FL: 'Florida', GA: 'Georgia', TX: 'Texas', NC: 'North Carolina', SC: 'South Carolina', AL: 'Alabama', NY: 'New York', NJ: 'New Jersey', CT: 'Connecticut',
  MA: 'Massachusetts', PA: 'Pennsylvania', CA: 'California', IL: 'Illinois', TN: 'Tennessee', VA: 'Virginia', AZ: 'Arizona', OH: 'Ohio', MI: 'Michigan', MD: 'Maryland', CO: 'Colorado', NV: 'Nevada',
};
export const stateName = (code: string | null | undefined) => STATE_NAMES[(code || 'FL').toUpperCase()] ?? (code || 'Florida');

/* ------------------------------------------------------------------ */
/* Solicitud de credito                                                 */
/* ------------------------------------------------------------------ */

export const CREDIT_AUTH = {
  en: 'By signing below, you certify that all information in this application is true and complete. You authorize us to verify the information in this application and to give information about you or your account to credit reporting agencies and others who are allowed to receive it. You authorize and instruct us to request and receive credit information about you from any credit reporting agency or other third party.',
  es: 'Al firmar, usted certifica que toda la información de esta solicitud es verdadera y completa. Usted nos autoriza a verificar la información de esta solicitud y a dar información sobre usted o su cuenta a las agencias de reporte de crédito y a otras personas autorizadas a recibirla. Usted nos autoriza y nos instruye a solicitar y recibir información de crédito sobre usted de cualquier agencia de reporte de crédito u otro tercero.',
};

export const ALIMONY_NOTE = {
  en: 'Alimony, child support or separate maintenance income need not be revealed if you do not wish to have it considered as a basis for repaying this obligation.',
  es: 'No es necesario declarar ingresos por pensión alimenticia, manutención de menores o manutención por separación si no desea que se tomen en cuenta para pagar esta obligación.',
};

/* ------------------------------------------------------------------ */
/* Autorizacion de instalacion (contrato)                               */
/* ------------------------------------------------------------------ */

export function contractText(brand: string, stateCode: string) {
  const B = brand;
  const st = stateName(stateCode);
  const florida = (stateCode || 'FL').toUpperCase() === 'FL';
  return {
    proposal: {
      en: `${B} hereby proposes to furnish all products, materials and labor to install the following, and the Buyer(s) hereby order and buy the products, materials, labor and installation of the following.`,
      es: `${B} propone proveer todos los productos, materiales y mano de obra para instalar lo especificado a continuación, y el(los) Comprador(es) ordena(n) y compra(n) los productos, materiales, mano de obra e instalación especificados a continuación.`,
    },
    placement: {
      en: `The placement of the water treatment equipment is determined by ${B} authorized installation personnel and the Buyer(s), at the best possible location.`,
      es: `El lugar de instalación de la planta de tratamiento de agua lo establecen el personal de instalación autorizado de ${B} y el(los) Comprador(es), en la mejor ubicación posible.`,
    },
    payment: {
      en: `Upon signing, you acknowledge that you agree to the terms and conditions of this contract, that you are applying for credit, and that you authorize ${B} to obtain a consumer credit report. If financed, you agree to pay the finance charges disclosed by the finance company in addition to the sales price shown below.`,
      es: `Con su firma, usted reconoce que está de acuerdo con los términos y condiciones de este contrato, que ha solicitado crédito y que autoriza a ${B} a obtener un reporte de crédito del consumidor. Si es financiado, usted se compromete a pagar los cargos de financiamiento que indique la financiera, además del precio de venta que aparece abajo.`,
    },
    beforeSigning: {
      en: 'Do not sign this contract until you have read it and all of the blank spaces are completed. You have the right to receive a completed copy of this contract. You have the right to prepay the full amount at any time and to be notified of the full amount due.',
      es: 'No firme este contrato hasta haberlo leído y hasta que todos los espacios estén completos. Usted tiene derecho a recibir una copia completa de este contrato. Usted tiene derecho a pagar por anticipado el monto total en cualquier momento y a ser notificado del saldo total a pagar.',
    },
    /** Florida, ventas en casa del cliente (va junto a la firma del comprador). */
    rightToCancel: florida
      ? {
          en: "BUYER'S RIGHT TO CANCEL: This is a home solicitation sale, and if you do not want the goods or services, you may cancel this agreement by providing written notice to the seller in person, by telegram, or by mail. This notice must indicate that you do not want the goods or services and must be delivered or postmarked before midnight of the third business day after you sign this agreement. If you cancel this agreement, the seller may not keep all or part of any cash down payment.",
          es: 'DERECHO DEL COMPRADOR A CANCELAR: Esta es una venta realizada en su domicilio y, si usted no desea los productos o servicios, puede cancelar este acuerdo entregando un aviso por escrito al vendedor en persona, por telegrama o por correo. El aviso debe indicar que usted no desea los productos o servicios y debe entregarse o tener sello postal antes de la medianoche del tercer día hábil después de firmar este acuerdo. Si usted cancela este acuerdo, el vendedor no puede quedarse con todo ni parte de ningún pago inicial en efectivo.',
        }
      : {
          en: 'You, the Buyer(s), may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction. See the attached Notice of Cancellation for an explanation of this right.',
          es: 'Usted, el(los) Comprador(es), puede cancelar esta transacción en cualquier momento antes de la medianoche del tercer día hábil después de la fecha de esta transacción. Vea el Aviso de Cancelación adjunto para la explicación de este derecho.',
        },
    validity: {
      en: `This contract is valid only upon signed approval by management personnel at the ${B} home office. See the terms and conditions on the following pages. A restocking fee of 20% will be charged for transactions that are cancelled after the three-business-day cancellation period.`,
      es: `Este contrato es válido solo con la firma de aprobación del personal de la oficina central de ${B}. Vea los términos y condiciones en las páginas siguientes. Se cobrará un cargo de reposición del 20% por las transacciones que se cancelen después del plazo de cancelación de tres días hábiles.`,
    },
    licensing: florida
      ? {
          en: "Florida law requires that contractors who perform certain types of construction work be licensed by the Florida Department of Business and Professional Regulation (DBPR). You may verify a contractor's license and complaint history at www.myfloridalicense.com.",
          es: 'La ley de Florida exige que los contratistas que realizan ciertos tipos de trabajo de construcción tengan licencia del Departamento de Regulación Profesional y de Negocios de Florida (DBPR). Usted puede verificar la licencia de un contratista y su historial de quejas en www.myfloridalicense.com.',
        }
      : {
          en: `The laws of the State of ${st} may require that contractors who perform certain types of construction work be licensed. You may verify a contractor's license with the ${st} licensing agency.`,
          es: `Las leyes del estado de ${st} pueden exigir que los contratistas que realizan ciertos tipos de trabajo de construcción tengan licencia. Usted puede verificar la licencia de un contratista con la agencia de licencias de ${st}.`,
        },
    terms: {
      en: [
        `Title to the equipment and materials covered in this Contract shall remain the legal property of ${B} until the equipment and materials are paid in full. You acknowledge that you are giving a security interest in the goods purchased. The Buyer(s) agree that there is no written agreement or verbal understanding of any kind with ${B}, or any of its representatives, whereby this Contract, or any part of it, is to be altered, modified or varied in any manner other than as set forth herein. The terms and conditions of this Contract are the complete and exclusive statement of the agreement between the parties and supersede all prior or contemporaneous negotiations, statements and representations. There are no representations, inducements, promises or agreements, oral or otherwise, regarding this sale other than those expressly set forth herein. Anything not in writing and approved by management personnel of ${B} will not be honored.`,
        `${B} agrees to start and diligently pursue the work through to completion, but shall not be responsible for delays caused by any of the following: funding of loans; acts, neglect or omissions of the Buyer(s) or the Buyer(s)' agent; acts of God; stormy or inclement weather; extra work ordered by the Buyer(s); acts of a public enemy; riots or civil commotion; failure of the Buyer(s) to make payments when due; acts of independent contractors; holidays; or other causes beyond ${B}'s control. The Buyer(s) shall grant free access to the work areas for workers, equipment and vehicles. ${B} workers shall not be responsible for keeping gates closed for animals and children.`,
        `This Contract shall be construed in accordance with and governed by the laws of the State of ${st}. If any provision of this Contract is held invalid for any reason, that invalidity shall be limited to that provision and shall not affect the remaining provisions, which shall continue in full force and effect.`,
        'If a dispute relating to this Contract results in litigation between the parties concerning the work or any related matter, the prevailing party shall be entitled to reasonable attorney\'s fees and costs.',
        'All work will be done according to approved industry standards. This does not include the correction of defects in existing plumbing or other inadequate building conditions.',
        `Financing terms are subject to approval and verification by the financing institution. You authorize ${B} to obtain a credit report for the purpose of financing this Contract. Additional financing terms and truth-in-lending disclosures will be provided by the finance company. If the Buyer(s) are denied credit by one financing institution, the application may be submitted to other financing institutions, banks or companies; in that case the repayment period, amount financed and APR (interest rate) are subject to change according to that institution's terms and conditions.`,
        'Additional terms and conditions may be stated in a separate Addendum to this Contract. If an Addendum is signed by the Buyer(s), it shall be incorporated herein and become part of this Proposal – Work Order – Contract.',
      ],
      es: [
        `La propiedad del equipo y de los materiales cubiertos por este Contrato permanecerá legalmente en manos de ${B} hasta que el equipo y los materiales se paguen por completo. Usted reconoce que otorga una garantía (interés de seguridad) sobre la mercancía que compra. El(los) Comprador(es) acepta(n) que no existe ningún acuerdo escrito ni entendimiento verbal de ningún tipo con ${B}, ni con ninguno de sus representantes, por el cual este Contrato o parte de él se altere, modifique o varíe de forma distinta a lo aquí establecido. Los términos y condiciones de este Contrato son la declaración completa y exclusiva del acuerdo entre las partes y reemplazan todas las negociaciones, declaraciones y representaciones anteriores o simultáneas. No existen representaciones, incentivos, promesas ni acuerdos, orales o de otro tipo, sobre esta venta, salvo los expresamente aquí establecidos. Nada que no esté por escrito y aprobado por el personal gerencial de ${B} tendrá validez.`,
        `${B} se compromete a comenzar y continuar diligentemente el trabajo hasta terminarlo, pero no será responsable de demoras causadas por: la aprobación de préstamos; actos, negligencia u omisiones del(los) Comprador(es) o de su agente; casos fortuitos; mal tiempo o tormentas; trabajos adicionales ordenados por el(los) Comprador(es); actos de enemigos públicos; disturbios o conmoción civil; falta de pago del(los) Comprador(es) en la fecha debida; actos de contratistas independientes; días feriados; u otras causas fuera del control de ${B}. El(los) Comprador(es) dará(n) libre acceso a las áreas de trabajo a los trabajadores, equipos y vehículos. Los trabajadores de ${B} no son responsables de mantener cerradas las puertas o rejas para animales y niños.`,
        `Este Contrato se interpretará y regirá por las leyes del estado de ${st}. Si cualquier disposición de este Contrato fuera inválida por cualquier razón, la invalidez se limitará a esa disposición y no afectará a las demás, que seguirán vigentes.`,
        'Si una disputa relacionada con este Contrato termina en un litigio entre las partes sobre el trabajo o cualquier asunto relacionado, la parte que prevalezca tendrá derecho al pago de honorarios razonables de abogado y costas.',
        'Todo el trabajo se hará según las normas aprobadas por la industria. Esto no incluye la corrección de defectos en las tuberías existentes ni otras condiciones inadecuadas de la construcción.',
        `Los términos de financiamiento están sujetos a la aprobación y verificación de la institución financiera. Usted autoriza a ${B} a obtener un reporte de crédito con el fin de financiar este Contrato. La financiera le entregará los demás términos de financiamiento y la información exigida por la ley de veracidad en los préstamos ("truth in lending"). Si una institución financiera le niega el crédito al(los) Comprador(es), la solicitud puede presentarse a otras instituciones financieras, bancos o compañías; en ese caso, el plazo de pago, el monto financiado y la tasa APR (interés) pueden cambiar según los términos y condiciones de esa institución.`,
        'Se pueden establecer términos y condiciones adicionales en un Anexo a este Contrato por separado. Si el(los) Comprador(es) firma(n) un Anexo, este se incorporará a este Contrato y será parte de esta Propuesta – Orden de Trabajo – Contrato.',
      ],
    },
    notice: (transaction: string, deadline: string) => ({
      en: `You, the Buyer(s), may cancel this transaction, without any penalty or obligation, within three business days from the date of transaction (${transaction}). If you cancel, any property traded in, any payments made by you under the contract or sale, and any negotiable instrument executed by you will be returned within 10 business days following receipt by the seller of your cancellation notice, and any security interest arising out of the transaction will be cancelled. If you cancel, you must make available to the seller at your residence, in substantially as good condition as when received, any goods delivered to you under this contract or sale; or you may, if you wish, comply with the instructions of the seller regarding the return shipment of the goods at the seller's expense and risk. If you do make the goods available to the seller and the seller does not pick them up within 20 days of the date of your notice of cancellation, you may retain or dispose of the goods without any further obligation. If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and fail to do so, then you remain liable for performance of all obligations under the contract. To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice, or any other written notice, to ${B}, ${COMPANY_ADDRESS.line}, not later than midnight of ${deadline}.`,
      es: `Usted, el(los) Comprador(es), puede cancelar esta transacción, sin multa ni obligación alguna, dentro de los tres días hábiles siguientes a la fecha de la transacción (${transaction}). Si cancela, cualquier bien entregado como parte de pago, cualquier pago que haya hecho bajo el contrato o la venta, y cualquier instrumento negociable que haya firmado le serán devueltos dentro de los 10 días hábiles siguientes a que el vendedor reciba su aviso de cancelación, y cualquier garantía (interés de seguridad) que surja de la transacción quedará anulada. Si cancela, debe poner a disposición del vendedor en su residencia, en condiciones sustancialmente tan buenas como cuando los recibió, los productos que se le entregaron bajo este contrato o venta; o, si lo desea, puede seguir las instrucciones del vendedor para devolverlos por envío, a costo y riesgo del vendedor. Si pone los productos a disposición del vendedor y este no los recoge dentro de los 20 días siguientes a la fecha de su aviso de cancelación, usted puede quedarse con ellos o desecharlos sin ninguna otra obligación. Si no pone los productos a disposición del vendedor, o si acepta devolverlos y no lo hace, seguirá siendo responsable de cumplir todas las obligaciones del contrato. Para cancelar esta transacción, envíe por correo o entregue una copia firmada y fechada de este aviso de cancelación, o cualquier otro aviso por escrito, a ${B}, ${COMPANY_ADDRESS.line}, a más tardar a la medianoche del ${deadline}.`,
    }),
    receivedCopy: { en: 'I have received a copy of this document, including the Notice of Cancellation.', es: 'Recibí copia de este documento, incluido el Aviso de Cancelación.' },
  };
}
