'use client';

import { useCallback } from 'react';
import { useReportStore } from '@/store/report-store';
import InputForm from '@/components/InputForm';
import ReportView from '@/components/ReportView';
import ReasoningSteps from '@/components/ReasoningSteps';
import { Zap, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const {
    report,
    isGenerating,
    agentSteps,
    editHistory,
    setReport,
    setIsGenerating,
    addAgentStep,
    updateAgentStep,
    clearAgentSteps,
    updateSection,
    addEditHistory,
    setError,
    reset,
  } = useReportStore();

  const handleGenerate = useCallback(
    async (problemStatement: string) => {
      reset();
      setIsGenerating(true);
      clearAgentSteps();

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemStatement }),
        });

        if (!res.ok) throw new Error('Failed to start generation');

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const { event, data } = JSON.parse(line.slice(6));

                switch (event) {
                  case 'agent-start':
                    addAgentStep({
                      agent: data.agent,
                      status: 'running',
                      reasoning: data.reasoning,
                      timestamp: new Date().toISOString(),
                    });
                    break;

                  case 'agent-complete':
                    updateAgentStep(data.agent, {
                      status: 'completed',
                      reasoning: data.reasoning,
                    });
                    break;

                  case 'report-complete':
                    setReport(data.report);
                    break;

                  case 'error':
                    setError(data.message);
                    break;

                  case 'done':
                    break;
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsGenerating(false);
      }
    },
    [reset, setIsGenerating, clearAgentSteps, addAgentStep, updateAgentStep, setReport, setError]
  );

  const error = useReportStore((s) => s.error);

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Zap size={18} />
              </div>
              <div>
                <div className="logo-text">
                  <span className="gradient-text">PlanForce</span>{' '}
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>AI</span>
                </div>
                <div className="logo-sub">Strategic Planning Agent</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {report && (
                <div className="badge">
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  Report Active
                </div>
              )}
              <a
                href="https://github.com/AbdulKaleemShaik/AI-Planning-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <Github size={16} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '48px 24px 80px' }}>
        <AnimatePresence mode="wait">
          {!report && !isGenerating ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <InputForm onSubmit={handleGenerate} isLoading={isGenerating} />
            </motion.div>
          ) : isGenerating && !report ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ maxWidth: '700px', margin: '0 auto' }}
            >
              {/* Generating state */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Zap size={28} color="white" />
                </motion.div>
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  <span className="gradient-text">Agents Working</span>
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Our multi-agent system is analyzing and building your plan...
                </p>
              </div>

              <ReasoningSteps steps={agentSteps} />
            </motion.div>
          ) : report ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ReportView
                report={report}
                agentSteps={agentSteps}
                editHistory={editHistory}
                onSectionUpdate={updateSection}
                onAddHistory={addEditHistory}
                onReset={reset}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              maxWidth: '600px',
              margin: '24px auto 0',
              padding: '16px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              color: '#ef4444',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '20px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Built with Next.js, Vercel AI SDK & Multi-Agent Architecture •{' '}
          <span className="gradient-text" style={{ fontWeight: 600 }}>
            PlanForce AI
          </span>
        </p>
      </footer>
    </div>
  );
}
