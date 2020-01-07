// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { find, findIndex, reject } from 'lodash';
import { t } from 'Utilities/i18n/index';
import { UncontrolledTooltip } from 'reactstrap';
import './actions-menu.scss';
import { compose } from 'react-apollo';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { uniqueId } from 'lodash';
import { Link } from 'react-router-dom';
import DashboardIcon from 'icons/menu/desktop.svg?inline';
import AccountsRequestsIcon from 'icons/menu/accounts-requests.svg?inline';
import OverviewIcon from 'icons/menu/overview.svg?inline';
import KeywordsIcon from 'icons/menu/keywords.svg?inline';
import CompetitorsIcon from 'icons/menu/competitors.svg?inline';
import CompetitorRankingsIcon from 'icons/menu/competitor-rankings.svg?inline';
import TagsIcon from 'icons/menu/tags.svg?inline';
import LandingPageIcon from 'icons/menu/landingpage.svg?inline';
import NotesIcon from 'icons/menu/notes.svg?inline';
import ReportsIcon from 'icons/menu/reports.svg?inline';
import GeneratedReportsIcon from 'icons/menu/generated-reports.svg?inline';
import ReportTemplatesIcon from 'icons/menu/report-templates.svg?inline';
import SettingsIcon from 'icons/menu/settings.svg?inline';
import UsersIcon from 'icons/menu/users.svg?inline';
import BillingIcon from 'icons/menu/billing.svg?inline';
import ReferralIcon from 'icons/menu/referral.svg?inline';
import LinkedAccountsIcon from 'icons/menu/linked-accounts.svg?inline';
import ConnectedAccountsIcon from 'icons/menu/connected-accounts.svg?inline';
import EditProfileIcon from 'icons/menu/edit-profile.svg?inline';
import ChangePasswordIcon from 'icons/change-password.svg?inline';
import GoogleSearchConsoleIcon from 'icons/menu/google-searchconsole.svg?inline';
import PausedDomainsIcon from 'icons/menu/paused-domains.svg?inline';
import GroupsIcon from 'icons/menu/groups.svg?inline';
import DomainsIcon from 'icons/menu/domains.svg?inline';
import BulkImportIcon from 'icons/menu/bulkimport.svg?inline';
import ApiIcon from 'icons/menu/api.svg?inline';
import WalletIcon from 'icons/menu/wallet.svg?inline';
import SalesSearchIcon from 'icons/menu/keywords.svg?inline';
import SalesMetricsIcon from 'icons/menu/google-analytics.svg?inline';
import ToolsIcon from 'icons/menu/tools.svg?inline';
import MailIcon from 'icons/menu/api.svg?inline';
import PeriodFilter from 'Components/PeriodFilter';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import RefreshKeywords from 'Components/RefreshKeywords';
import { linkToPageWithDomains } from 'Components/Filters/LinkToDomain';
import cn from 'classnames';
import IntegrationsIcon from 'icons/menu/connected-accounts.svg?inline';
import TransferIcon from 'icons/menu/transfer-multi-account-domain.svg?inline';
import VisitorsIcon from 'icons/menu/visitors.svg?inline';
import PaymentsIcon from 'icons/menu/credit-card.svg?inline';
import CommissionsIcon from 'icons/menu/money-note.svg?inline';
import CustomersIcon from 'icons/menu/customers.svg?inline';
import AffiliateMetricsIcon from 'icons/main-menu/affiliate.svg?inline';
import {
  KEYWORDS_FILTER_SET,
  NOTES_FILTER_SET,
  IMPORT_GSC_FILTER_SET,
  EMPTY_FILTER_SET,
  AFFILIATE_FILTER_SET,
  SALES_FILTER_SET,
} from 'Types/FilterSet';
import linkWithFilters from 'Components/Filters/linkWithFilters';

const DASHBOARD = 'dashboard';

export const KEYWORDS = 'keywords';
const KEYWORDS_OVERVIEW = 'keywords_overview';
const KEYWORDS_COMPETITORS = 'keywords_competitors';
export const KEYWORDS_COMPETITORS_RANKINGS = 'keywords_competitors_rankings';
const KEYWORDS_LANDINGPAGES = 'keywords_landingpages';
const KEYWORDS_TAGS = 'keywords_tags';
const KEYWORDS_IMPORT_GSC = 'keywords_import_gsc';
const KEYWORDS_IMPORT_3RD_PARTY = 'keywords_import_3rd_party';
const NOTES = 'notes';

