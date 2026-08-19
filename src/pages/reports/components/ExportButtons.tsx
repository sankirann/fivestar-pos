import { useState } from 'react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../utils/exportReport';

interface ExportButtonsProps {
  title: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

const ExportButtons = ({ title, filename, headers, rows }: ExportButtonsProps) => {
  const disabled = rows.length === 0;
  const [busy, setBusy] = useState<'pdf' | 'excel' | null>(null);

  const handlePDF = async () => {
    setBusy('pdf');
    try {
      await exportToPDF(title, filename, headers, rows);
    } finally {
      setBusy(null);
    }
  };

  const handleExcel = async () => {
    setBusy('excel');
    try {
      await exportToExcel(filename, headers, rows);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={handlePDF}
        disabled={disabled || busy !== null}
        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors cursor-pointer text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <i className="ri-file-pdf-2-line mr-1"></i>
        {busy === 'pdf' ? 'Preparing...' : 'PDF'}
      </button>
      <button
        onClick={handleExcel}
        disabled={disabled || busy !== null}
        className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <i className="ri-file-excel-2-line mr-1"></i>
        {busy === 'excel' ? 'Preparing...' : 'Excel'}
      </button>
      <button
        onClick={() => exportToCSV(filename, headers, rows)}
        disabled={disabled}
        className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <i className="ri-file-text-line mr-1"></i>
        CSV
      </button>
    </div>
  );
};

export default ExportButtons;
