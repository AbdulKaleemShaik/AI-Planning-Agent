'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AgentStep } from '@/types/report';
import { Brain, Lightbulb, FileText, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ReasoningStepsProps {
  steps: AgentStep[];
}

const AGENT_CONFIG: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  'Planner Agent': {
    icon: <Brain size={18} />,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
  },
  'Insight Agent': {
    icon: <Lightbulb size={18} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  },
  'Execution Agent': {
    icon: <FileText size={18} />,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
  },
};

export default function ReasoningSteps({ steps }: ReasoningStepsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '20px', marginBottom: '28px' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Brain size={14} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Agent Reasoning Steps</span>
          <span className="badge">{steps.length} / 3</span>
        </div>
        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {steps.map((step, index) => {
                const config = AGENT_CONFIG[step.agent] || AGENT_CONFIG['Planner Agent'];
                return (
                  <motion.div
                    key={step.agent}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '14px',
                      background: `${config.color}08`,
                      border: `1px solid ${config.color}20`,
                      borderRadius: '12px',
                      position: 'relative',
                    }}
                  >
                    {/* Agent icon */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: config.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {config.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600, color: config.color }}>
                          {step.agent}
                        </span>
                        {step.status === 'running' ? (
                          <Loader2
                            size={14}
                            color={config.color}
                            className="animate-spin"
                          />
                        ) : step.status === 'completed' ? (
                          <CheckCircle size={14} color="#10b981" />
                        ) : null}
                      </div>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                        }}
                      >
                        {step.reasoning}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
