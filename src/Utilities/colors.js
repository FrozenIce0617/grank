// @flow
const darkBlue = '#2f63d6';
const lightBlue = '#36bedf';
const green = '#12d15c';
const yellow = '#ffc451';
const pink = '#e84c85';
const purple = '#9a6cc8';
const black = '#313445';
const orange = '#f89537';
const rosa = '#e56be3';
const turquoise = '#1bdeac';
const ocean = '#77e8ef';
const brown = '#efc299';
const grey = '#d7d9e5';
const all = { darkBlue, lightBlue, green, yellow, pink, purple, black, orange, rosa, turquoise, ocean, brown, grey } // prettier-ignore

const lines = [purple, lightBlue, pink, yellow, green, rosa, darkBlue, turquoise, ocean, brown];
const pies = [purple, pink, yellow, lightBlue, green];

// const oceanColors = ['#F1E7FA', '#DBC8EE', '#C6AAE1', '#B08BD5', '#9A6CC8', '#464c90'].reverse();
const oceanColors = ['#d0e0fc', '#a0c2f9', '#72a4f7', '#4285F4', '#2f5ec4', '#484848'].reverse();

const competitorColors = [pink, yellow, green, rosa, darkBlue, orange, black, turquoise, '#ade44e', ocean]; // prettier-ignore

const deviceTypeColors = {
  desktop: purple,
  mobile: lightBlue,
  all: black,
};

const winnersAndLosersColors = {
  winners: '#27ae60', // purple,
  losers: '#f75b5b', // lightBlue,
  unchanged: grey,
};

// Rank distribution "ocean"
const rankDistributionColors = [purple, darkBlue, lightBlue, green, yellow, pink];

// Some pie charts
// const defaultAreasColors = pies;

// Used for keywords competitors, landing pages, tags cloud
// export const defaultLinesColors = lines;

const unknownCompetitorsColors = {
  competitors: [...pies, ...['#CD9FFB', '#FF7FB8', '#FFDE6B', '#50D8F9', '#2CEB76']],
  own: orange,
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
  other: black,
};

const sovCompetitorsColors = {
  domain: purple,
  potential: '#d7d9e5',
  other: [...pies, ...['#CD9FFB', '#FF7FB8', '#FFDE6B', '#50D8F9', '#2CEB76']],
};

export const mrrColors = {
  new: green,
  expansion: purple, // '#7d57f6',
  reactivation: lightBlue,
  contraction: yellow,
  churn: pink,
  net: black,
};

export const colorScheme = {
  orange,
  all,
  rankDistribution: oceanColors,
  defaultAreas: pies,
  defaultLines: lines,
  competitors: competitorColors,
  winnersAndLosers: winnersAndLosersColors,
  averageRank: black,
  notes: black,
  deviceType: deviceTypeColors,
  unknownCompetitors: unknownCompetitorsColors,
  googleAnalytics: googleAnalyticsColors,
  searchVolume: '#4286f4',
  sovCompetitors: sovCompetitorsColors,
  rankIntervals: rankIntervalsColors,
  mrr: mrrColors,
};

export default colorScheme;
