import { t } from 'Utilities/i18n/index';
import withAnalytics from 'Components/HOC/withAnalytics';
import KeywordsOverviewContent from './KeywordsOverview';
import KeywordsOverviewContent3 from './Keywords/Overview';
import KeywordsTableContent from './Keywords/Table';
import Dashboard from './Dashboard';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import AccountSettings from './AccountSettings';
import Users from './Users';
import ExternalAccess from './ExternalAccess';
import Wallet from './Wallet';
import BillingOverview from './Billing/Overview';
import Referral from './ReferralPage';
import ConnectedAccounts from 'Pages/ConnectedAccounts';
import KeywordsCompetitorsContent from './Keywords/Competitors';
import KeywordsCompetitorsRankingsContent from './Keywords/CompetitorsRankings';
import {
  KEYWORDS_FILTER_SET,
  DOMAINS_FILTER_SET,
  EMPTY_FILTER_SET,
  IMPORT_GSC_FILTER_SET,
  IMPORT_UNIVERSAL_FILTER_SET,
  NOTES_FILTER_SET,
  AFFILIATE_FILTER_SET,
  SALES_FILTER_SET,
} from 'Types/FilterSet';
import toPageWithFilterSet from 'Components/HOC/withFilterset';

import ScheduledReportBuilderContent from './ScheduledReportBuilder';
import KeywordsTagsContent from './Keywords/Tags';
import KeywordsLandingpagesContent from './Keywords/Landingpages';
import ImportFromGSCContent from './Import/GSC';
import ImportUniversalContent from './Import/Universal';
import NotesContent from './NotesList';
import Invoices from './Invoices';
import SubAccounts from './Accounts/SubAccounts';
import PendingRequests from './Accounts/PendingRequests';
import TransferMultiAccountDomain from './Accounts/TransferMultiAccountDomain';
import PausedDomains from './PausedDomains';
import ReportTemplateBuilder from './ReportTemplateBuilder/CreateTemplate';
import ReportTemplateBuilderEdit from './ReportTemplateBuilder/EditTemplate';
import ReportTemplateBuilderClone from './ReportTemplateBuilder/CloneTemplate';
import Api from './ApiPage';
import ImportList from './Import/3rdParty';
import Integrations from './Integrations';
import IntegrationApi from './IntegrationApi';
import NotFound from 'Pages/ErrorPages/404';
import SystemError from 'Pages/ErrorPages/500';
import BlockedError from 'Pages/ErrorPages/Blocked';
import TrialExpired from 'Pages/ErrorPages/TrialExpired';
import PlanExpired from 'Pages/ErrorPages/PlanExpired';
import FailedPayment from 'Pages/ErrorPages/FailedPayment';
import Register from 'Pages/Register';
import Redeem from 'Pages/Redeem';
import Welcome from 'Pages/Welcome';
import Promotion from 'Pages/Promotion';
import GoogleAccountsCallback from 'Components/User/GoogleAccounts/Callback';

import CheckoutForm from 'Pages/Billing/Checkout';
import UpdatePaymentInfo from 'Pages/Billing/UpdatePaymentInfo';
import UpdatePaymentMethod from 'Pages/Billing/UpdatePaymentMethod';
import SelectPackage from 'Pages/Billing/SelectPackage';
import CancelForm from 'Pages/Billing/CancelPlan';
import Login from 'Pages/Login';
import Report from 'Pages/Report';
import ReportsOverviewGenerated from 'Pages/ReportsOverview/GeneratedReportsTable';
import ReportsOverviewScheduled from 'Pages/ReportsOverview/ScheduledReportsTable';
import ReportTemplates from 'Pages/ReportTemplatesOverview';

import Groups from 'Pages/Groups';
import Domains from 'Pages/Domains';
import BulkImport from 'Pages/BulkImport';

import SalesSearch from 'Pages/Sales/Search';
import SalesOrganization from 'Pages/Sales/Organization';
import SalesPlans from 'Pages/Sales/Plans';
import SalesCreatePlan from 'Pages/Sales/CreatePlan';
import SalesCustomers from 'Pages/Sales/Customers';
import SalesMetrics from 'Pages/Sales/Metrics';
import SalesMails from 'Pages/Sales/Mails';
import SalesDashboard from 'Pages/Sales/Dashboard';
import SalesTools from 'Pages/Sales/Tools';
import SalesAffiliateDashboard from 'Pages/Sales/AffiliateDashboard';

