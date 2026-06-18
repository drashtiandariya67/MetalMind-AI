// MetalMind AI — Rule-Based AI Assistant
// Offline intelligence using current market data and technical analysis

import type { MarketSummary, MetalType } from '@/types/metals';
import type { Prediction } from '@/types/predictions';
import type { Opportunity } from '@/services/analysis/opportunityDetector';
import type { PortfolioSummary } from '@/types/portfolio';
import { formatPrice, formatPercent } from '@/utils/formatters';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AssistantContext {
  market: MarketSummary | null;
  predictions: {
    gold?: Record<string, Prediction>;
    silver?: Record<string, Prediction>;
  };
  opportunities: Opportunity[];
  portfolio: PortfolioSummary | null;
}

// ─── Quick Action Templates ─────────────────────────────────────
export const QUICK_ACTIONS = [
  { label: 'Should I buy Gold now?', query: 'Should I buy Gold now?' },
  { label: 'Is Silver undervalued?', query: 'Is Silver undervalued compared to Gold?' },
  { label: 'Best opportunities', query: 'Show best opportunities this week.' },
  { label: 'Gold vs Silver', query: 'Compare Gold vs Silver.' },
  { label: 'Market summary', query: 'Give me a market summary.' },
  { label: 'Why is Gold moving?', query: 'Why is Gold moving today?' },
  { label: 'Portfolio review', query: 'Review my portfolio.' },
  { label: 'Price forecast', query: 'What is the price forecast for this week?' },
];

/**
 * Generate AI response based on user query and market context
 */
export function generateAssistantResponse(
  query: string,
  context: AssistantContext
): string {
  const lowerQuery = query.toLowerCase();

  // Route to appropriate handler
  if (lowerQuery.includes('buy') && lowerQuery.includes('gold')) {
    return handleBuyGoldQuery(context);
  }
  if (lowerQuery.includes('buy') && lowerQuery.includes('silver')) {
    return handleBuySilverQuery(context);
  }
  if (lowerQuery.includes('silver') && (lowerQuery.includes('undervalued') || lowerQuery.includes('ratio'))) {
    return handleSilverRatioQuery(context);
  }
  if (lowerQuery.includes('compare') || (lowerQuery.includes('gold') && lowerQuery.includes('silver') && lowerQuery.includes('vs'))) {
    return handleCompareQuery(context);
  }
  if (lowerQuery.includes('opportunit') || lowerQuery.includes('best')) {
    return handleOpportunitiesQuery(context);
  }
  if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('market')) {
    return handleMarketSummaryQuery(context);
  }
  if (lowerQuery.includes('forecast') || lowerQuery.includes('predict') || lowerQuery.includes('week')) {
    return handleForecastQuery(context);
  }
  if (lowerQuery.includes('portfolio') || lowerQuery.includes('review') || lowerQuery.includes('holdings')) {
    return handlePortfolioQuery(context);
  }
  if (lowerQuery.includes('why') && (lowerQuery.includes('gold') || lowerQuery.includes('silver'))) {
    return handleWhyMovingQuery(context, lowerQuery.includes('silver') ? 'silver' : 'gold');
  }
  if (lowerQuery.includes('sell')) {
    return handleSellQuery(context);
  }
  if (lowerQuery.includes('wait')) {
    return handleWaitQuery(context);
  }

  // Generic fallback
  return handleGenericQuery(query, context);
}

// ─── Query Handlers ─────────────────────────────────────────────

function handleBuyGoldQuery(ctx: AssistantContext): string {
  if (!ctx.market) return "I'm still fetching market data. Please try again in a moment.";

  const gold = ctx.market.gold;
  const pred = ctx.predictions.gold?.['1d'];
  const lines: string[] = [];

  lines.push(`🥇 **Gold Analysis**\n`);
  lines.push(`Current Price: ${formatPrice(gold.pricePerGramINR)}/g (24K)`);
  lines.push(`Today: ${formatPercent(gold.dailyChangePercent)} | Week: ${formatPercent(gold.weeklyChangePercent)}`);
  lines.push(`Trend: ${gold.trend === 'bullish' ? '📈 Bullish' : gold.trend === 'bearish' ? '📉 Bearish' : '➡️ Neutral'}\n`);

  if (pred) {
    lines.push(`**AI Recommendation: ${formatRec(pred.recommendation)}**`);
    lines.push(`Confidence: ${pred.probability}% | Direction: ${pred.direction}`);
    lines.push(`\n${pred.explanation}`);

    if (['strong_buy', 'buy', 'accumulate'].includes(pred.recommendation)) {
      lines.push(`\n✅ Based on current indicators, this could be a good time to accumulate Gold. RSI is ${pred.indicators.rsi.value.toFixed(0)} and MACD is ${pred.indicators.macd.histogram > 0 ? 'positive' : 'showing weakness'}.`);
    } else if (['hold', 'wait'].includes(pred.recommendation)) {
      lines.push(`\n⏳ Current signals are mixed. Consider waiting for a clearer entry point or dollar-cost averaging.`);
    } else {
      lines.push(`\n⚠️ Indicators suggest caution. Consider reducing exposure or waiting for a pullback.`);
    }
  }

  return lines.join('\n');
}

