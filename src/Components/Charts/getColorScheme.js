// @flow
const competitorColors = [
  '#ab4d06',
  '#f7b301',
  '#6ddb75',
  '#e83f6f',
  '#795391',
  '#9db98b',
  '#67a93c',
  '#1bdeac',
  '#de6bc2',
  '#e4a64e',
];

const deviceTypeColors = {
  desktop: '#2f5ec4',
  mobile: '#72a4f7',
  all: '#313445',
};

// Used for ranks distributions area charts and some pie charts
const defaultAreasColors = ['#d0e0fc', '#a0c2f9', '#72a4f7', '#4285F4', '#2f5ec4', '#484848'];
// const defaultAreasColors = ['#57317c', '#7947aa', '#9a6cc8', '#b68de0', '#d5b7f4', '#eee0fc'];

// Used for keywords competitors, landing pages, tags cloud
export const defaultLinesColors = [
  '#484848',
  '#2f5ec4',
  '#4285F4',
  '#72a4f7',
  '#a0c2f9',
  '#d0e0fc',
];

const unknownCompetitorsColors = {
  competitors: ['#2f5ec4', '#4285F4', '#72a4f7', '#a0c2f9', '#d0e0fc'],
  own: '#f89537',
};

const winnersAndLosersColors = {
  winners: '#2f5ec4',
  losers: '#72a4f7',
  unchanged: '#313445',
};

const rankIntervalsColors = {
  ranks1_3: '#7eb732',
  ranks4_10: '#1dace7',
  ranks11_20: '#626262',
  ranks21_50: '#ffac10',
  ranks51_500: '#e85b59',
  ranks501_rest: '#376c9f',
};

// from F89537 to 313445 http://www.perbang.dk/rgbgradient/
const googleAnalyticsColors = {
  direct: '#F89537',
  organic: '#DB8739',
  cpc: '#BF793B',
  referral: '#A26B3D',
  social: '#865D3F',
  email: '#694F41',
  display: '#4D4143',
  other: '#313445',
};

const sovCompetitorsColors = {
  domain: '#2f5ec4',
  potential: '#313445',
  other: '#72a4f7',
};

export const mrrColors = {
  new: '#12c457',
  expansion: '#7d57f6',
  reactivation: '#36bedf',
  contraction: '#ffc148',
  churn: '#e84c85',
  net: '#33334f',
};

export const colorScheme = {
  orange: '#f89537',
  defaultAreas: defaultAreasColors,
  defaultLines: defaultLinesColors,
  competitors: competitorColors,
  winnersAndLosers: winnersAndLosersColors,
  averageRank: '#000000',
  notes: '#8692a4',
  deviceType: deviceTypeColors,
  unknownCompetitors: unknownCompetitorsColors,
  googleAnalytics: googleAnalyticsColors,
  organicAnalytics: '#DB8739',
  searchVolume: '#4286f4',
  sovCompetitors: sovCompetitorsColors,
  rankIntervals: rankIntervalsColors,
  mrr: mrrColors,
};

export default function getColorScheme() {
  return colorScheme;
}
