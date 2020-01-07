// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate/index';
import ActionsMenu, { SALES_ORGANIZATION } from 'Pages/Layout/ActionsMenu/index';
import { Container } from 'reactstrap';
import { compose, withApollo, graphql, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import toast from 'Components/Toast/index';
import './sales-organization.scss';
import { t } from 'Utilities/i18n/index';
import Loader from 'Components/Loader';
import moment from 'moment';
import { showModal } from 'Actions/ModalAction';

type Props = {
  organizationQuery: Object,
  adminSalesManagersData: Object,
  showModal: Function,
};

type State = {
  displayClients: boolean,
  displayUsers: boolean,
  displaySubAccounts: boolean,
  displayPlans: boolean,
  displayInvoices: boolean,
  displayFailedPayments: boolean,
  displayTrialAbuseLog: boolean,
};

const SET_SALES_MANAGER = gql`
  mutation($input: SetSalesManagerInput!) {
    setSalesManager(input: $input) {
      organization {
        id
        salesManager {
          user {
            email
          }
        }
      }
    }
  }
`;

class SalesOrganization extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      displayClients: false,
      displayUsers: false,
      displaySubAccounts: false,
      displayPlans: false,
      displayInvoices: false,
      displayFailedPayments: false,
      displayTrialAbuseLog: false,
    };
  }

  display(e, b) {
    this.setState({
      [e]: b,
    });
  }

  handleDeleteUser = (evt, userId) => {
    evt.preventDefault();

    this.props
      .softDeleteUser({
        variables: { input: { id: userId } },
      })
      .then(({ data: { softDeleteUser: { errors } } }) => {
        if (errors && errors.length) {
          toast.error(t('Could not delete user'));
          return;
        }
        toast.success(t('User deleted'));
        this.props.organizationQuery.refetch();
      });
  };

  renderPaymentMethod = paymentMethod => {
    if (paymentMethod === 'A_1') {
      return <span>{t('Invoice')}</span>;
    }

    return <span>{t('braintree')}</span>;
  };

  renderOrganization() {
    const organization = this.props.organizationQuery.adminOrganization;
    const user = this.props.user;
    const managers = this.props.adminSalesManagersData.adminSalesManagers;

    if (!organization) return null;
    return (
      <div>
        {organization.multiAccountLink && (
          <p className="alert alert-warning">
            <strong>{t('This account is a sub account!')}</strong>
            <br />
            {t('Owner')}:{' '}
            <a
              href={`/app/sales/organization/${organization.multiAccountLink.fromOrganization.id}`}
            >
              #{organization.multiAccountLink.fromOrganization.id}{' '}
              {organization.multiAccountLink.fromOrganization.name}{' '}
              {organization.multiAccountLink.isOrgAdmin && (
                <span className="badge badge-primary">{t('Admin')}</span>
              )}
            </a>
            <br />
            {t('Payer')}:{' '}
            {organization.multiAccountLink.fromOrganizationPays ? (
              <a
                href={`/app/sales/organization/${
                  organization.multiAccountLink.fromOrganization.id
                }`}
              >
                #{organization.multiAccountLink.fromOrganization.id}{' '}
                {organization.multiAccountLink.fromOrganization.name}
              </a>
            ) : (
              <span>{t('Sub Account')}</span>
            )}
          </p>
        )}

        {/* List */}
        <h1 className="sales-organization-title">
          #{organization.id} {organization.name}
        </h1>

        <div className="row sales-organization-row" style={{ marginTop: 20 }}>
          <div className="col-12 col-md-3 sales-organization-sidebar">
            <a
              href={`/accuranker_admin/impersonate_organization/${organization.slug}/`}
              className="btn btn-block btn-brand-orange-gradient"
            >
              {t('Impersonate')}
            </a>{' '}
            <span
              onClick={() => {
                this.props.showModal({
                  modalType: 'SalesMakeAffiliateForm',
                  modalTheme: 'light',
                  modalProps: {
                    organizationId: organization.id,
                  },
                });
              }}
              className="btn btn-block btn-brand-purple-gradient"
            >
              {t('Add demo content')}
            </span>{' '}
            <span
              onClick={() => {
                this.props.showModal({
                  modalType: 'SalesExtendForm',
                  modalTheme: 'light',
                  modalProps: {
                    organizationId: organization.id,
                  },
                });
              }}
              className="btn btn-block btn-brand-purple-gradient"
            >
              {t('Extend Plan')}
            </span>{' '}
            {user.isCfo && (
              <span
                onClick={() => {
                  this.props.showModal({
                    modalType: 'SalesRefundForm',
                    modalTheme: 'light',
                    modalProps: {
                      organizationId: organization.id,
                    },
                  });
                }}
                className="btn btn-block btn-brand-purple-gradient"
              >
                {t('Refund')}
              </span>
            )}{' '}
            <a
              className="btn btn-block btn-outline-red"
              onClick={() => {
                this.props.showModal({
                  modalType: 'SalesLockOrganization',
                  modalTheme: 'light',
                  modalProps: {
                    organizationId: organization.id,
                  },
                });
              }}
            >
              {t('Lock / Close')}
            </a>{' '}
          </div>

          <div className="sales-organization-main col-12 col-md-9">
            <div className="sales-organization-block-title">{t('Created')}</div>
            <div>{moment(organization.dateAdded).format('YYYY-MM-DD, HH:mm')}</div>

            <div className="sales-organization-block-title">{t('Active')}</div>
            <div>
              {organization.active ? (
                <span className="badge badge-success">{t('Yes')}</span>
              ) : (
                <span className="badge badge-danger">{t('No')}</span>
              )}
            </div>

            <div className="sales-organization-block-title">{t('Affiliate')}</div>
            <div>
              {organization.isAffiliate ? (
                <span className="badge badge-success">{t('Yes')}</span>
              ) : (
                <div>
                  <span className="badge badge-danger">{t('No')}</span>{' '}
                  <span
                    onClick={() => {
                      this.props.showModal({
                        modalType: 'SalesMakeAffiliateForm',
                        modalTheme: 'light',
                        modalProps: {
                          organizationId: organization.id,
                        },
                      });
                    }}
                    className="btn btn-sm btn-brand-purple-gradient"
                  >
                    {t('Make affiliate')}
                  </span>{' '}
                </div>
              )}
            </div>

            <div className="sales-organization-block-title">{t('Billing name')}</div>
            {organization.paymentcontact ? (
              <React.Fragment>
                <div>
                  ({organization.paymentcontact.id}) {organization.paymentcontact.companyName}
                </div>

                <div className="sales-organization-block-title">{t('Payment Method')}</div>
                <div>{this.renderPaymentMethod(organization.paymentcontact.paymentMethod)}</div>

                <div className="sales-organization-block-title">{t('VAT')}</div>
                <div>
                  {organization.paymentcontact.vatNo || (
                    <span className="badge badge-danger">{t('No')}</span>
                  )}
                </div>
              </React.Fragment>
            ) : (
              <span>{t('No billing information')}</span>
            )}

            <div className="sales-organization-block-title">{t('Sales manager')}</div>
            <div>
              <Mutation mutation={SET_SALES_MANAGER}>
                {(setSalesManager, { data }) => {
                  const sm = organization.salesManager;
                  return (
                    <React.Fragment>
                      {sm ? (
                        sm.user ? (
                          sm.user.email
                        ) : (
                          ` #${sm.id} ${sm.name}`
                        )
                      ) : data ? (
                        data.setSalesManager.organization.salesManager.user.email
                      ) : (
                        <a
                          href="#"
                          className=""
                          onClick={e => {
                            e.preventDefault();
                            setSalesManager({
                              variables: {
                                input: {
                                  organizationId: organization.id,
                                  salesManagerId: user.salesManager.id,
                                },
                              },
                            });
                          }}
                        >
                          {t('Assign to you')}
                        </a>
                      )}

                      {/* CFOs can (re)assign customers to other sales managers */}
                      {user.isCfo && (
                        <React.Fragment>
                          <span style={{ padding: '0 8px' }}> | </span>
                          {managers && managers.length ? (
                            <select
                              className="infinite-table-select"
                              defaultValue="x"
                              onChange={e =>
                                setSalesManager({
                                  variables: {
                                    input: {
                                      organizationId: organization.id,
                                      salesManagerId: managers[e.target.value].id,
                                    },
                                  },
                                })
                              }
                            >
                              <option value="x" disabled>
                                {t('Select sales manager')}
                              </option>
                              {managers.map((el, i) => (
                                <option key={el.id} value={i}>
                                  {el.name}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  );
                }}
              </Mutation>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderClients() {
    const organization = this.props.organizationQuery.adminOrganization;
    let domainsCount = 0;
    let keywordsCount = 0;
    if (organization && organization.clients) {
      organization.clients.forEach(c => {
        domainsCount += c.domains.length;
        c.domains.forEach(d => {
          keywordsCount += d.totalKeywords;
        });
      });
    }

    return (
      <div>
        <h3
          className="clickable"
          onClick={e => this.display('displayClients', !this.state.displayClients)}
        >
          {t('Groups & Domains')} ({organization && organization.clients
            ? organization.clients.length
            : 0}{' '}
          {t('groups')}, {domainsCount} {t('domains')}, {keywordsCount} {t('keywords')})
        </h3>

        {this.state.displayClients && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('ID')}</th>
                <th scope="col">{t('Group')}</th>
                <th scope="col">{t('Domain')}</th>
                <th scope="col">{t('Created')}</th>
                <th scope="col">{t('Services')}</th>
                <th scope="col">{t('Keywords')}</th>
              </tr>
            </thead>
            <tbody>
              {organization &&
                organization.clients &&
                organization.clients.map(client => [
                  <tr key={`client-${client.id}`}>
                    <td>{client.id}</td>
                    <td>{client.name}</td>
                    <td />
                    <td>{client.dateAdded}</td>
                    <td />
                    <td />
                  </tr>,
                  client.domains.map(domain => (
                    <tr key={`domain-${domain.id}`}>
                      <td>{domain.id}</td>
                      <td />
                      <td>
                        {domain.displayName} <i>{domain.domain}</i>
                      </td>
                      <td>{domain.dateAdded}</td>
                      <td>
                        {domain.googleOauthConnectionGa && (
                          <span className="badge badge-success">{t('Google Analytics')}</span>
                        )}
                        {domain.googleOauthConnectionGsc && (
                          <span className="badge badge-success">{t('Google Search Console')}</span>
                        )}
                        {domain.adobeSuiteId && (
                          <span className="badge badge-success">{t('Adobe Analytics')}</span>
                        )}
                      </td>
                      <td>{domain.totalKeywords}</td>
                    </tr>
                  )),
                ])}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderUsers() {
    const organization = this.props.organizationQuery.adminOrganization;

    return (
      <div>
        <h3
          className="clickable"
          onClick={e => this.display('displayUsers', !this.state.displayUsers)}
        >
          {t('Users')} ({organization.users.length})
        </h3>

        {this.state.displayUsers && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('ID')}</th>
                <th scope="col">{t('Name')}</th>
                <th scope="col">{t('Email')}</th>
                <th scope="col">{t('Added')}</th>
                <th scope="col">{t('Admin')}</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {organization.users.map(user => (
                <tr key={`user-${user.id}`}>
                  <td>{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{moment(user.dateJoined).format('HH:mm YYYY-MM-DD')}</td>
                  <td>
                    {user.isOrgAdmin && <span className="badge badge-success">{t('Yes')}</span>}
                  </td>
                  <td className="delete-user-button-cell">
                    <a
                      className="btn btn-block btn-outline-red"
                      href="#"
                      onClick={evt => this.handleDeleteUser(evt, user.id)}
                    >
                      {t('Delete')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderSubAccounts() {
    const organization = this.props.organizationQuery.adminOrganization;

    return (
      <div>
        <h3
          className="clickable"
          onClick={e => this.display('displaySubAccounts', !this.state.displaySubAccounts)}
        >
          {t('Sub Accounts')} ({organization.multiAccounts.length})
        </h3>

        {this.state.displaySubAccounts && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('ID')}</th>
                <th scope="col">{t('Created')}</th>
                <th scope="col">{t('Organization')}</th>
                <th scope="col">{t('Admin')}</th>
                <th scope="col">{t('Billing')}</th>
              </tr>
            </thead>
            <tbody>
              {organization.multiAccounts.map(multiAccount => (
                <tr key={multiAccount.id}>
                  <td>{multiAccount.toOrganization.id}</td>
                  <td>{multiAccount.createdAt}</td>
                  <td>
                    #{multiAccount.toOrganization.id} {multiAccount.toOrganization.name}
                  </td>
                  <td>
                    {multiAccount.isOrgAdmin && (
                      <span className="badge badge-success">{t('Yes')}</span>
                    )}
                  </td>
                  <td>
                    Payer:{' '}
                    {multiAccount.fromOrganizationPays ? (
                      <span>{t('Owner')}</span>
                    ) : (
                      <span>{t('Sub Account')}</span>
                    )}
                    {multiAccount.fromOrganizationDiscountType && (
                      <span>
                        <br />Discount type: {multiAccount.fromOrganizationDiscountType}
                      </span>
                    )}
                    {multiAccount.fromOrganizationDiscountPercent && (
                      <span>
                        <br />Discount: {multiAccount.fromOrganizationDiscountPercent}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderPlans() {
    const organization = this.props.organizationQuery.adminOrganization;

    return (
      <div>
        <h3
          className="clickable"
          onClick={e => this.display('displayPlans', !this.state.displayPlans)}
        >
          {t('Plans')} ({organization.plans.length})
        </h3>

        {this.state.displayPlans && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('ID')}</th>
                <th scope="col">{t('Period')}</th>
                <th scope="col">{t('Name')}</th>
                <th scope="col">{t('Price')}</th>
                <th scope="col">{t('Keywords')}</th>
                <th scope="col">{t('Features')}</th>
              </tr>
            </thead>
            <tbody>
              {organization.plans.map(plan => (
                <tr key={plan.id}>
                  <td>
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.props.showModal({
                          modalType: 'SalesOrganizationPlan',
                          modalTheme: 'light',
                          modalProps: {
                            planId: plan.id,
                          },
                        });
                      }}
                    >
                      {plan.id}
                    </a>
                  </td>
                  <td>
                    {plan.startDate} - {plan.endDate}
                  </td>
                  <td>
                    {plan.active && <span className="badge badge-success mr-1">{t('Active')}</span>}
                    {plan.isTrial && <span className="badge badge-warning mr-1">{t('Trial')}</span>}
                    {plan.billingCycleInMonths > 1 && (
                      <span className="badge badge-primary mr-1">{t('Paid Yearly')}</span>
                    )}
                    {plan.name}
                  </td>
                  <td>
                    ${plan.priceMonthly}m / ${plan.priceYearly}y
                  </td>
                  <td>{plan.maxKeywords}</td>
                  <td>
                    {plan.featureApiAccess && (
                      <span className="badge badge-success mr-1">{t('API')}</span>
                    )}
                    {plan.featureAdvancedMetrics && (
                      <span className="badge badge-success mr-1">{t('Advanced Metrics')}</span>
                    )}
                    <span className="badge badge-primary mr-1">
                      {t('Max domains')}: {plan.maxDomains == -1 ? t('Unlimited') : plan.maxDomains}
                    </span>
                    <span className="badge badge-primary mr-1">
                      {t('Max users')}: {plan.maxUsers == -1 ? t('Unlimited') : plan.maxUsers}
                    </span>
                    <span className="badge badge-primary mr-1">
                      {t('Max competitors')}:{' '}
                      {plan.maxCompetitors == -1 ? t('Unlimited') : plan.maxCompetitors}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderInvoices() {
    const organization = this.props.organizationQuery.adminOrganization;
    const { user } = this.props;

    return (
      <div>
        <h3
          className="clickable"
          onClick={e => this.display('displayInvoices', !this.state.displayInvoices)}
        >
          {t('Invoices')} ({organization.invoices.length})
        </h3>

        {this.state.displayInvoices && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('ID')}</th>
                <th scope="col">{t('Date')}</th>
                <th scope="col">{t('Paid')}</th>
                <th scope="col">{t('Total before VAT')}</th>
                <th scope="col">{t('Total')}</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {organization.invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{new Date(invoice.createdAt).toLocaleString()}</td>
                  <td>
                    {invoice.paid ? (
                      <span className="badge badge-success">{t('Paid')}</span>
                    ) : (
                      <span className="badge badge-danger">{t('Unpaid')}</span>
                    )}

                    {invoice.payment &&
                      invoice.payment.refundedDate &&
                      !invoice.creditedInvoice && (
                        <span className="badge badge-danger ml-1">
                          {t('Refunded')}{' '}
                          {new Date(invoice.payment.refundedDate).toLocaleDateString()}
                        </span>
                      )}

                    {invoice.creditedInvoice && (
                      <span className="badge badge-warning ml-1">{t('Is refund')}</span>
                    )}
                  </td>
                  <td>
                    {invoice.amount} {invoice.currency}
                  </td>
                  <td>
                    {invoice.total} {invoice.currency}
                  </td>
                  <td>
                    <a href={invoice.url}>{t('PDF')}</a>{' '}
                    {user.isCfo &&
                      invoice.payment &&
                      !invoice.payment.refundedDate &&
                      !invoice.creditedInvoice && (
                        <span
                          className="btn btn-brand-purple-gradient btn-sm"
                          onClick={() => {
                            this.props.showModal({
                              modalType: 'SalesRefundForm',
                              modalTheme: 'light',
                              modalProps: {
                                organizationId: organization.id,
                                invoiceId: invoice.id,
                              },
                            });
                          }}
                        >
                          {t('Refund')}
                        </span>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderFailedPayments() {
    const { adminOrganization: organization } = this.props.organizationQuery;
    return (
      <div>
        <h3
          className="clickable"
          onClick={() => this.display('displayFailedPayments', !this.state.displayFailedPayments)}
        >
          {t('Failed Payments')} ({organization.failedPayments.length})
        </h3>

        {this.state.displayFailedPayments && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('Date')}</th>
                <th scope="col">{t('Reason')}</th>
              </tr>
            </thead>
            <tbody>
              {organization.failedPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.createdAt}</td>
                  <td>{payment.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderTrialAbuseLog() {
    const { adminOrganization: organization } = this.props.organizationQuery;
    return (
      <div>
        <h3
          className="clickable"
          onClick={() => this.display('displayTrialAbuseLog', !this.state.displayTrialAbuseLog)}
        >
          {t('Trial Abuse Logs')} ({organization.trialAbuseLog.length})
        </h3>

        {this.state.displayTrialAbuseLog && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('Date')}</th>
                <th scope="col">{t('Description')}</th>
                <th scope="col">{t('Log')}</th>
              </tr>
            </thead>
            <tbody>
              {organization.trialAbuseLog.map(log => (
                <tr key={log.id}>
                  <td>{log.createdAt}</td>
                  <td>{log.description}</td>
                  <td>{log.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_ORGANIZATION} />
        <Container className="generic-page sales-organization" fluid>
          {this.props.organizationQuery.loading || this.props.organizationQuery.error ? (
            <Loader style={{ height: '500px' }} />
          ) : (
            <div>
              {this.renderOrganization()}
              <hr />
              {this.renderClients()}
              <hr />
              {this.renderUsers()}
              <hr />
              {this.renderSubAccounts()}
              <hr />
              {this.renderPlans()}
              <hr />
              {this.renderInvoices()}
              <hr />
              {this.renderFailedPayments()}
              <hr />
              {this.renderTrialAbuseLog()}
            </div>
          )}
        </Container>
      </DashboardTemplate>
    );
  }
}

const organizationQuery = gql`
  query salesOrganization_adminOrganization($id: ID!) {
    adminOrganization(id: $id) {
      id
      name
      active
      slug
      dateAdded
      isPartner
      isAffiliate
      paymentcontact {
        id
        companyName
        paymentMethod
        vatNo
        vatNumber
      }
      clients {
        id
        name
        dateAdded
        domains {
          id
          domain
          displayName
          dateAdded
          totalKeywords
          googleOauthConnectionGa {
            id
          }
          googleOauthConnectionGsc {
            id
          }
          adobeSuiteId
        }
      }
      users {
        id
        dateJoined
        email
        fullName
        isOrgAdmin
      }
      invoices {
        id
        number
        createdAt
        paid
        currency
        vat
        amount
        total
        url
        payment {
          refundedDate
        }
        creditedInvoice {
          id
        }
      }
      multiAccountLink {
        id
        isOrgAdmin
        fromOrganizationPays
        fromOrganization {
          id
          name
        }
      }
      multiAccounts {
        id
        isOrgAdmin
        createdAt
        fromOrganizationPays
        fromOrganizationDiscountType
        fromOrganizationDiscountPercent
        toOrganization {
          id
          name
        }
      }
      plans {
        id
        active
        startDate
        endDate
        name
        priceMonthly
        priceYearly
        isTrial
        maxKeywords
        billingCycleInMonths
        featureApiAccess
        featureAdvancedMetrics
        maxDomains
        maxUsers
        maxCompetitors
      }
      trialAbuseLog {
        id
        createdAt
        description
        value
      }
      salesManager {
        id
        user {
          id
          fullName
          email
        }
      }
      failedPayments {
        id
        createdAt
        reason
      }
    }
  }
`;

const softDeleteUserMutation = gql`
  mutation salesOrganization_softDeleteUser($input: SoftDeleteUserInput!) {
    softDeleteUser(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const adminSalesManagers = gql`
  query salesOrganization_adminSalesManagers {
    adminSalesManagers {
      id
      name
      active
    }
  }
`;

const mapStateToProps = state => ({
  user: state.user,
});

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(organizationQuery, {
    name: 'organizationQuery',
    options: props => ({ variables: { id: props.match.params.id } }),
  }),
  graphql(adminSalesManagers, { name: 'adminSalesManagersData' }),
  graphql(softDeleteUserMutation, { name: 'softDeleteUser' }),
)(withApollo(SalesOrganization));
