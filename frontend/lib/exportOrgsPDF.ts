import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Aura Finance brand colors
const PRIMARY: [number, number, number] = [142, 27, 58];     // #8E1B3A (Wine)
const DARK: [number, number, number] = [30, 10, 11];         // #1E0A0B (Dark bg)
const TEXT_DARK: [number, number, number] = [40, 40, 40];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];

export async function exportOrgsPDF(orgs: any[], filename?: string) {
  const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  
  // ── Modern Header ────────────────────────────────────────────────────────
  // Top thin accent line
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 4, 'F');

  // Logo circle
  doc.setFillColor(...PRIMARY);
  doc.circle(25, 20, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('A', 25, 22.5, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('AURA FINANCE', 35, 22);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('RAPPORT DES ORGANISATIONS', 35, 27);
  
  const date = new Date().toLocaleDateString('fr-FR');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Date de génération :`, pageW - 15, 20, { align: 'right' });
  doc.setTextColor(...TEXT_DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(`${date}`, pageW - 15, 25, { align: 'right' });

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(15, 35, pageW - 15, 35);

  let startY = 45;

  orgs.forEach((org, index) => {
    // Each organization on a new page (except the first one)
    if (index > 0) {
      doc.addPage();
      startY = 20;
    } else {
      startY = 45;
    }

    const name = org.companyDetails?.name || org.name || 'Inconnu';
    const email = org.email || 'N/A';
    const plan = org.billing?.plan || 'Ultra';
    const amount = org.billing?.amount || 49;
    
    let statusText = org.status || 'Inconnu';
    if (statusText === 'Active') statusText = 'Actif';
    if (statusText === 'Suspended') statusText = 'Suspendu';
    if (statusText === 'Pending Deletion') statusText = 'En attente de suppression';

    const renewal = org.billing?.renewalDate ? new Date(org.billing?.renewalDate).toLocaleDateString('fr-FR') : 'N/A';
    const employees = org.employees || [];

    // ── Organization Header ────────────────────────────────────────────────
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(15, startY, pageW - 30, 24, 2, 2, 'FD'); // Fill and Draw border

    // Left block: Name & Email
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(`${name}`, 20, startY + 8.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Propriétaire : `, 20, startY + 15);
    doc.setTextColor(...TEXT_DARK);
    doc.text(`${email}`, 42, startY + 15);
    
    // Middle block: Status
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Statut : `, 20, startY + 20);
    
    // Status badge-like text
    if (statusText === 'Actif') doc.setTextColor(34, 197, 94);
    else if (statusText === 'Suspendu') doc.setTextColor(245, 158, 11);
    else doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text(`${statusText}`, 32, startY + 20);

    // Right block: Plan & Billing
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text(`Plan ${plan}`, pageW - 20, startY + 8.5, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Tarif : `, pageW - 40, startY + 15, { align: 'right' });
    doc.setTextColor(...TEXT_DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(`${amount} TND/mois`, pageW - 20, startY + 15, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Renouvellement : `, pageW - 38, startY + 20, { align: 'right' });
    doc.setTextColor(...TEXT_DARK);
    doc.text(`${renewal}`, pageW - 20, startY + 20, { align: 'right' });

    startY += 28; // move down for table

    // ── Employees Table ────────────────────────────────────────────────────
    if (employees.length > 0) {
      const head = [['Employé', 'Adresse Email', 'Rôle']];
      const body = employees.map((emp: any) => {
        let roleText = emp.role || 'N/A';
        if (roleText === 'ADMIN') roleText = 'Administrateur Organisation';
        if (roleText === 'ACCOUNTANT') roleText = 'Comptable';
        if (roleText === 'SUPER_ADMIN') roleText = 'Opérateur de service';
        return [emp.name || 'N/A', emp.email || 'N/A', roleText];
      });

      autoTable(doc, {
        startY: startY,
        head,
        body,
        theme: 'grid',
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [60, 60, 60],
          fontStyle: 'bold',
          fontSize: 8,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
          cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [80, 80, 80],
          lineColor: [230, 230, 230],
          lineWidth: 0.1,
          cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 80 },
          2: { cellWidth: 'auto' },
        },
      });
      
      startY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Aucun employé enregistré.', 15, startY + 3);
      startY += 15;
    }
  });

  // ── Draw Footers on All Pages ─────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, pageH - 20, pageW - 15, pageH - 20);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Aura Finance - Plateforme d\'audit automatisé et d\'intelligence financière', 15, pageH - 12);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text('CONFIDENTIEL', pageW - 15, pageH - 12, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Page ${i} / ${pageCount}`, pageW / 2, pageH - 12, { align: 'center' });
  }

  const finalName = filename || `Aura_Organisations_${date.replace(/\//g, '-')}.pdf`;
  doc.save(finalName);
}
