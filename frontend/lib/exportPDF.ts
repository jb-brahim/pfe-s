/**
 * Professional Invoice PDF Export Utility
 * Uses jsPDF + jspdf-autotable to generate a clean, branded invoice report.
 */

export async function exportInvoicesPDF(invoices: any[], filename?: string) {
  // Dynamic import so the library is only loaded when needed
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Brand colours ──────────────────────────────────────────────────────────
  const WINE   = [142,  27,  58] as [number,number,number];  // #8E1B3A
  const ROSE   = [217, 143, 143] as [number,number,number];  // #D98F8F
  const DARK   = [ 26,  10,  11] as [number,number,number];  // #1A0A0B
  const LIGHT  = [248, 243, 243] as [number,number,number];  // off-white bg
  const GREY   = [166, 150, 151] as [number,number,number];  // #A69697
  const WHITE  = [255, 255, 255] as [number,number,number];

  // ── Header Banner ──────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 28, 'F');

  // Accent stripe
  doc.setFillColor(...WINE);
  doc.rect(0, 0, 5, 28, 'F');

  // Logo placeholder circle
  doc.setFillColor(...WINE);
  doc.circle(18, 14, 8, 'F');
  doc.setFillColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('A', 18, 14.5, { align: 'center', baseline: 'middle' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('Aura Finance', 32, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ROSE);
  doc.text('Plateforme de gestion de factures IA', 32, 17);

  // Report label (right side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text("RAPPORT D'EXPORT DE FACTURES", pageW - 10, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.setFontSize(8);
  doc.text(`Généré le : ${date}`, pageW - 10, 17, { align: 'right' });
  doc.text(`Nombre total : ${invoices.length}`, pageW - 10, 22, { align: 'right' });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-TN', { minimumFractionDigits: 2 }).replace(/\s|\u202F|\u00A0/g, ' ');
  };

  const totalAmount = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalTax    = invoices.reduce((s, i) => s + (i.taxAmount   || 0), 0);
  const approved    = invoices.filter(i => i.status === 'APPROVED').length;
  const pending     = invoices.filter(i => ['SUBMITTED','EXTRACTED','VERIFIED'].includes(i.status)).length;

  doc.setFillColor(...LIGHT);
  doc.roundedRect(10, 32, pageW - 20, 18, 3, 3, 'F');

  const stats = [
    { label: 'Factures Totales', value: String(invoices.length) },
    { label: 'Montant Total (TND)', value: formatCurrency(totalAmount) },
    { label: 'TVA Totale (TND)',    value: formatCurrency(totalTax) },
    { label: 'Approuvées',          value: String(approved) },
    { label: 'En Attente',          value: String(pending) },
  ];

  const colW = (pageW - 20) / stats.length;
  stats.forEach((s, i) => {
    const x = 10 + colW * i + colW / 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WINE);
    doc.text(s.value, x, 38, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text(s.label, x, 44, { align: 'center' });
  });

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'APPROVED': 'APPROUVÉ',
      'VERIFIED': 'VÉRIFIÉ',
      'SUBMITTED': 'SOUMIS',
      'EXTRACTED': 'EXTRAIT',
      'REJECTED': 'REJETÉ',
      'FAILED': 'ÉCHOUÉ',
    };
    return map[status] || status;
  };

  // ── Build table rows ───────────────────────────────────────────────────────
  const head = [['#', 'N° Facture', 'Fournisseur', 'Date', 'Statut', 'Confiance IA', 'Total H.T.', 'TVA', 'Total T.T.C.', 'Description', 'Qté', 'Prix U.']];
  const body: (string | number)[][] = [];

  let rowIndex = 1;
  invoices.forEach((inv) => {
    const base = {
      num: rowIndex,
      invNo: inv.invoiceNumber || 'N/A',
      company: inv.companyName || 'N/A',
      date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('fr-FR') : '—',
      status: translateStatus(inv.status || '—'),
      conf: inv.confidence ? `${Math.round(inv.confidence * 100)}%` : '—',
      ht: formatCurrency(inv.extractedData?.totalHT || 0),
      tva: formatCurrency(inv.taxAmount || 0),
      ttc: formatCurrency(inv.totalAmount || 0),
    };

    const lineItems: any[] = inv.extractedData?.lineItems || [];
    if (lineItems.length === 0) {
      body.push([base.num, base.invNo, base.company, base.date, base.status, base.conf, base.ht, base.tva, base.ttc, 'Aucun article', '—', '—']);
      rowIndex++;
    } else {
      lineItems.forEach((item, li) => {
        body.push([
          li === 0 ? base.num : '',
          li === 0 ? base.invNo   : '',
          li === 0 ? base.company : '',
          li === 0 ? base.date    : '',
          li === 0 ? base.status  : '',
          li === 0 ? base.conf    : '',
          li === 0 ? base.ht      : '',
          li === 0 ? base.tva     : '',
          li === 0 ? base.ttc     : '',
          item.description || '—',
          item.quantity ?? '—',
          item.unitPrice != null ? formatCurrency(item.unitPrice) : '—',
        ]);
      });
      rowIndex++;
    }
  });

  // ── Render table ──────────────────────────────────────────────────────────
  autoTable(doc, {
    head,
    body,
    startY: 55,
    margin: { left: 10, right: 10 },
    styles: {
      fontSize: 8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: [230, 222, 222],
      lineWidth: 0.2,
      textColor: [40, 20, 22],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: WINE,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [253, 248, 248],
    },
    columnStyles: {
      0:  { halign: 'center', cellWidth: 8 },
      1:  { cellWidth: 26 },
      2:  { cellWidth: 32 },
      3:  { cellWidth: 18, halign: 'center' },
      4:  { cellWidth: 20, halign: 'center' },
      5:  { cellWidth: 18, halign: 'center' },
      6:  { cellWidth: 25, halign: 'right' },
      7:  { cellWidth: 20, halign: 'right' },
      8:  { cellWidth: 25, halign: 'right' },
      9:  { cellWidth: 'auto' },
      10: { cellWidth: 12, halign: 'center' },
      11: { cellWidth: 20, halign: 'right' },
    },
    // Set status text colour via styles instead of redrawing
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4 && data.cell.raw) {
        const status = String(data.cell.raw);
        if (status === 'APPROUVÉ' || status === 'VÉRIFIÉ') {
          data.cell.styles.textColor = [76, 175, 80];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'SOUMIS' || status === 'EXTRAIT') {
          data.cell.styles.textColor = [255, 193, 7];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'REJETÉ') {
          data.cell.styles.textColor = [217, 143, 143];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'ÉCHOUÉ') {
          data.cell.styles.textColor = [244, 67, 54];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...DARK);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text('Aura Finance — Rapport de factures confidentiel', 10, pageH - 4);
    doc.text(`Page ${p} sur ${pageCount}`, pageW - 10, pageH - 4, { align: 'right' });
  }

  const name = filename || `Aura_Export_Factures_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(name);
}

