'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { History, RotateCcw, X } from 'lucide-react';
import { EditHistoryEntry } from '@/types/report';

interface VersionHistoryProps {
  sectionId: string;
  history: EditHistoryEntry[];
  onRevert: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistory({
  sectionId,
  history,
  onRevert,
  isOpen,
  onClose,
}: VersionHistoryProps) {
  const sectionHistory = history.filter((h) => h.sectionId === sectionId);

  if (!isOpen || sectionHistory.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        style={{
          marginTop: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'rgba(10, 10, 26, 0.5)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} color="var(--accent-violet)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-violet)' }}>
                Edit History
              </span>
              <span className="badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
                {sectionHistory.length}
              </span>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sectionHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: 'rgba(99, 102, 241, 0.04)',
                  border: '1px solid rgba(99, 102, 241, 0.08)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    &ldquo;{entry.instruction}&rdquo;
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => onRevert(index)}
                  className="btn-ghost"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    gap: '4px',
                    color: 'var(--accent-amber)',
                  }}
                >
                  <RotateCcw size={12} />
                  Revert
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