import Releases from 'Pages/Releases';

import AffiliateDashboard from 'Pages/AffiliateDashboard';
import AffiliateCustomers from 'Pages/AffiliateCustomers';
import AffiliateVisitors from 'Pages/AffiliateVisitors';
import AffiliatePayments from 'Pages/AffiliatePayments';
import AffiliateCommissions from 'Pages/AffiliateCommissions';

export const DashboardOverview = withAnalytics(
  toPageWithFilterSet(Dashboard, DOMAINS_FILTER_SET),
  () => t('Dashboard'),
);
export const KeywordsOverview = withAnalytics(
  toPageWithFilterSet(KeywordsOverviewContent, KEYWORDS_FILTER_SET),
  () => t('Overview'),
);
export const KeywordsOverview3 = withAnalytics(
  toPageWithFilterSet(KeywordsOverviewContent3, KEYWORDS_FILTER_SET),
  () => t('Overview'),
);
export const KeywordsTable = withAnalytics(
  toPageWithFilterSet(KeywordsTableContent, KEYWORDS_FILTER_SET),
  () => t('Keywords'),
);
export const KeywordsCompetitors = withAnalytics(
  toPageWithFilterSet(KeywordsCompetitorsContent, KEYWORDS_FILTER_SET),
  () => t('Competitors'),
);
export const KeywordsCompetitorsRankings = withAnalytics(
  toPageWithFilterSet(KeywordsCompetitorsRankingsContent, KEYWORDS_FILTER_SET),
  () => t('Competitor Ranks'),
);
export const ScheduledReportBuilder = withAnalytics(
  ScheduledReportBuilderContent,
  () => `${t('Reporting')} / ${t('Scheduled Reports')} / ${t('Edit')}`,
);
export const KeywordsTags = withAnalytics(
  toPageWithFilterSet(KeywordsTagsContent, KEYWORDS_FILTER_SET),
  () => t('Tag Cloud'),
);
export const KeywordsLandingpages = withAnalytics(
  toPageWithFilterSet(KeywordsLandingpagesContent, KEYWORDS_FILTER_SET),
  () => t('Landing Pages'),
);
export const NotesList = withAnalytics(toPageWithFilterSet(NotesContent, NOTES_FILTER_SET), () =>
  t('Notes'),
);
export const ImportGSC = withAnalytics(
  toPageWithFilterSet(ImportFromGSCContent, IMPORT_GSC_FILTER_SET),
  () => t('Import from Google Search Console'),
);
export const ImportUniversal = withAnalytics(
  toPageWithFilterSet(ImportUniversalContent, IMPORT_UNIVERSAL_FILTER_SET),
  () => `${t('Integrations')} / ${t('Bulk Import')} / ${t('Import')}`,
);
export const GroupsPage = withAnalytics(toPageWithFilterSet(Groups, DOMAINS_FILTER_SET), () =>
  t('Groups'),
);
export const DomainsPage = withAnalytics(toPageWithFilterSet(Domains, DOMAINS_FILTER_SET), () =>
  t('Domains'),
);
export const AffiliateVisitorsPage = withAnalytics(
  toPageWithFilterSet(AffiliateVisitors, AFFILIATE_FILTER_SET),
  () => `${t('Affiliate')} / ${t('Visitors')}`,
);
export const AffiliatePaymentsPage = withAnalytics(
  toPageWithFilterSet(AffiliatePayments, AFFILIATE_FILTER_SET),
  () => `${t('Affiliate')} / ${t('Payments')}`,
);
export const AffiliateCommissionsPage = withAnalytics(
  toPageWithFilterSet(AffiliateCommissions, AFFILIATE_FILTER_SET),
  () => `${t('Affiliate')} / ${t('Commissions')}`,
);
export const AffiliateDashboardPage = withAnalytics(
  toPageWithFilterSet(AffiliateDashboard, AFFILIATE_FILTER_SET),
  () => `${t('Affiliate')} / ${t('Dashboard')}`,
);
export const AffiliateCustomersPage = withAnalytics(
  toPageWithFilterSet(AffiliateCustomers, AFFILIATE_FILTER_SET),
  () => `${t('Affiliate')} / ${t('Customers')}`,
);
export const SalesAffiliateDashboardPage = withAnalytics(
  toPageWithFilterSet(SalesAffiliateDashboard, SALES_FILTER_SET),
  () => `${t('Sales')} / ${t('Affiliate Dashboard')}`,
);