function handleBuySilverQuery(ctx: AssistantContext): string {
  if (!ctx.market) return "I'm still fetching market data. Please try again in a moment.";

  const silver = ctx.market.silver;
  const ratio = ctx.market.ratio;
  const pred = ctx.predictions.silver?.['1d'];
  const lines: string[] = [];

  lines.push(`🥈 **Silver Analysis**\n`);
  lines.push(`Current Price: ${formatPrice(silver.pricePerGramINR)}/g`);
  lines.push(`Today: ${formatPercent(silver.dailyChangePercent)} | Week: ${formatPercent(silver.weeklyChangePercent)}`);
  lines.push(`Gold/Silver Ratio: ${ratio.current.toFixed(1)} (Avg: ${ratio.historicalAverage})`);
  lines.push(`Silver Valuation: ${ratio.silverValuation === 'undervalued' ? '💎 Undervalued' : ratio.silverValuation === 'overvalued' ? '⚠️ Overvalued' : '✅ Fair'}\n`);

  if (pred) {
    lines.push(`**AI Recommendation: ${formatRec(pred.recommendation)}**`);
    lines.push(`${pred.explanation}`);
  }

  if (ratio.silverValuation === 'undervalued') {
    lines.push(`\n💡 The Gold/Silver ratio of ${ratio.current.toFixed(1)} suggests Silver is undervalued relative to Gold. Historically, this ratio tends to revert to the mean, which could be favorable for Silver.`);
  }

  return lines.join('\n');
}

function handleSilverRatioQuery(ctx: AssistantContext): string {
  if (!ctx.market) return "I'm still loading data...";

  const ratio = ctx.market.ratio;
  const lines: string[] = [];

  lines.push(`📊 **Gold/Silver Ratio Analysis**\n`);
  lines.push(`Current Ratio: **${ratio.current.toFixed(1)}**`);
  lines.push(`Historical Average: ${ratio.historicalAverage}`);
  lines.push(`Deviation: ${ratio.percentFromAverage > 0 ? '+' : ''}${ratio.percentFromAverage.toFixed(1)}% from average\n`);
  lines.push(ratio.interpretation);

  return lines.join('\n');
}

function handleCompareQuery(ctx: AssistantContext): string {
  if (!ctx.market) return "Loading market data...";

  const gold = ctx.market.gold;
  const silver = ctx.market.silver;
  const ratio = ctx.market.ratio;
  const lines: string[] = [];

  lines.push(`⚖️ **Gold vs Silver Comparison**\n`);
  lines.push(`| Metric | 🥇 Gold | 🥈 Silver |`);
  lines.push(`|--------|---------|----------|`);
  lines.push(`| Price/g | ${formatPrice(gold.pricePerGramINR)} | ${formatPrice(silver.pricePerGramINR)} |`);
  lines.push(`| Daily | ${formatPercent(gold.dailyChangePercent)} | ${formatPercent(silver.dailyChangePercent)} |`);
  lines.push(`| Weekly | ${formatPercent(gold.weeklyChangePercent)} | ${formatPercent(silver.weeklyChangePercent)} |`);
  lines.push(`| Monthly | ${formatPercent(gold.monthlyChangePercent)} | ${formatPercent(silver.monthlyChangePercent)} |`);
  lines.push(`| Trend | ${gold.trend} | ${silver.trend} |\n`);
  lines.push(`**Ratio**: ${ratio.current.toFixed(1)} — ${ratio.interpretation}`);

  const goldPred = ctx.predictions.gold?.['1d'];
  const silverPred = ctx.predictions.silver?.['1d'];
  if (goldPred && silverPred) {
    lines.push(`\n**AI Picks**:`);
    lines.push(`Gold: ${formatRec(goldPred.recommendation)} (${goldPred.probability}%)`);
    lines.push(`Silver: ${formatRec(silverPred.recommendation)} (${silverPred.probability}%)`);
  }

  return lines.join('\n');
}

function handleOpportunitiesQuery(ctx: AssistantContext): string {
  const lines: string[] = [`🔍 **Current Opportunities**\n`];

  if (ctx.opportunities.length === 0) {
    lines.push('No significant opportunities detected at the moment. Markets appear stable.');
    lines.push('\nI\'ll notify you when a dip, breakout, or trend reversal is detected.');
    return lines.join('\n');
  }

  for (const opp of ctx.opportunities) {
    lines.push(`${opp.emoji} **${opp.title}** (${opp.severity} priority)`);
    lines.push(`${opp.description}\n`);
  }

  return lines.join('\n');
}

