/**
 * Professional Invoice PDF Export Utility
 * Uses jsPDF + jspdf-autotable to generate a clean, branded invoice report.
 */

export async function exportInvoicesPDF(invoices: any[], filename?: string) {
  // Dynamic import so the library is only loaded when needed
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
  doc.text('Aura Finance', 32, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ROSE);
  doc.text('Plateforme de gestion de factures IA', 32, 17);

  // Report label (right side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text("RAPPORT D'EXPORT", pageW - 10, 11, { align: 'right' });
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
    { label: 'Montant (TND)', value: formatCurrency(totalAmount) },
    { label: 'TVA (TND)',    value: formatCurrency(totalTax) },
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

  let currentY = 58;

  invoices.forEach((inv, index) => {
    // Page break logic (50px needed for header + approx 20px for table head)
    if (currentY > pageH - 70) {
      doc.addPage();
      currentY = 20;
    }

    const companyName = inv.companyName || 'Fournisseur Inconnu';
    const invNo = inv.invoiceNumber || 'N/A';
    const invDate = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('fr-FR') : '—';
    const status = translateStatus(inv.status || '—');
    const totalHT = formatCurrency(inv.extractedData?.totalHT || 0);
    const totalTVA = formatCurrency(inv.taxAmount || 0);
    const totalTTC = formatCurrency(inv.totalAmount || 0);

    // ── Invoice Header ───────────────────────────────────────────────────────
    doc.setFillColor(252, 250, 250);
    doc.setDrawColor(230, 222, 222);
    doc.setLineWidth(0.2);
    doc.roundedRect(10, currentY, pageW - 20, 26, 2, 2, 'FD');

    // Left side: Company & basic details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(companyName, 14, currentY + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text(`Facture N°:`, 14, currentY + 13);
    doc.setTextColor(...DARK);
    doc.text(invNo, 32, currentY + 13);

    doc.setTextColor(...GREY);
    doc.text(`Date:`, 14, currentY + 18);
    doc.setTextColor(...DARK);
    doc.text(invDate, 32, currentY + 18);

    doc.setTextColor(...GREY);
    doc.text(`Statut:`, 14, currentY + 23);
    doc.setFont('helvetica', 'bold');
    // Colorize status
    if (status === 'APPROUVÉ' || status === 'VÉRIFIÉ') doc.setTextColor(76, 175, 80);
    else if (status === 'SOUMIS' || status === 'EXTRAIT') doc.setTextColor(255, 193, 7);
    else if (status === 'REJETÉ') doc.setTextColor(217, 143, 143);
    else doc.setTextColor(...DARK);
    doc.text(status, 32, currentY + 23);

    // Right side: Financial details
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text(`Total H.T. :`, pageW - 60, currentY + 13);
    doc.text(`TVA :`, pageW - 60, currentY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(`Total T.T.C. :`, pageW - 60, currentY + 23);

    doc.setFont('helvetica', 'normal');
    doc.text(`${totalHT} TND`, pageW - 14, currentY + 13, { align: 'right' });
    doc.text(`${totalTVA} TND`, pageW - 14, currentY + 18, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WINE);
    doc.text(`${totalTTC} TND`, pageW - 14, currentY + 23, { align: 'right' });

    currentY += 30;

    // ── Line Items Table ─────────────────────────────────────────────────────
    const lineItems: any[] = inv.extractedData?.lineItems || [];
    if (lineItems.length === 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...GREY);
      doc.text("Aucun article extrait pour cette facture.", 14, currentY + 2);
      currentY += 12;
    } else {
      const head = [['Description', 'Quantité', 'Prix Unitaire', 'Total']];
      const body = lineItems.map((item) => [
        item.description || '—',
        item.quantity ?? '—',
        item.unitPrice != null ? formatCurrency(item.unitPrice) : '—',
        item.totalPrice != null ? formatCurrency(item.totalPrice) : '—'
      ]);

      autoTable(doc, {
        head,
        body,
        startY: currentY,
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 7.5,
          cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
          lineColor: [240, 235, 235],
          lineWidth: 0.1,
          textColor: [40, 20, 22],
          font: 'helvetica',
        },
        headStyles: {
          fillColor: [248, 243, 243],
          textColor: GREY,
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'left',
          lineWidth: 0.1,
          lineColor: [230, 222, 222]
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 12;
    }

    // Subtle separator between invoices
    if (index < invoices.length - 1) {
      doc.setDrawColor(240, 235, 235);
      doc.setLineWidth(0.5);
      doc.line(20, currentY - 5, pageW - 20, currentY - 5);
    }
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
    doc.text('Aura Finance — Rapport de factures', 10, pageH - 4);
    doc.text(`Page ${p} sur ${pageCount}`, pageW - 10, pageH - 4, { align: 'right' });
  }

  const name = filename || `Aura_Export_Factures_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(name);
}


