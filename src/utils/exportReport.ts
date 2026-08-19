function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers.map(escapeCsvCell).join(','), ...rows.map(row => row.map(escapeCsvCell).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

// xlsx and jspdf are heavy libraries - loaded on demand so they never
// bloat the main Reports bundle for people who never click Export.
export async function exportToExcel(filename: string, headers: string[], rows: (string | number)[][], sheetName = 'Report') {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportToPDF(title: string, filename: string, headers: string[], rows: (string | number)[][]) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString('en-IN'), 14, 21);

  autoTable(doc, {
    head: [headers],
    body: rows.map(row => row.map(String)),
    startY: 26,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [234, 88, 12] } // orange-600
  });

  doc.save(`${filename}.pdf`);
}
