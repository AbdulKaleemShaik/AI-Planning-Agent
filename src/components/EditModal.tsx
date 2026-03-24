'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, MessageSquare, ArrowRight, Zap } from 'lucide-react';

interface EditModalProps {
  sectionTitle: string;
  onEdit: (instruction: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const PRESETS = [
  { label: 'Deep Dive', instruction: 'Make this section more detailed with deeper analysis and specific examples', icon: <Zap size={16} /> },
  { label: 'Executive Tone', instruction: 'Rewrite this in a strictly professional, consultancy-grade tone', icon: <Wand2 size={16} /> },
  { label: 'Concise', instruction: 'Shorten this section to the most impactful points', icon: <MessageSquare size={16} /> },
];

export default function EditModal({ sectionTitle, onEdit, onClose, isLoading }: EditModalProps) {
  const [customInstruction, setCustomInstruction] = useState('');

  const handleSubmit = () => {
    if (customInstruction.trim() && !isLoading) {
      onEdit(customInstruction.trim());
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        onClick={onClose}
      >
        <motion.div
          className="glass-card"
          initial={{ scale: 0.95, opacity: 0, y: 30, rotateX: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30, rotateX: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '560px',
            padding: '32px',
            background: 'rgba(10, 15, 30, 0.85)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(99, 102, 241, 0.15) inset'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)'
                }}
              >
                <Sparkles size={26} color="white" />
              </motion.div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: '4px' }}>AI Assistant</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Refining: <span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>{sectionTitle}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
              <X size={20} />
            </button>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
              Quick Refinements
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PRESETS.map((preset, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEdit(preset.instruction)}
                  disabled={isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px', fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isLoading ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ color: 'var(--primary)' }}>{preset.icon}</span>
                    {preset.label}
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
              Custom Prompt
            </p>
            <div style={{ position: 'relative' }}>
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Ask the AI to rewrite, expand, or adjust this section..."
                disabled={isLoading}
                rows={3}
                style={{
                  width: '100%',
                  padding: '16px 16px 60px 16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = 'inset 0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px var(--primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'inset 0 4px 20px rgba(0,0,0,0.3)';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div style={{ position: 'absolute', bottom: '14px', right: '14px' }}>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={isLoading || !customInstruction.trim()}
                  style={{ padding: '10px 20px', borderRadius: '12px' }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                    />
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span style={{ fontSize: '14px' }}>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.5px' }}>Applying AI modifications...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
