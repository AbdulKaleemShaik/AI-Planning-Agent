'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, MessageSquare } from 'lucide-react';

interface EditModalProps {
  sectionTitle: string;
  onEdit: (instruction: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const PRESETS = [
  { label: 'Make more detailed', instruction: 'Make this section more detailed with deeper analysis and specific examples', icon: '📝' },
  { label: 'Professional tone', instruction: 'Rewrite this in a more professional, consultancy-grade tone', icon: '💼' },
  { label: 'Shorten', instruction: 'Shorten this section while keeping the key points', icon: '✂️' },
  { label: 'Add metrics', instruction: 'Add specific KPIs, metrics, and success criteria to this section', icon: '📊' },
  { label: 'Add examples', instruction: 'Add real-world examples and case studies to support the points', icon: '💡' },
  { label: 'Simplify', instruction: 'Simplify the language to make it more accessible and easier to understand', icon: '🎯' },
];

export default function EditModal({ sectionTitle, onEdit, onClose, isLoading }: EditModalProps) {
  const [customInstruction, setCustomInstruction] = useState('');

  const handleSubmit = () => {
    if (customInstruction.trim()) {
      onEdit(customInstruction.trim());
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-card"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Wand2 size={18} color="var(--accent-indigo)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Edit</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Editing: <strong style={{ color: 'var(--text-secondary)' }}>{sectionTitle}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '6px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: '20px' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
              }}
            >
              Quick Actions
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PRESETS.map((preset, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEdit(preset.instruction)}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'rgba(99, 102, 241, 0.06)',
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.12)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span>{preset.icon}</span>
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom instruction */}
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
              }}
            >
              Custom Instruction
            </p>
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <div style={{ flex: 1, position: 'relative' }}>
                <MessageSquare
                  size={14}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '14px', top: '13px' }}
                />
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g., Add a competitive analysis angle..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    background: 'rgba(10, 10, 26, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                />
              </div>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={isLoading || !customInstruction.trim()}
                style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
              >
                {isLoading ? (
                  <div
                    className="animate-spin"
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <Sparkles size={14} />
                )}
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
