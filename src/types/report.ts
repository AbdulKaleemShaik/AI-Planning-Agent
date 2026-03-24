export interface ReportSection {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export interface ReportData {
  id: string;
  problemStatement: string;
  sections: ReportSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentStep {
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  reasoning: string;
  timestamp: string;
}

export interface EditHistoryEntry {
  sectionId: string;
  previousContent: string;
  newContent: string;
  instruction: string;
  timestamp: string;
}

export interface GenerateRequest {
  problemStatement: string;
}

export interface EditSectionRequest {
  sectionId: string;
  sectionTitle: string;
  currentContent: string;
  instruction: string;
  fullReport: ReportData;
}
