import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReportData, AgentStep, EditHistoryEntry } from '@/types/report';

interface ReportState {
  report: ReportData | null;
  isGenerating: boolean;
  agentSteps: AgentStep[];
  editHistory: EditHistoryEntry[];
  editingSectionId: string | null;
  error: string | null;

  setReport: (report: ReportData | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  addAgentStep: (step: AgentStep) => void;
  updateAgentStep: (agent: string, updates: Partial<AgentStep>) => void;
  clearAgentSteps: () => void;
  updateSection: (sectionId: string, content: string) => void;
  addEditHistory: (entry: EditHistoryEntry) => void;
  setEditingSectionId: (id: string | null) => void;
  revertSection: (sectionId: string, historyIndex: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      report: null,
      isGenerating: false,
      agentSteps: [],
      editHistory: [],
      editingSectionId: null,
      error: null,

      setReport: (report) => set({ report }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),

      addAgentStep: (step) =>
        set((state) => ({ agentSteps: [...state.agentSteps, step] })),

      updateAgentStep: (agent, updates) =>
        set((state) => ({
          agentSteps: state.agentSteps.map((s) =>
            s.agent === agent ? { ...s, ...updates } : s
          ),
        })),

      clearAgentSteps: () => set({ agentSteps: [] }),

      updateSection: (sectionId, content) =>
        set((state) => {
          if (!state.report) return {};
          return {
            report: {
              ...state.report,
              updatedAt: new Date().toISOString(),
              sections: (state.report.sections || []).map((s) =>
                s.id === sectionId ? { ...s, content } : s
              ),
            },
          };
        }),

      addEditHistory: (entry) =>
        set((state) => ({ editHistory: [...state.editHistory, entry] })),

      setEditingSectionId: (id) => set({ editingSectionId: id }),

      revertSection: (sectionId, historyIndex) => {
        const state = get();
        const relevantHistory = state.editHistory.filter(
          (e) => e.sectionId === sectionId
        );
        if (historyIndex >= 0 && historyIndex < relevantHistory.length) {
          const entry = relevantHistory[historyIndex];
          state.updateSection(sectionId, entry.previousContent);
        }
      },

      setError: (error) => set({ error }),

      reset: () =>
        set({
          report: null,
          isGenerating: false,
          agentSteps: [],
          editHistory: [],
          editingSectionId: null,
          error: null,
        }),
    }),
    {
      name: 'report-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        report: state.report,
        editHistory: state.editHistory,
      }),
    }
  )
);
