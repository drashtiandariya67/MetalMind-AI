import { MarketSummary } from '@/types/metals';
import { Opportunity } from './opportunityDetector';
import { formatPrice } from '@/utils/formatters';

export interface AdviceResult {
  headline: string;
  body: string;
  actionCards: { title: string; desc: string; icon: string; color: string }[];
}

export function generateInvestmentAdvice(
  amount: number,
  market: MarketSummary,
  opportunities: Opportunity[]
): AdviceResult | null {
  if (amount <= 0) return null;

  const goldDrop = market.gold.monthlyChangePercent < -5;
  const isHighRatio = market.ratio.current > 85;
  const isVolatile = Math.abs(market.gold.dailyChangePercent) > 1.5;

  let headline = '';
  let body = '';
  const actionCards: AdviceResult['actionCards'] = [];

  // Logic 1: Amount is too small for physical
  if (amount < 15000) {
    headline = "Start small, avoid making charges";
    body = `With ${formatPrice(amount)}, buying physical gold or silver will result in heavy losses due to fixed making charges and GST (approx 8-10% immediate loss).`;
    
    actionCards.push({
      title: "Digital Gold / ETFs",
      desc: "Buy fractional units of Gold ETFs (like GOLDBEES) or digital gold on trusted platforms. 0% making charges.",
      icon: "📱",
      color: "#4CAF50"
    });

    if (isHighRatio) {
      actionCards.push({
        title: "Silver ETFs",
        desc: "Silver is highly undervalued right now. Consider allocating 50% to Silver ETFs.",
        icon: "📈",
        color: "#2196F3"
      });
    }
    
    return { headline, body, actionCards };
  }

  // Logic 2: Major market drop (Buy Opportunity)
  if (goldDrop) {
    headline = "Strong Buy Opportunity";
    body = `Gold has dropped over ${Math.abs(market.gold.monthlyChangePercent).toFixed(1)}% this month. Historically, this is an excellent entry point. Since your capital is ${formatPrice(amount)}, you can take advantage of bulk discounts.`;
    
    actionCards.push({
      title: "Lock in SGBs",
      desc: `Allocate roughly ${formatPrice(amount * 0.7)} to Sovereign Gold Bonds on the secondary market. You skip the 3% GST and get a fixed 2.5% yield while catching the price dip.`,
      icon: "🏦",
      color: "#FF9800"
    });
    
    actionCards.push({
      title: "Physical Silver for Growth",
      desc: `Use the remaining ${formatPrice(amount * 0.3)} to buy physical silver bars. Silver bounces back harder than gold after a correction.`,
      icon: "🥈",
      color: "#9E9E9E"
    });
    
    return { headline, body, actionCards };
  }

  // Logic 3: High Ratio (Silver heavily undervalued)
  if (isHighRatio) {
    headline = "Silver is the smart play right now";
    body = `The Gold/Silver ratio is at ${market.ratio.current.toFixed(1)}, meaning Gold is unusually expensive compared to Silver. Smart money rotates to Silver at this level.`;
    
    actionCards.push({
      title: "Heavy Silver Allocation",
      desc: `Consider putting 60-70% (${formatPrice(amount * 0.65)}) into 1KG Silver bars or Silver ETFs.`,
      icon: "⚖️",
      color: "#2196F3"
    });
    
    actionCards.push({
      title: "Gold via SGBs",
      desc: "For the gold portion, avoid physical for now and stick to SGBs trading at a discount on the secondary market.",
      icon: "🏦",
      color: "#FF9800"
    });
    
    return { headline, body, actionCards };
  }

  // Logic 4: Market Volatility
  if (isVolatile) {
    headline = "Patience. High Volatility Detected.";
    body = "The market is moving erratically right now. Do not deploy all your capital at once, as prices could swing wildly in the next 48 hours.";
    
    actionCards.push({
      title: "Stagger your entry",
      desc: `Deploy only ${formatPrice(amount * 0.25)} today. Keep the rest in a liquid fund and buy in tranches over the next two weeks.`,
      icon: "⏳",
      color: "#F44336"
    });
    
    return { headline, body, actionCards };
  }

  // Default / Balanced Logic for Large Amounts
  headline = "Balanced Portfolio Approach";
  body = `At current neutral market conditions, your capital of ${formatPrice(amount)} is best split to balance liquidity and tax efficiency.`;
  
  actionCards.push({
    title: "Sovereign Gold Bonds",
    desc: `Use ${formatPrice(amount * 0.5)} for SGBs. Best for long-term holding with tax-free maturity.`,
    icon: "📜",
    color: "#4CAF50"
  });
  
  actionCards.push({
    title: "Physical Gold (24K)",
    desc: `Use ${formatPrice(amount * 0.3)} for physical coins/bars. Gives you immediate liquidity if you need cash fast.`,
    icon: "🪙",
    color: "#FFC107"
  });
  
  actionCards.push({
    title: "Silver Reserve",
    desc: `Use ${formatPrice(amount * 0.2)} for physical silver to capture future industrial demand growth.`,
    icon: "🥈",
    color: "#9E9E9E"
  });

  return { headline, body, actionCards };
}
