// MetalMind AI — News Types

export type NewsCategory = 'gold' | 'silver' | 'inflation' | 'central_bank' | 'interest_rates';
export type NewsImpact = 'bullish' | 'bearish' | 'neutral';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: NewsCategory;
  impact: NewsImpact;
  importanceScore: number;      // 1-10
  aiAnalysis: string;
  imageUrl?: string;
}

export interface NewsFilter {
  categories: NewsCategory[];
  minImportance: number;
}
