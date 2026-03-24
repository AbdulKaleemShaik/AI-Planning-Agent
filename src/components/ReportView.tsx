'use client';

import { motion } from 'framer-motion';
import { ReportData, EditHistoryEntry, AgentStep } from '@/types/report';
import SectionCard from './SectionCard';
import ExportButtons from './ExportButtons';
import ReasoningSteps from './ReasoningSteps';
import { Calendar, FileText, RotateCcw } from 'lucide-react';

interface ReportViewProps {
  report: ReportData;
  agentSteps: AgentStep[];
  editHistory: EditHistoryEntry[];
  onSectionUpdate: (sectionId: string, content: string) => void;
  onAddHistory: (entry: EditHistoryEntry) => void;
  onReset: () => void;
}

export default function ReportView({
  report,
  agentSteps,
  editHistory,
  onSectionUpdate,
  onAddHistory,
  onReset,
}: ReportViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#10b981',
            marginBottom: '16px',
          }}
        >
          <FileText size={12} />
          Report Generated
        </div>

        <h2
          style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-1px',
            marginBottom: '8px',
          }}
        >
          <span className="gradient-text">Strategic Planning Report</span>
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            maxWidth: '600px',
            margin: '0 auto 12px',
          }}
        >
          &ldquo;{report.problemStatement}&rdquo;
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <Calendar size={12} />
            {new Date(report.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {editHistory.length > 0 && (
            <span className="badge">
              {editHistory.length} edit{editHistory.length !== 1 ? 's' : ''} made
            </span>
          )}
        </div>
      </motion.div>

      {/* Actions bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <ExportButtons report={report} />

        <button onClick={onReset} className="btn-ghost">
          <RotateCcw size={14} />
          New Report
        </button>
      </div>

      {/* Reasoning Steps */}
      <ReasoningSteps steps={agentSteps} />

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(report.sections || []).map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            report={report}
            editHistory={editHistory}
            onSectionUpdate={onSectionUpdate}
            onAddHistory={onAddHistory}
          />
        ))}
      </div>

      {/* Footer export reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '24px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Report ready for export — download as DOCX or PDF
        </p>
        <ExportButtons report={report} />
      </motion.div>
    </motion.div>
  );
}
