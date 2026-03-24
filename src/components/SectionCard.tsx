'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Wand2, History, Loader2, Target, Users, Lightbulb, ListChecks } from 'lucide-react';
import { ReportSection, EditHistoryEntry } from '@/types/report';
import EditModal from './EditModal';
import VersionHistory from './VersionHistory';

interface SectionCardProps {
  section: ReportSection;
  index: number;
  report: { sections: ReportSection[]; problemStatement: string; id: string; createdAt: string; updatedAt: string };
  editHistory: EditHistoryEntry[];
  onSectionUpdate: (sectionId: string, content: string) => void;
  onAddHistory: (entry: EditHistoryEntry) => void;
}

const SECTION_STYLES: Record<string, { color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  'problem-breakdown': {
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.06)',
    borderColor: 'rgba(99, 102, 241, 0.15)',
    icon: <Target size={20} />,
  },
  stakeholders: {
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.06)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Users size={20} />,
  },
  'solution-approach': {
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.06)',
    borderColor: 'rgba(236, 72, 153, 0.15)',
    icon: <Lightbulb size={20} />,
  },
  'action-plan': {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
    icon: <ListChecks size={20} />,
  },
};

export default function SectionCard({
  section,
  index,
  report,
  editHistory,
  onSectionUpdate,
  onAddHistory,
}: SectionCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const style = SECTION_STYLES[section.id] || SECTION_STYLES['problem-breakdown'];
  const sectionHistoryCount = editHistory.filter((h) => h.sectionId === section.id).length;

  const handleEdit = useCallback(
    async (instruction: string) => {
      setIsEditing(true);
      try {
        const res = await fetch('/api/edit-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: section.id,
            sectionTitle: section.title,
            currentContent: section.content,
            instruction,
            fullReport: report,
          }),
        });

        if (!res.ok) throw new Error('Failed to edit section');

        const data = await res.json();

        onAddHistory({
          sectionId: section.id,
          previousContent: section.content,
          newContent: data.updatedContent,
          instruction,
          timestamp: new Date().toISOString(),
        });

        onSectionUpdate(section.id, data.updatedContent);
        setShowEditModal(false);
      } catch (error) {
        console.error('Edit failed:', error);
      } finally {
        setIsEditing(false);
      }
    },
    [section, report, onSectionUpdate, onAddHistory]
  );

  const handleRevert = (historyIndex: number) => {
    const sectionHist = editHistory.filter((h) => h.sectionId === section.id);
    if (historyIndex >= 0 && historyIndex < sectionHist.length) {
      onSectionUpdate(section.id, sectionHist[historyIndex].previousContent);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.12, duration: 0.5 }}
        className="glass-card"
        style={{
          padding: '0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Color accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${style.color}, ${style.color}88)`,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: style.bgColor,
                border: `1px solid ${style.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: style.color,
              }}
            >
              {style.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: style.color }}>
                {section.title}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                Section {index + 1} of 4
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {sectionHistoryCount > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-ghost"
                style={{ position: 'relative' }}
              >
                <History size={14} />
                <span
                  style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--accent-violet)',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sectionHistoryCount}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-secondary"
              disabled={isEditing}
            >
              {isEditing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              {isEditing ? 'Editing...' : 'AI Edit'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="markdown-body"
          style={{
            padding: '0 24px 24px',
            position: 'relative',
          }}
        >
          {isEditing && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 16px 16px',
                zIndex: 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={20} color={style.color} className="animate-spin" />
                <span style={{ color: style.color, fontWeight: 600, fontSize: '14px' }}>
                  AI is editing this section...
                </span>
              </div>
            </div>
          )}
          <ReactMarkdown>{section.content}</ReactMarkdown>
        </div>

        {/* Version History */}
        <div style={{ padding: '0 24px 16px' }}>
          <VersionHistory
            sectionId={section.id}
            history={editHistory}
            onRevert={handleRevert}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal
          sectionTitle={section.title}
          onEdit={handleEdit}
          onClose={() => setShowEditModal(false)}
          isLoading={isEditing}
        />
      )}
    </>
  );
}
