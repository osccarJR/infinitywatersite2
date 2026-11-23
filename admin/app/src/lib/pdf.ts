/**
 * PDF de un documento del panel (paginas .wp-page tamano carta), hecho en el
 * mismo telefono, para mandarlo por WhatsApp o guardarlo. En el iPhone abre
 * el menu de compartir con el archivo ya listo; si el navegador no puede
 * compartir archivos, lo descarga.
 */
export async function documentPdf(pages: HTMLElement[], filename: string): Promise<File> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);
  const root = document.documentElement;
  // Sin el zoom de pantalla chica: se captura al tamano real de la hoja.
  root.classList.add('wp-capturing');
  try {
    const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait', compress: true });
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      if (i > 0) pdf.addPage('letter', 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.86), 'JPEG', 0, 0, 8.5, 11, undefined, 'FAST');
    }
    return new File([pdf.output('blob')], filename, { type: 'application/pdf' });
  } finally {
    root.classList.remove('wp-capturing');
  }
}

/** Comparte el PDF (WhatsApp, correo...) o lo descarga. */
export async function sharePdf(file: File, title: string): Promise<'shared' | 'downloaded' | 'cancelled' | 'blocked'> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') return 'cancelled';
      // El iPhone pide un toque nuevo si hacer el PDF tardo: hay que tocar otra vez.
      if (err?.name === 'NotAllowedError') return 'blocked';
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return 'downloaded';
}
