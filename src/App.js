import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import GTM from 'react-tag-manager';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { tweakNodeOperations } from './Utilities/tweaks';

import { store, apolloClient } from './Store';
// Enable no-data plugin for high charts
import './Components/HighchartsNoData';

import config from 'config';
import BaseContainer from 'Components/BaseContainer';

import {
  DashboardOverview,
  KeywordsOverview,
  KeywordsOverview3,
  KeywordsTable,
  KeywordsCompetitors,
  KeywordsCompetitorsRankings,
  ScheduledReportBuilder,
  KeywordsTags,
  KeywordsLandingpages,
  ImportGSC,
  ImportUniversal,
  NotesList,
  EditProfilePage,
  ChangePasswordPage,
  AccountSettingsPage,
  UsersPage,
  ExternalAccessPage,
  BillingOverviewPage,
  ReferralPage,
  InvoicesPage,
  SubAccountsPage,
  PendingRequestsPage,
  ReportTemplateBuilderPage,
  ReportTemplateBuilderEditPage,
  ReportTemplateBuilderClonePage,
  ApiPage,
  ImportListPage,
  NotFoundPage,
  AccountBlockedPage,
  SystemErrorPage,
  TrialExpiredPage,
  PlanExpiredPage,
  FailedPaymentPage,
  RegisterPage,
  GoogleAccountsCallbackPage,
  CheckoutFormPage,
  UpdatePaymentInfoPage,
  UpdatePaymentMethodPage,
  SelectPackagePage,
  CancelPage,
  ReportPage,
  ReportsOverviewGeneratedPage,
  ReportsOverviewScheduledPage,
  ReportTemplatesPage,
  PausedDomainsPage,
  GroupsPage,
  DomainsPage,
  BulkImportPage,
  ConnectedAccountsPage,
  WalletPage,
  SalesSearchPage,
  SalesOrganizationPage,
  SalesPlansPage,
  SalesCreatePlanPage,
  SalesCustomersPage,
  SalesMetricsPage,
  SalesMailsPage,
  SalesDashboardPage,
  SalesToolsPage,
  SalesAffiliateDashboardPage,
  IntegrationsPage,
  WelcomePage,
  PromotionPage,
  IntegrationApiPage,
  ReleasesPage,
  AccountsDomainsManagementPage,
  AffiliateDashboardPage,
  AffiliateCustomersPage,
  AffiliateVisitorsPage,
  AffiliatePaymentsPage,
  AffiliateCommissionsPage,
  RedeemPage,
} from 'Pages';

import PrivateRoute from './Utilities/PrivateRoute';
import NoStoreRoute from './Utilities/NoStoreRoute';

import 'Utilities/websocket';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-select/dist/react-select.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'flag-icon-css/css/flag-icon.css';
import './css/app.scss';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorBoundary from './Components/ErrorBoundary';