export const REPORTS_GENERATED = 'reports_generated';
export const REPORTS_SCHEDULED = 'reports_scheduled';
export const REPORTS_TEMPLATES = 'reports_templates';
export const REPORTS_SCHEDULE = 'reports_schedule';
export const REPORTS_SCHEDULE_EDIT = 'reports_schedule_edit';

export const GROUPS = 'groups';
export const DOMAINS = 'domains';
export const BULK_IMPORT = 'bulk_import';

const ACCOUNT = 'account';
const ACCOUNT_USERS = 'account_users';
export const ACCOUNT_OWNERS = 'account_owners';
export const ACCOUNT_BILLING = 'account_billing';
const ACCOUNT_BILLING_PAYMENT_INFO = 'account_billing_payment_info';
const ACCOUNT_BILLING_PAYMENT_METHOD = 'account_billing_payment_method';
const ACCOUNT_REFERRAL = 'account_referral';
export const ACCOUNT_CONNECTED_ACCOUNTS = 'account_connected_accounts';
export const ACCOUNT_WALLET = 'account_wallet';

export const SUB_ACCOUNTS = 'sub_accounts';
export const ACCOUNTS_REQUESTS = 'accounts_requests';
export const TRANSFER_ACCOUNTS_DOMAINS = 'transfer_accounts_domains';
export const DOMAINS_PAUSED = 'domains_paused';

const PROFILE = 'profile';
const PROFILE_CHANGE_PASSWORD = 'profile_change_password';
export const INTEGRATIONS = 'integrations';
export const INTEGRATIONS_API = 'integrations_api';

const GOOGLE_ANALYTICS = 'google_analytics';
const GOOGLE_SEARCH_CONSOLE = 'google_search_console';

export const SALES_SEARCH = 'sales_search';
export const SALES_ORGANIZATION = 'sales_organization';
export const SALES_PLANS = 'sales_plans';
export const SALES_CUSTOMERS = 'SALES_CUSTOMERS';
export const SALES_METRICS = 'sales_metrics';
export const SALES_MAILS = 'sales_mails';
export const SALES_DASHBOARD = 'sales_dashboard';
export const SALES_TOOLS = 'sales_tools';
export const SALES_AFFILIATE_DASHBOARD = 'sales_affiliate_dashboard';
export const WELCOME = 'welcome';

export const AFFILIATE_DASHBOARD = 'affiliate_dashboard';
export const AFFILIATE_CUSTOMERS = 'affiliate_customers';
export const AFFILIATE_VISITORS = 'affiliate_visitors';
export const AFFILIATE_PAYMENTS = 'affiliate_payments';
export const AFFILIATE_COMMISSIONS = 'affiliate_commissions';

type Props = {
  menuFor:
    | typeof DASHBOARD
    | typeof KEYWORDS
    | typeof KEYWORDS_OVERVIEW
    | typeof KEYWORDS_COMPETITORS
    | typeof KEYWORDS_COMPETITORS_RANKINGS
    | typeof KEYWORDS_LANDINGPAGES
    | typeof KEYWORDS_TAGS
    | typeof KEYWORDS_IMPORT_GSC
    | typeof KEYWORDS_IMPORT_3RD_PARTY
    | typeof NOTES
    | typeof REPORTS_GENERATED
    | typeof REPORTS_SCHEDULED
    | typeof REPORTS_TEMPLATES
    | typeof REPORTS_SCHEDULE
    | typeof REPORTS_SCHEDULE_EDIT
    | typeof ACCOUNT
    | typeof SUB_ACCOUNTS
    | typeof ACCOUNTS_REQUESTS
    | typeof ACCOUNT_USERS
    | typeof ACCOUNT_BILLING
    | typeof ACCOUNT_REFERRAL
    | typeof ACCOUNT_WALLET
    | typeof PROFILE
    | typeof PROFILE_CHANGE_PASSWORD
    | typeof GOOGLE_ANALYTICS
    | typeof GOOGLE_SEARCH_CONSOLE
    | typeof GROUPS
    | typeof DOMAINS
    | typeof BULK_IMPORT
    | typeof INTEGRATIONS
    | typeof INTEGRATIONS_API
    | typeof SALES_SEARCH
    | typeof SALES_ORGANIZATION
    | typeof WELCOME
    | typeof SALES_PLANS
    | typeof SALES_CUSTOMERS
    | typeof SALES_MAILS
    | typeof SALES_DASHBOARD
    | typeof SALES_TOOLS
    | typeof SALES_METRICS
    | typeof SALES_AFFILIATE_DASHBOARD
    | typeof AFFILIATE_DASHBOARD
    | typeof AFFILIATE_CUSTOMERS
    | typeof AFFILIATE_VISITORS
    | typeof AFFILIATE_COMMISSIONS
    | typeof AFFILIATE_PAYMENTS,
  children?: ?React.Node,
  domainsFilter: Object,
  user: Object,
  domainInfo?: DomainInfo,
  className: string,

  // Force min-max range to bound values
  compareToMin?: Date,
  compareToMax?: Date,
  compareToMessage?: string,

  hidePeriodFilter: boolean,
  onlyPeriodFilter: boolean,
};