function handleMarketSummaryQuery(ctx: AssistantContext): string {
  if (!ctx.market) return "Loading market data...";

  const gold = ctx.market.gold;
  const silver = ctx.market.silver;
  const lines: string[] = [];

  lines.push(`📊 **Market Summary**\n`);
  lines.push(`🥇 **Gold**: ${formatPrice(gold.pricePerGramINR)}/g (${formatPercent(gold.dailyChangePercent)} today)`);
  lines.push(`   24K: ${formatPrice(gold.price24K || 0)}/g | 22K: ${formatPrice(gold.price22K || 0)}/g | 18K: ${formatPrice(gold.price18K || 0)}/g`);
  lines.push(`   Trend: ${gold.trend} | Weekly: ${formatPercent(gold.weeklyChangePercent)}\n`);
  lines.push(`🥈 **Silver**: ${formatPrice(silver.pricePerGramINR)}/g (${formatPercent(silver.dailyChangePercent)} today)`);
  lines.push(`   Trend: ${silver.trend} | Weekly: ${formatPercent(silver.weeklyChangePercent)}\n`);
  lines.push(`📏 **Ratio**: ${ctx.market.ratio.current.toFixed(1)} — ${ctx.market.ratio.silverValuation}`);
  lines.push(`\nLast updated: ${new Date(ctx.market.lastUpdated).toLocaleTimeString()}`);

  return lines.join('\n');
}

function handleForecastQuery(ctx: AssistantContext): string {
  const lines: string[] = [`🔮 **7-Day Price Forecast**\n`];

  const goldPred = ctx.predictions.gold?.['7d'];
  const silverPred = ctx.predictions.silver?.['7d'];

  if (goldPred) {
    lines.push(`🥇 **Gold 7-Day**`);
    lines.push(`Range: ${formatPrice(goldPred.expectedRange.low)} – ${formatPrice(goldPred.expectedRange.high)}/g`);
    lines.push(`Direction: ${goldPred.direction} | Probability: ${goldPred.probability}%`);
    lines.push(`Confidence: ${goldPred.confidence} | Sentiment: ${goldPred.sentiment}\n`);
  }

  if (silverPred) {
    lines.push(`🥈 **Silver 7-Day**`);
    lines.push(`Range: ${formatPrice(silverPred.expectedRange.low)} – ${formatPrice(silverPred.expectedRange.high)}/g`);
    lines.push(`Direction: ${silverPred.direction} | Probability: ${silverPred.probability}%`);
    lines.push(`Confidence: ${silverPred.confidence} | Sentiment: ${silverPred.sentiment}`);
  }

  if (!goldPred && !silverPred) {
    lines.push('Predictions are still being generated. Please check back shortly.');
  }

  return lines.join('\n');
}

function handlePortfolioQuery(ctx: AssistantContext): string {
  if (!ctx.portfolio || ctx.portfolio.holdings.length === 0) {
    return "📁 **Portfolio**\n\nNo holdings found. Add your Gold and Silver holdings in the Portfolio tab to get personalized insights.";
  }

  const p = ctx.portfolio;
  const lines: string[] = [];

  lines.push(`📁 **Portfolio Review**\n`);
  lines.push(`Total Invested: ${formatPrice(p.totalInvested)}`);
  lines.push(`Current Value: ${formatPrice(p.totalCurrentValue)}`);
  lines.push(`P&L: ${formatPrice(p.totalProfitLoss)} (${formatPercent(p.totalROI)})\n`);
  lines.push(`Gold: ${p.goldAllocation.toFixed(0)}% | Silver: ${p.silverAllocation.toFixed(0)}%`);

  if (p.totalROI > 5) {
    lines.push(`\n✅ Your portfolio is performing well with ${formatPercent(p.totalROI)} returns.`);
  } else if (p.totalROI < -5) {
    lines.push(`\n⚠️ Your portfolio is down ${formatPercent(p.totalROI)}. Consider dollar-cost averaging on dips.`);
  }

  return lines.join('\n');
}