const renderApp = () => (
  <Provider store={store}>
    <ApolloProvider client={apolloClient}>
      <BaseContainer>
        <Switch>
          <PrivateRoute path="/welcome" component={WelcomePage} />
          <PrivateRoute path="/black-friday" component={PromotionPage} />

          {/* Affiliate */}
          <PrivateRoute path="/affiliate/customers/:filter?" component={AffiliateCustomersPage} />
          <PrivateRoute path="/affiliate/referrals/:filter?" component={AffiliateVisitorsPage} />
          <PrivateRoute path="/affiliate/overview/:filter?" component={AffiliateDashboardPage} />
          <PrivateRoute path="/affiliate/payments/:filter?" component={AffiliatePaymentsPage} />
          <PrivateRoute
            path="/affiliate/commissions/:filter?"
            component={AffiliateCommissionsPage}
          />

          {/* Sales */}
          <PrivateRoute path="/sales/organization/:id" component={SalesOrganizationPage} />
          <PrivateRoute path="/sales/plans/create" component={SalesCreatePlanPage} />
          <PrivateRoute path="/sales/plans" component={SalesPlansPage} />
          <PrivateRoute path="/sales/customers" component={SalesCustomersPage} />
          <PrivateRoute path="/sales/metrics" component={SalesMetricsPage} />
          <PrivateRoute path="/sales/search" component={SalesSearchPage} />
          <PrivateRoute path="/sales/mails" component={SalesMailsPage} />
          <PrivateRoute path="/sales/dashboard/:filter?" component={SalesDashboardPage} />
          <PrivateRoute path="/sales/tools" component={SalesToolsPage} />
          <PrivateRoute path="/sales/affiliate/:filter?" component={SalesAffiliateDashboardPage} />

          {/* Billing */}
          <PrivateRoute
            path="/checkout/:cycle/:id/:coupon?"
            component={CheckoutFormPage}
            isTrialExpiredOk
            isPlanExpiredOk
            isFailedPaymentOk
          />
          <PrivateRoute
            path="/billing/paymentinfo"
            component={UpdatePaymentInfoPage}
            isTrialExpiredOk
            isPlanExpiredOk
            isFailedPaymentOk
          />
          <PrivateRoute
            path="/billing/paymentmethod"
            component={UpdatePaymentMethodPage}
            isTrialExpiredOk
            isPlanExpiredOk
            isFailedPaymentOk
          />
          <PrivateRoute
            path="/billing/package/select"
            component={SelectPackagePage}
            isTrialExpiredOk
            isPlanExpiredOk
            isFailedPaymentOk
          />

          {/* Profile */}
          <PrivateRoute path="/profile/password-change" component={ChangePasswordPage} />
          <PrivateRoute path="/profile" component={EditProfilePage} />

          {/* Notes */}
          <PrivateRoute path="/notes/:filter?" component={NotesList} />

          {/* Accounts */}
          <PrivateRoute path="/accounts/invoices/:id" component={InvoicesPage} />
          <PrivateRoute path="/accounts/domains" component={AccountsDomainsManagementPage} />
          <PrivateRoute path="/accounts/requests" component={PendingRequestsPage} />
          <PrivateRoute path="/accounts" component={SubAccountsPage} />

          {/* Google */}
          <PrivateRoute
            path="/account/googleoauth/callback"
            component={GoogleAccountsCallbackPage}
          />

          {/* Account */}
          <PrivateRoute path="/account/users/:filter?" component={UsersPage} />
          <PrivateRoute path="/account/external-access" component={ExternalAccessPage} />
          <PrivateRoute path="/account/billing/cancel/Wdub3p/" component={CancelPage} />
          <PrivateRoute path="/account/billing" component={BillingOverviewPage} />
          <PrivateRoute path="/account/referral" component={ReferralPage} />
          <PrivateRoute path="/account/connected" component={ConnectedAccountsPage} />
          <Redirect from="/account/adobe" to="/account/connected" />
          <Redirect from="/account/googleoauth" to="/account/connected" />
          <PrivateRoute path="/account/wallet" component={WalletPage} />
          <PrivateRoute path="/account" component={AccountSettingsPage} />

          {/* Keywords */}
          <PrivateRoute path="/keywords/import/universal/:filter?" component={ImportUniversal} />
          <PrivateRoute path="/keywords/import/gsc/:filter?" component={ImportGSC} />
          <PrivateRoute path="/keywords/import" component={ImportListPage} />
          <PrivateRoute path="/keywords/overview/:filter?" component={KeywordsOverview} />
          <PrivateRoute path="/keywords/overview-new/:filter?" component={KeywordsOverview3} />

          <PrivateRoute path="/keywords/list/:filter?" component={KeywordsTable} />
          <PrivateRoute path="/keywords/competitors/:filter?" component={KeywordsCompetitors} />
          <PrivateRoute
            path="/keywords/rankings/:filter?"
            component={KeywordsCompetitorsRankings}
          />
          <PrivateRoute path="/keywords/tags/:filter?" component={KeywordsTags} />
          <PrivateRoute path="/keywords/landing-pages/:filter?" component={KeywordsLandingpages} />

          {/* Groups */}
          <PrivateRoute path="/groups/:filter?" component={GroupsPage} />

          {/* Integrations */}
          <PrivateRoute path="/integrations/api" component={IntegrationApiPage} />
          <PrivateRoute path="/integrations" component={IntegrationsPage} />

          {/* Reports PDF */}
          <Route path="/reports/pdf/:scheduledReportId" component={ReportPage} />

          {/* Reports */}
          <PrivateRoute path="/reports/schedule/edit/:id" component={ScheduledReportBuilder} />
          <PrivateRoute path="/reports/schedule" component={ScheduledReportBuilder} />

          <PrivateRoute
            path="/reports/templates/builder/edit/:id"
            component={ReportTemplateBuilderEditPage}
          />
          <PrivateRoute
            path="/reports/templates/builder/clone/:id"
            component={ReportTemplateBuilderClonePage}
          />
          <PrivateRoute path="/reports/templates/builder" component={ReportTemplateBuilderPage} />
          <PrivateRoute path="/reports/templates" component={ReportTemplatesPage} />
          <PrivateRoute path="/reports/generated" component={ReportsOverviewGeneratedPage} />
          <PrivateRoute path="/reports/scheduled" component={ReportsOverviewScheduledPage} />

          {/* Other */}
          <Route path="/api" component={ApiPage} />
          <Route path="/releases" component={ReleasesPage} />

          {/* Register and sign-up */}
          <PrivateRoute path="/register/:id" component={RegisterPage} forceUnauthenticated />
          <PrivateRoute path="/redeem/:slug" component={RedeemPage} forceUnauthenticated />

          {/* Errors */}
          <PrivateRoute
            path="/error/blocked"
            component={AccountBlockedPage}
            isTrialExpiredOk
            isPlanExpiredOk
            isFailedPaymentOk
          />
          <PrivateRoute path="/error/trial-expired" component={TrialExpiredPage} />
          <PrivateRoute path="/error/plan-expired" component={PlanExpiredPage} />
          <PrivateRoute
            path="/error/failed-payment"
            component={FailedPaymentPage}
            isTrialExpiredOk
            isPlanExpiredOk
          />

          {/* Domains */}
          <PrivateRoute path="/domains/paused" component={PausedDomainsPage} />
          <PrivateRoute path="/domains/:filter?" component={DomainsPage} />

          {/* Import */}
          <PrivateRoute path="/import/bulk" component={BulkImportPage} />

          {/* DO NOT PUT ANYTHING BELOW DashboardOverview */}
          <PrivateRoute path="/:filter?" component={DashboardOverview} />

          <Route path="*" component={NotFoundPage} />
        </Switch>
      </BaseContainer>
    </ApolloProvider>
  </Provider>
);

tweakNodeOperations();

ReactDOM.render(
  <StrictMode>
    <ErrorBoundary isLast>
      <GTM
        gtm={{
          id: config.gtmId,
        }}
      >
        <BrowserRouter
          basename={config.basename}
          getUserConfirmation={(message, callback) => callback(false)}
        >
          <Switch>
            <NoStoreRoute path="/error/500/:eventId" component={SystemErrorPage} />
            <NoStoreRoute path="/error/404" component={NotFoundPage} />

            <Route path="/" render={renderApp} />
          </Switch>
        </BrowserRouter>
      </GTM>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById('root'),
);