type State = {
  loading: boolean,

  selectedItem: number,
  selectWithMouse: boolean,
};

class ActionsMenu extends React.Component<Props, State> {
  static defaultProps = {
    children: null,
    canRefresh: false,
    domainsFilter: {
      value: [],
    },
  };

  state = {
    loading: false,

    selectedItem: 0,
    selectWithMouse: true,
  };

  componentDidMount() {
    const menuItems = this.getMenuItems();
    const currentMenuItemIndex = findIndex(
      reject(menuItems, 'hideInMenu'),
      menuItem => menuItem.id === this.props.menuFor,
    );
    if (~currentMenuItemIndex) {
      this.setState({ selectedItem: currentMenuItemIndex }); // eslint-disable-line react/no-did-mount-set-state
    }

    const moveSelection = offset => {
      const { selectedItem } = this.state;
      const nextItem = selectedItem + offset;
      const items = reject(this.getMenuItems(), 'hideInMenu');
      this.setState({
        selectedItem: Math.max(Math.min(nextItem, items.length - 1), 0),
        selectWithMouse: false,
      });
      return false;
    };
  }

  getDomainPageLink = (page, filterSet) => {
    const {
      domainsFilter: { value: domains },
    } = this.props;
    return linkToPageWithDomains(page, domains, filterSet);
  };