function handleWhyMovingQuery(ctx: AssistantContext, metal: MetalType): string {
  if (!ctx.market) return "Loading data...";

  const price = metal === 'gold' ? ctx.market.gold : ctx.market.silver;
  const pred = ctx.predictions[metal]?.['1d'];
  const name = metal === 'gold' ? 'Gold' : 'Silver';
  const lines: string[] = [];

  lines.push(`❓ **Why is ${name} ${price.dailyChangePercent >= 0 ? 'rising' : 'falling'}?**\n`);
  lines.push(`Current: ${formatPrice(price.pricePerGramINR)}/g (${formatPercent(price.dailyChangePercent)} today)\n`);

  if (pred) {
    lines.push(`**Technical Factors:**`);
    lines.push(`• RSI: ${pred.indicators.rsi.value.toFixed(0)} (${pred.indicators.rsi.signal})`);
    lines.push(`• MACD: ${pred.indicators.macd.histogram > 0 ? 'Positive' : 'Negative'} histogram${pred.indicators.macd.crossover !== 'none' ? ` — ${pred.indicators.macd.crossover} crossover` : ''}`);
    lines.push(`• Momentum: ${pred.indicators.momentum.toFixed(1)}%\n`);
    lines.push(`${pred.explanation}`);
  } else {
    lines.push(`Technical indicators are being calculated. Factors that typically drive ${name} include:`);
    lines.push(`• USD strength/weakness`);
    lines.push(`• Inflation expectations`);
    lines.push(`• Central bank policies`);
    lines.push(`• Geopolitical tensions`);
    lines.push(`• Supply/demand dynamics`);
  }

  return lines.join('\n');
}

function handleSellQuery(ctx: AssistantContext): string {
  if (!ctx.market) return "Loading data...";

  const goldPred = ctx.predictions.gold?.['1d'];
  const silverPred = ctx.predictions.silver?.['1d'];
  const lines: string[] = [`📤 **Sell Analysis**\n`];

  if (goldPred) {
    const shouldSell = ['sell', 'reduce'].includes(goldPred.recommendation);
    lines.push(`🥇 Gold: ${shouldSell ? '⚠️ Consider reducing' : '✅ No sell signal'}`);
    lines.push(`   Recommendation: ${formatRec(goldPred.recommendation)}\n`);
  }

  if (silverPred) {
    const shouldSell = ['sell', 'reduce'].includes(silverPred.recommendation);
    lines.push(`🥈 Silver: ${shouldSell ? '⚠️ Consider reducing' : '✅ No sell signal'}`);
    lines.push(`   Recommendation: ${formatRec(silverPred.recommendation)}`);
  }

  lines.push(`\n💡 *For long-term investors, timing sells is less critical than timing buys. Consider your investment horizon.*`);

  return lines.join('\n');
}

function handleWaitQuery(ctx: AssistantContext): string {
  const goldPred = ctx.predictions.gold?.['1d'];
  const lines: string[] = [`⏳ **Should You Wait?**\n`];

  if (goldPred) {
    if (['wait', 'hold'].includes(goldPred.recommendation)) {
      lines.push(`Current AI signal suggests waiting. Indicators are mixed and don't show a clear entry point.`);
      lines.push(`\nConsider watching for:`);
      lines.push(`• RSI dropping below 30 (oversold bounce)`);
      lines.push(`• MACD bullish crossover`);
      lines.push(`• Price testing support levels`);
    } else if (['strong_buy', 'buy'].includes(goldPred.recommendation)) {
      lines.push(`AI signals are actually bullish right now! Waiting might mean missing a move.`);
      lines.push(`Recommendation: ${formatRec(goldPred.recommendation)} (${goldPred.probability}% confidence)`);
    } else {
      lines.push(`Current signals suggest caution. Waiting is prudent.`);
      lines.push(`${goldPred.explanation}`);
    }
  } else {
    lines.push(`Predictions are loading. In general, consider waiting if:`);
    lines.push(`• RSI is overbought (>70)`);
    lines.push(`• Price is near resistance`);
    lines.push(`• MACD shows negative divergence`);
  }

  return lines.join('\n');
}

function handleGenericQuery(query: string, ctx: AssistantContext): string {
  const lines: string[] = [];
  lines.push(`🤖 I can help you with:\n`);
  lines.push(`• **"Should I buy Gold/Silver?"** — Get AI recommendation`);
  lines.push(`• **"Market summary"** — Current prices and trends`);
  lines.push(`• **"Compare Gold vs Silver"** — Side-by-side analysis`);
  lines.push(`• **"Price forecast"** — 7-day predictions`);
  lines.push(`• **"Best opportunities"** — Active market opportunities`);
  lines.push(`• **"Is Silver undervalued?"** — Ratio analysis`);
  lines.push(`• **"Portfolio review"** — Your holdings analysis`);
  lines.push(`• **"Why is Gold moving?"** — Price movement analysis\n`);
  lines.push(`Try asking one of these questions!`);

  return lines.join('\n');
}

// ─── Helpers ────────────────────────────────────────────────────

function formatRec(rec: string): string {
  const labels: Record<string, string> = {
    strong_buy: '🟢 Strong Buy',
    buy: '🟢 Buy',
    accumulate: '🟡 Accumulate',
    hold: '🟡 Hold',
    wait: '🟠 Wait',
    reduce: '🔴 Reduce',
    sell: '🔴 Sell',
  };
  return labels[rec] || rec;
}
