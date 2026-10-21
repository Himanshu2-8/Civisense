export interface DocumentItem {
  document_id: string;
  filename: string;
  uploaded_at: string;
  stored_filename?: string;
}

export interface CommentItem {
  id: string;
  document_id: string;
  stakeholder_type: string;
  content: string;
  topic?: string | null;
  raw_issue?: string | null;
  canonical_issue?: string | null;
  clause?: string | null;
  sentiment?: "positive" | "negative" | "neutral" | null;
  sentiment_score?: number | null;
  recommendation?: string | null;
  created_at: string;
}

export interface SentimentOverview {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  avg_score: number;
}

export interface ClauseStat {
  clause: string;
  mention_count: number;
  positive: number;
  negative: number;
  neutral: number;
  dominant_sentiment: "positive" | "negative" | "neutral";
}

export interface StakeholderBreakdown {
  stakeholder_type: string;
  count: number;
  positive: number;
  negative: number;
  neutral: number;
  summary?: string | null;
}

export interface TopicBreakdown {
  topic: string;
  count: number;
  percentage: number;
}

export interface ConsensusData {
  agreements?: string[];
  disagreements?: string[];
  recommendations?: string[];
}

export interface DashboardData {
  document_id: string;
  filename: string;
  uploaded_at: string;
  total_comments: number;
  overall_summary: string;
  sentiment_overview: SentimentOverview;
  clauses: ClauseStat[];
  stakeholders: StakeholderBreakdown[];
  topics: TopicBreakdown[];
  consensus: ConsensusData;
  comments: CommentItem[];
}