  getMenuItems() {
    const {
      menuFor,
      user,
      domainsFilter: { value: domains },
    } = this.props;
    switch (menuFor) {
      case DASHBOARD:
        return [
          {
            id: DASHBOARD,
            label: t('Dashboard'),
            icon: <DashboardIcon />,
            hideDropDown: true,
          },
        ];

      case KEYWORDS_OVERVIEW:
      case KEYWORDS:
      case KEYWORDS_COMPETITORS:
      case KEYWORDS_COMPETITORS_RANKINGS:
      case KEYWORDS_IMPORT_3RD_PARTY:
      case KEYWORDS_IMPORT_GSC:
      case KEYWORDS_TAGS:
      case KEYWORDS_LANDINGPAGES:
      case NOTES:
        const list = [
          {
            id: KEYWORDS_OVERVIEW,
            label: t('Overview'),
            link: '/keywords/overview',
            icon: <OverviewIcon />,
            filterSet: KEYWORDS_FILTER_SET,
          },
          {
            id: KEYWORDS,
            label: t('Keywords'),
            link: '/keywords/list',
            icon: <KeywordsIcon />,
            filterSet: KEYWORDS_FILTER_SET,
          },
        ];

        if (domains.length === 1) {
          list.push(
            {
              id: KEYWORDS_COMPETITORS,
              label: t('Competitors'),
              link: '/keywords/competitors',
              icon: <CompetitorsIcon />,
              filterSet: KEYWORDS_FILTER_SET,
            },
            {
              id: KEYWORDS_COMPETITORS_RANKINGS,
              label: t('Competitor Ranks'),
              link: '/keywords/rankings',
              icon: <CompetitorRankingsIcon />,
              filterSet: KEYWORDS_FILTER_SET,
            },
            {
              id: KEYWORDS_LANDINGPAGES,
              label: t('Landing Pages'),
              link: '/keywords/landing-pages',
              icon: <LandingPageIcon />,
              filterSet: KEYWORDS_FILTER_SET,
            },
            {
              id: KEYWORDS_TAGS,
              label: t('Tag Cloud'),
              link: '/keywords/tags',
              icon: <TagsIcon />,
              filterSet: KEYWORDS_FILTER_SET,
            },
            {
              id: NOTES,
              label: t('Notes'),
              link: '/notes',
              icon: <NotesIcon />,
              filterSet: NOTES_FILTER_SET,
            },
            {
              id: KEYWORDS_IMPORT_GSC,
              label: t('Import From Google Search Console'),
              link: '/keywords/import/gsc',
              icon: <GoogleSearchConsoleIcon />,
              hideInMenu: true,
              filterSet: IMPORT_GSC_FILTER_SET,
            },
          );
        }
        list.push({
          id: KEYWORDS_IMPORT_3RD_PARTY,
          label: t('Import From Third Parties'),
          link: '/keywords/import',
          icon: <GoogleSearchConsoleIcon />,
          hideInMenu: true,
          filterSet: EMPTY_FILTER_SET,
        });

        return list.map(item => ({
          ...item,
          link: this.getDomainPageLink(item.link, item.filterSet),
        }));
      case REPORTS_GENERATED:
      case REPORTS_SCHEDULED:
      case REPORTS_TEMPLATES:
      case REPORTS_SCHEDULE:
      case REPORTS_SCHEDULE_EDIT:
        return [
          {
            id: REPORTS_SCHEDULE,
            label: t('Schedule Report'),
            link: '/reports/schedule',
            icon: <ReportsIcon />,
            hideInMenu: true,
          },
          {
            id: REPORTS_SCHEDULE_EDIT,
            label: t('Edit Schedule Report'),
            link: '/reports/scheduled',
            icon: <ReportsIcon />,
            hideInMenu: true,
          },
          {
            id: REPORTS_SCHEDULED,
            label: t('Scheduled Reports'),
            link: '/reports/scheduled',
            icon: <ReportsIcon />,
          },
          {
            id: REPORTS_GENERATED,
            label: t('Generated Reports'),
            link: '/reports/generated',
            icon: <GeneratedReportsIcon />,
          },
          {
            id: REPORTS_TEMPLATES,
            label: t('Report Templates'),
            link: '/reports/templates',
            icon: <ReportTemplatesIcon />,
          },
        ];
      case ACCOUNT:
      case ACCOUNT_USERS:
      case ACCOUNT_OWNERS:
      case ACCOUNT_BILLING:
      case ACCOUNT_REFERRAL:
      case ACCOUNT_CONNECTED_ACCOUNTS:
      case ACCOUNT_WALLET:
        return [
          {
            id: ACCOUNT,
            label: t('Account Information'),
            link: '/account',
            icon: <SettingsIcon />,
          },
          {
            id: ACCOUNT_USERS,
            label: t('Users'),
            link: '/account/users',
            icon: <UsersIcon />,
          },
          {
            id: ACCOUNT_OWNERS,
            label: t('External access'),
            link: '/account/external-access',
            icon: <LinkedAccountsIcon />,
            // hideInMenu: !user.organization.multiAccountOwners.length,
          },
          {
            id: ACCOUNT_BILLING,
            label: t('Subscription'),
            link:
              user.organization.activePlan && user.organization.activePlan.isTrial
                ? '/billing/package/select'
                : '/account/billing',
            icon: <BillingIcon />,
            hideInMenu: user.organization && !user.isOrgAdmin,
          },
          {
            id: ACCOUNT_BILLING_PAYMENT_INFO,
            label: t('Payment Info'),
            link: '/billing/paymentinfo',
            icon: <BillingIcon />,
            hideInMenu: true,
          },
          {
            id: ACCOUNT_BILLING_PAYMENT_METHOD,
            label: t('Payment Method'),
            link: '/billing/paymentmethod',
            icon: <BillingIcon />,
            hideInMenu: true,
          },
          {
            id: ACCOUNT_CONNECTED_ACCOUNTS,
            label: t('Connected Integrations'),
            link: '/account/connected',
            icon: <ConnectedAccountsIcon />,
          },
          {
            id: ACCOUNT_WALLET,
            label: t('Wallet'),
            link: '/account/wallet',
            icon: <WalletIcon />,
          },
        ];
      case SUB_ACCOUNTS:
      case ACCOUNTS_REQUESTS:
      case TRANSFER_ACCOUNTS_DOMAINS:
        return [
          {
            id: SUB_ACCOUNTS,
            label: t('Sub-Accounts'),
            link: '/accounts',
            icon: <LinkedAccountsIcon />,
          },
          {
            id: ACCOUNTS_REQUESTS,
            label: t('Accounts Requests'),
            link: '/accounts/requests',
            icon: <AccountsRequestsIcon />,
            hideInMenu: !(user.organization && user.organization.isPartner),
          },
          {
            id: TRANSFER_ACCOUNTS_DOMAINS,
            label: t('Transfer & Copy Domains'),
            link: '/accounts/domains',
            icon: <TransferIcon />,
            hideInMenu: !(user.organization && user.organization.isPartner),
          },
        ];

      case GROUPS:
      case DOMAINS:
      case DOMAINS_PAUSED:
        return [
          {
            id: GROUPS,
            label: t('Groups'),
            link: '/groups',
            icon: <GroupsIcon />,
          },
          {
            id: DOMAINS,
            label: t('Domains'),
            link: '/domains',
            icon: <DomainsIcon />,
          },
          {
            id: DOMAINS_PAUSED,
            label: t('Paused Domains'),
            link: '/domains/paused',
            icon: <PausedDomainsIcon />,
            hideInMenu: !(
              user.organization &&
              user.organization.activePlan &&
              user.organization.activePlan.featureCanPause
            ),
          },
        ];

      case PROFILE:
      case PROFILE_CHANGE_PASSWORD:
        return [
          {
            id: PROFILE,
            label: t('Profile'),
            link: '/profile',
            icon: <EditProfileIcon />,
          },
          {
            id: PROFILE_CHANGE_PASSWORD,
            label: t('Change Password'),
            link: '/profile/password-change',
            icon: <ChangePasswordIcon />,
          },
        ];

      case INTEGRATIONS:
      case INTEGRATIONS_API:
      case BULK_IMPORT:
        return [
          {
            id: INTEGRATIONS,
            label: t('Integrations'),
            link: '/integrations',
            icon: <IntegrationsIcon />,
          },
          {
            id: INTEGRATIONS_API,
            label: t('API Filters'),
            link: '/integrations/api',
            icon: <ApiIcon />,
          },
          {
            id: BULK_IMPORT,
            label: t('Bulk Import'),
            link: '/import/bulk',
            icon: <BulkImportIcon />,
          },
        ];

      case SALES_SEARCH:
      case SALES_ORGANIZATION:
      case SALES_PLANS:
      case SALES_CUSTOMERS:
      case SALES_METRICS:
      case SALES_DASHBOARD:
      case SALES_MAILS:
      case SALES_TOOLS:
      case SALES_AFFILIATE_DASHBOARD:
        return [
          {
            id: SALES_SEARCH,
            label: t('Search'),
            link: '/sales/search',
            icon: <SalesSearchIcon />,
          },
          {
            id: SALES_ORGANIZATION,
            label: t('Organization'),
            link: '/sales/search',
            hideInMenu: true,
            icon: <SalesSearchIcon />,
          },
          {
            id: SALES_PLANS,
            label: t('Plans'),
            link: '/sales/plans',
            icon: <BillingIcon />,
          },
          {
            id: SALES_CUSTOMERS,
            label: t('Customers'),
            link: '/sales/customers',
            icon: <UsersIcon />,
          },
          {
            id: SALES_MAILS,
            label: t('Mails'),
            link: '/sales/mails',
            icon: <MailIcon />,
          },
          {
            id: SALES_DASHBOARD,
            label: t('Dashboard'),
            link: '/sales/dashboard',
            icon: <MailIcon />,
          },
          {
            id: SALES_METRICS,
            label: t('Metrics'),
            link: '/sales/metrics',
            icon: <SalesMetricsIcon />,
          },
          {
            id: SALES_AFFILIATE_DASHBOARD,
            label: t('Affiliate Metrics'),
            link: '/sales/affiliate',
            icon: <AffiliateMetricsIcon />,
            hideInMenu: !(user && user.isAffiliateAdmin),
          },
          {
            id: SALES_TOOLS,
            label: t('Tools'),
            link: '/sales/tools',
            icon: <ToolsIcon />,
          },
        ].map(item => ({
          ...item,
          link: linkWithFilters(item.link, [], SALES_FILTER_SET),
        }));

      case AFFILIATE_DASHBOARD:
      case AFFILIATE_CUSTOMERS:
      case AFFILIATE_VISITORS:
      case AFFILIATE_COMMISSIONS:
      case AFFILIATE_PAYMENTS:
        return [
          {
            id: AFFILIATE_DASHBOARD,
            label: t('Dashboard'),
            link: '/affiliate/overview',
            icon: <DashboardIcon />,
          },
          {
            id: AFFILIATE_CUSTOMERS,
            label: t('Customers'),
            link: '/affiliate/customers',
            icon: <CustomersIcon />,
          },
          {
            id: AFFILIATE_VISITORS,
            label: t('Referrals'),
            link: '/affiliate/referrals',
            icon: <VisitorsIcon />,
          },
          {
            id: AFFILIATE_COMMISSIONS,
            label: t('Commissions'),
            link: '/affiliate/commissions',
            icon: <CommissionsIcon />,
          },
          {
            id: AFFILIATE_PAYMENTS,
            label: t('Payments'),
            link: '/affiliate/payments',
            icon: <PaymentsIcon />,
          },
        ].map(item => ({
          ...item,
          link: linkWithFilters(item.link, [], AFFILIATE_FILTER_SET),
        }));

      case WELCOME:
        return [
          {
            id: WELCOME,
            label: t('Welcome'),
            link: '/welcome',
            icon: <IntegrationsIcon />,
          },
        ];

      default:
        return [];
    }
  }