// All pages without filters
export const UsersPage = withAnalytics(
  toPageWithFilterSet(Users, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('Users')}`,
);
export const ExternalAccessPage = withAnalytics(
  toPageWithFilterSet(ExternalAccess, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('External Access')}`,
);
export const WalletPage = withAnalytics(
  toPageWithFilterSet(Wallet, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('Wallet')}`,
);
export const SalesSearchPage = withAnalytics(
  toPageWithFilterSet(SalesSearch, SALES_FILTER_SET),
  () => `${t('Sales')} / ${t('Search')}`,
);
export const SalesOrganizationPage = withAnalytics(
  toPageWithFilterSet(SalesOrganization, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Organization')}`,
);
export const SalesPlansPage = withAnalytics(
  toPageWithFilterSet(SalesPlans, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Plans')}`,
);
export const SalesCreatePlanPage = withAnalytics(
  toPageWithFilterSet(SalesCreatePlan, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Search')} / ${t('Create')}`,
);
export const SalesCustomersPage = withAnalytics(
  toPageWithFilterSet(SalesCustomers, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Customers')}`,
);
export const SalesMetricsPage = withAnalytics(
  toPageWithFilterSet(SalesMetrics, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Metrics')}`,
);
export const SalesMailsPage = withAnalytics(
  toPageWithFilterSet(SalesMails, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Mails')}`,
);
export const SalesDashboardPage = withAnalytics(
  toPageWithFilterSet(SalesDashboard, SALES_FILTER_SET),
  () => `${t('Sales')} / ${t('Dashboard')}`,
);
export const SalesToolsPage = withAnalytics(
  toPageWithFilterSet(SalesTools, EMPTY_FILTER_SET),
  () => `${t('Sales')} / ${t('Tools')}`,
);
export const EditProfilePage = withAnalytics(
  toPageWithFilterSet(EditProfile, EMPTY_FILTER_SET),
  () => `${t('Profile')} / ${t('Edit')}`,
);
export const ChangePasswordPage = withAnalytics(
  toPageWithFilterSet(ChangePassword, EMPTY_FILTER_SET),
  () => `${t('Profile')} / ${t('Change Password')}`,
);
export const AccountSettingsPage = withAnalytics(
  toPageWithFilterSet(AccountSettings, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('Information')}`,
);
export const BillingOverviewPage = withAnalytics(
  toPageWithFilterSet(BillingOverview, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('Subscription')}`,
);
export const ConnectedAccountsPage = withAnalytics(
  toPageWithFilterSet(ConnectedAccounts, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('Connected Integrations')}`,
);
export const InvoicesPage = withAnalytics(
  toPageWithFilterSet(Invoices, EMPTY_FILTER_SET),
  () => `${t('Account')} / ${t('Subscription')} / ${t('Invoices')}`,
);
export const SubAccountsPage = withAnalytics(
  toPageWithFilterSet(SubAccounts, EMPTY_FILTER_SET),
  () => t('Sub-accounts'),
);
export const PendingRequestsPage = withAnalytics(
  toPageWithFilterSet(PendingRequests, EMPTY_FILTER_SET),
  () => `${t('Sub-accounts')} / ${t('Accounts Requests')}`,
);
export const AccountsDomainsManagementPage = withAnalytics(
  toPageWithFilterSet(TransferMultiAccountDomain, EMPTY_FILTER_SET),
  () => `${t('Sub-accounts')} / ${t('Transfer & Copy Domains')}`,
);
export const PausedDomainsPage = withAnalytics(
  toPageWithFilterSet(PausedDomains, EMPTY_FILTER_SET),
  () => `${t('Groups')} / ${t('Pause Domains')}`,
);
export const ReportTemplateBuilderPage = withAnalytics(
  toPageWithFilterSet(ReportTemplateBuilder, EMPTY_FILTER_SET),
  () => `${t('Reporting')} / ${t('Report Templates')} / ${t('Create')}`,
);
export const ReportTemplateBuilderEditPage = withAnalytics(
  toPageWithFilterSet(ReportTemplateBuilderEdit, EMPTY_FILTER_SET),
  () => `${t('Reporting')} / ${t('Report Templates')} / ${t('Edit')}`,
);
export const ReportTemplateBuilderClonePage = withAnalytics(
  toPageWithFilterSet(ReportTemplateBuilderClone, EMPTY_FILTER_SET),
  () => `${t('Reporting')} / ${t('Report Templates')} / ${t('Clone')}`,
);
export const ApiPage = withAnalytics(toPageWithFilterSet(Api, EMPTY_FILTER_SET), () => t('API'));
export const ImportListPage = withAnalytics(
  toPageWithFilterSet(ImportList, EMPTY_FILTER_SET),
  () => `${t('Integrations')} / ${t('Importers')}`,
);
export const BulkImportPage = withAnalytics(
  BulkImport,
  () => `${t('Integrations')} / ${t('Bulk Import')}`,
);
export const NotFoundPage = withAnalytics(NotFound, () => `${t('Error')} / ${t('Page Not Found')}`);
export const SystemErrorPage = withAnalytics(
  SystemError,
  () => `${t('Error')} / ${t('Something Went Wrong')}`,
);
export const TrialExpiredPage = withAnalytics(TrialExpired, () => t('Trial has expired'));
export const PlanExpiredPage = withAnalytics(
  toPageWithFilterSet(PlanExpired, EMPTY_FILTER_SET),
  () => t('Plan has expired'),
);
export const FailedPaymentPage = withAnalytics(FailedPayment, () => t('Payment failed'));
export const AccountBlockedPage = withAnalytics(BlockedError, () => t('Account Blocked'));
export const RegisterPage = withAnalytics(Register, () => t('Register'));
export const RedeemPage = withAnalytics(Redeem, () => t('Redeem'));
export const WelcomePage = withAnalytics(Welcome, () => t('Welcome'));
export const PromotionPage = withAnalytics(Promotion, () => t('Promotion'));
export const GoogleAccountsCallbackPage = withAnalytics(GoogleAccountsCallback, () =>
  t('Auth Callback'),
);
export const CheckoutFormPage = withAnalytics(
  CheckoutForm,
  () => `${t('Account')} / ${t('Subscription')} / ${t('Checkout')}`,
);
export const UpdatePaymentInfoPage = withAnalytics(
  UpdatePaymentInfo,
  () => `${t('Account')} / ${t('Subscription')} / ${t('Payment Info')}`,
);
export const UpdatePaymentMethodPage = withAnalytics(
  UpdatePaymentMethod,
  () => `${t('Account')} / ${t('Subscription')} / ${t('Payment Method')}`,
);
export const SelectPackagePage = withAnalytics(
  SelectPackage,
  () => `${t('Account')} / ${t('Subscription')} / ${t('Select Plan')}`,
);
export const CancelPage = withAnalytics(
  CancelForm,
  () => `${t('Account')} / ${t('Subscription')} / ${t('Cancel')}`,
);
export const LoginPage = withAnalytics(Login, () => t('Login'));
export const IntegrationsPage = withAnalytics(
  toPageWithFilterSet(Integrations, EMPTY_FILTER_SET),
  () => t('Integrations'),
);
export const IntegrationApiPage = withAnalytics(
  toPageWithFilterSet(IntegrationApi, EMPTY_FILTER_SET),
  () => `${t('Integrations')} / ${t('API Filters')}`,
);
export const ReportPage = Report;
export const ReportsOverviewGeneratedPage = withAnalytics(
  ReportsOverviewGenerated,
  () => `${t('Reporting')} / ${t('Generated Reports')}`,
);
export const ReportsOverviewScheduledPage = withAnalytics(
  ReportsOverviewScheduled,
  () => `${t('Reporting')} / ${t('Scheduled Reports')}`,
);
export const ReportTemplatesPage = withAnalytics(
  ReportTemplates,
  () => `${t('Reporting')} / ${t('Report Templates')}`,
);
export const ReleasesPage = withAnalytics(Releases, () => t('Releases'));
