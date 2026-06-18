export interface RegionalCity {
  name: string;
  premiumMultiplier: number; // e.g. 1.002 for slightly higher prices
}

export interface RegionalState {
  id: string;
  name: string;
  primaryCity: string;
  monthHighMultiplier: number;
  monthLowMultiplier: number;
  monthDropPct: string;
  cities: RegionalCity[];
}

export const REGIONAL_DATA: Record<string, RegionalState> = {
  gujarat: {
    id: 'gujarat',
    name: 'Gujarat',
    primaryCity: 'Rajkot',
    monthHighMultiplier: 1.048,
    monthLowMultiplier: 0.956,
    monthDropPct: '-8.8%',
    cities: [
      { name: 'Rajkot', premiumMultiplier: 1.000 },
      { name: 'Ahmedabad', premiumMultiplier: 1.0018 },
      { name: 'Surat', premiumMultiplier: 0.9942 },
    ]
  },
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra',
    primaryCity: 'Mumbai',
    monthHighMultiplier: 1.052,
    monthLowMultiplier: 0.960,
    monthDropPct: '-8.7%',
    cities: [
      { name: 'Mumbai', premiumMultiplier: 1.0025 },
      { name: 'Pune', premiumMultiplier: 1.0010 },
      { name: 'Nagpur', premiumMultiplier: 0.9995 },
    ]
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    primaryCity: 'New Delhi',
    monthHighMultiplier: 1.045,
    monthLowMultiplier: 0.950,
    monthDropPct: '-9.1%',
    cities: [
      { name: 'New Delhi', premiumMultiplier: 1.0015 },
      { name: 'Gurgaon', premiumMultiplier: 1.0030 },
      { name: 'Noida', premiumMultiplier: 0.9985 },
    ]
  },
  tamilnadu: {
    id: 'tamilnadu',
    name: 'Tamil Nadu',
    primaryCity: 'Chennai',
    monthHighMultiplier: 1.055,
    monthLowMultiplier: 0.965,
    monthDropPct: '-8.5%',
    cities: [
      { name: 'Chennai', premiumMultiplier: 1.0045 },
      { name: 'Coimbatore', premiumMultiplier: 1.0020 },
      { name: 'Madurai', premiumMultiplier: 1.0005 },
    ]
  },
  karnataka: {
    id: 'karnataka',
    name: 'Karnataka',
    primaryCity: 'Bengaluru',
    monthHighMultiplier: 1.050,
    monthLowMultiplier: 0.955,
    monthDropPct: '-9.0%',
    cities: [
      { name: 'Bengaluru', premiumMultiplier: 1.0035 },
      { name: 'Mysuru', premiumMultiplier: 0.9990 },
      { name: 'Mangaluru', premiumMultiplier: 1.0012 },
    ]
  }
};

export const AVAILABLE_STATES = Object.values(REGIONAL_DATA);
