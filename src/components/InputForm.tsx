'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface InputFormProps {
  onSubmit: (problemStatement: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  'Build a creator marketplace platform',
  'Design an AI-powered customer support system',
  'Create a SaaS analytics dashboard for startups',
  'Develop a decentralized voting platform',
  'Launch a health & wellness subscription app',
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [problem, setProblem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim() && !isLoading) {
      onSubmit(problem.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ maxWidth: '760px', margin: '0 auto' }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#8b5cf6',
            marginBottom: '20px',
          }}
        >
          <Zap size={12} />
          Multi-Agent AI Planning System
        </motion.div>

        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '16px',
          }}
        >
          <span className="gradient-text">Strategic Plans</span>
          <br />
          <span style={{ color: 'var(--text-primary)' }}>Powered by AI Agents</span>
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          Enter your problem and our multi-agent system will analyze, enrich, and
          generate a comprehensive execution plan — ready to export.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: '28px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Problem Statement
          </label>
          <textarea
            className="input-field"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Describe your problem or idea... e.g., 'Build a creator marketplace platform'"
            disabled={isLoading}
            rows={4}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {problem.length > 0 ? `${problem.length} characters` : 'Min 10 characters'}
            </span>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || problem.trim().length < 10}
            >
              {isLoading ? (
                <>
                  <div
                    className="animate-spin"
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                    }}
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Plan
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Examples */}
      <div style={{ marginTop: '28px' }}>
        <p
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Try an example
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {EXAMPLES.map((example, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setProblem(example)}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.12)',
                borderRadius: '20px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {example}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
