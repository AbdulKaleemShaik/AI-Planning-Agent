'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, FileDown } from 'lucide-react';
import { ReportData } from '@/types/report';

interface ExportButtonsProps {
  report: ReportData;
}

export default function ExportButtons({ report }: ExportButtonsProps) {
  const [docxLoading, setDocxLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDocxExport = async () => {
    setDocxLoading(true);
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });

      if (!res.ok) throw new Error('Failed to generate DOCX');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PlanForce-Report-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOCX export failed:', error);
    } finally {
      setDocxLoading(false);
    }
  };

  const handlePdfExport = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const { html } = await res.json();

      const html2pdf = (await import('html2pdf.js')).default;

      // Wrap html to enforce predictable container dimensions avoiding inherited CSS bugs
      const pdfHtml = `
        <div style="width: 800px; background: white; padding: 20px;">
          ${html}
        </div>
      `;

      const opt: any = {
        margin:       [20, 20, 20, 20],
        filename:     `PlanForce-Report-${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 840 },
        pagebreak:    { mode: ['css', 'avoid-all', 'legacy'] },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(pdfHtml).save();
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleDocxExport}
        disabled={docxLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '10px',
          color: '#6366f1',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        {docxLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        Export DOCX
        <Download size={14} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePdfExport}
        disabled={pdfLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(236, 72, 153, 0.1)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          borderRadius: '10px',
          color: '#ec4899',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        {pdfLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileDown size={16} />
        )}
        Export PDF
        <Download size={14} />
      </motion.button>
    </motion.div>
  );
}