  render() {
    const {
      domainInfo,
      compareToMin,
      compareToMax,
      compareToMessage,
      hidePeriodFilter,
      className,
      onlyPeriodFilter,
    } = this.props;
    const menuItems = this.getMenuItems();
    const currentMenuItem = find(menuItems, menuItem => menuItem.id === this.props.menuFor);

    if (!currentMenuItem) {
      return <div>{t('Something is wrong here.')}</div>;
    }

    const periodFilterMin = compareToMin || (domainInfo && domainInfo.firstRefreshAt);
    const periodFilterMax = compareToMax || (domainInfo && domainInfo.lastRefreshAt);
    const periodFilterRenderer = !hidePeriodFilter ? (
      <PeriodFilter
        min={periodFilterMin}
        max={periodFilterMax}
        message={compareToMessage}
        onlyPeriodFilter={onlyPeriodFilter}
      />
    ) : null;

    const tabsClassName = cn('tabs', {
      'with-actions': this.props.children,
    });
    const showRefresh = domainInfo && this.props.menuFor === KEYWORDS;
    return (
      <div className="actions-menu">
        {menuItems.length <= 1 && currentMenuItem.hideDropDown ? (
          <div className={tabsClassName}>
            <ul className="nav nav-tabs">
              <li className="nav-item active">
                <Link className="nav-link active" to="/">
                  <span>
                    <span className="icon">{currentMenuItem.icon}</span>{' '}
                    <span>{currentMenuItem.label}</span>
                  </span>
                </Link>
              </li>
            </ul>
            {periodFilterRenderer}
          </div>
        ) : (
          <div className={tabsClassName}>
            <ul className="nav nav-tabs">
              {menuItems.map(item => {
                if (item.hideInMenu) {
                  return null;
                }
                const selected = item.id === currentMenuItem.id;

                const targetId = uniqueId('Tooltip-Tab');
                return (
                  <li className="nav-item" key={targetId}>
                    <Link
                      id={targetId}
                      className={selected ? 'nav-link active' : 'nav-link'}
                      to={item.link}
                    >
                      {selected ? (
                        <span>
                          <span className="icon">{item.icon}</span> <span>{item.label}</span>
                        </span>
                      ) : (
                        <div className="center-icon">{item.icon}</div>
                      )}
                    </Link>

                    <UncontrolledTooltip
                      target={targetId}
                      delay={{ show: 0, hide: 0 }}
                      placement="top"
                    >
                      {item.label}
                    </UncontrolledTooltip>
                  </li>
                );
              })}
            </ul>
            {periodFilterRenderer}
          </div>
        )}

        {(this.props.children || domainInfo) && (
          <div className="tabs-container">
            <div className={cn('actions', className)}>{this.props.children}</div>
            {showRefresh && (
              <RefreshKeywords
                domainId={domainInfo.id}
                lastManualRefreshAt={domainInfo.lastManualRefreshAt}
                canRefresh={domainInfo.canRefresh}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector('domains');
const mapStateToProps = state => ({
  domainsFilter: domainsFilterSelector(state),
  user: state.user,
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(ActionsMenu);
