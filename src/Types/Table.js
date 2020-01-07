// @flow
export type SortOrder = 'asc' | 'desc';

// Using max 32 bit signed interger value to specify 'All rows'
export const MAX_NUMBER_OF_ROWS = 2147483647;

export type TableProps = {
  +numberOfRows: number,
  +page: number,
  +sortOrder: SortOrder,
  +sortField: string,
};

export const TableIDs = {
  NOTIFICATIONS: 'keywordsNotifications',
  KEYWORDS: 'keywords',
  LANDING_PAGES: 'landingPages',
  USERS: 'users',
  EXTERNAL_ACCESS: 'external_access',
  TAG_CLOUD: 'tagCloud',
  IMPORT_GSC: 'importGsc',
  COMPETITORS_LEGEND: 'competitorsLegend',
  DOMAIN_DETAILS: 'domainDetails',
  COMPETITORS: 'competitors',
  COMPETITOR_RANKINGS: 'competitorRankings',
  NOTES: 'notes',
  SCHEDULED_REPORTS: 'scheduledReports',
  GENERATED_REPORTS: 'generatedReports',
  REPORT_TEMPLATES: 'reportTemplates',
  INVOICES: 'invoices',
  CONNECTED_ACCOUNTS: 'connectedAccounts',
  PAUSED_DOMAINS: 'pausedDomains',
  GROUPS: 'groups',
  DOMAINS: 'domains',
  WALLET: 'wallet',
  KEYWORD_HISTORY: 'keywordHistory',
  IMPORT_UNIVERSAL: 'importUniversal',
  SALES_CUSTOMERS: 'salesCustomers',
  SALES_DASHBOARD: 'salesDashboard',
  SALES_PLANS: 'salesPlans',
  SALES_PLAN_CHOICES: 'salesPlanChoices',
  SALES_MAILS: 'salesMails',
  SALES_AFFILIATE_DASHBOARD: 'salesAffiliateDashboard',
  AFFILIATE_VISITORS: 'affiliateVisitors',
  AFFILIATE_PAYMENTS: 'affiliatePayments',
  AFFILIATE_CUSTOMERS: 'affiliateCustomers',
  UNKNOWN_COMPETITOR_RANKS: 'unknownCompetitorRanks',
  KEYWORDS_ALL_HISTORY: 'keywordAllHistory',
};
