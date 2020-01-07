// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql, Mutation, withApollo } from 'react-apollo';
import type { CellRendererParams, HeaderRendererParams } from 'react-virtualized';
import gql from 'graphql-tag';
import moment from 'moment';
import { t } from 'Utilities/i18n';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';
import { ColumnIDs } from './ColumnIDs';
import InfiniteTable from 'Components/InfiniteTable';
import { offlineFilter, withProps } from 'Components/HOC';
import { uniqueId } from 'lodash';
import './sales-dashboard.scss';
import ActionsCell from 'Components/Table/TableRow/ActionsCell';
import { redirectToExternalUrl } from 'Utilities/underdash';
import { showModal } from 'Actions/ModalAction';
import { Link } from 'react-router-dom';
import HeaderCellBase from 'Components/InfiniteTable/Cells/HeaderCell';
import { copyToClipboard } from 'Utilities/underdash';
import toast from 'Components/Toast';
import config from 'config';
import Gravatar from 'react-gravatar';
import { LATEST } from 'Components/PeriodFilter/model';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { UncontrolledTooltip } from 'reactstrap';

import CreateOfferIcon from 'icons/copy.svg?inline';
import LockAccountIcon from 'icons/lock.svg?inline';
import EditPlanIcon from 'icons/menu/settings.svg?inline';
import ExtendPlanIcon from 'icons/menu/customers.svg?inline';
import EmailIcon from 'icons/envelope.svg?inline';
import PhoneIcon from 'icons/mobile.svg?inline';
import PipedriveIcon from 'icons/pipedrive.svg?inline';

type Props = {
  salesManagerId: number,

  // Automatic
  filters: any,
  client: Object,
  prepareData: Function,
  showModal: Function,
};

type State = {
  resetIndicator: number,
};

const tableName = TableIDs.SALES_DASHBOARD;
const defaultRowHeight = 35;
const HeaderCell = withProps({ tableName, hideFilter: true })(HeaderCellBase);

const adminDashboardQuery = gql`
  query salesDashboardInfiniteTable_adminSalesDashboard($input: SalesDashboardInput!) {
    adminSalesDashboard(input: $input) {
      organizations {
        subAccount
        organization {
          active
          id
          phoneNumber
          dateAdded
          name
          slug
          accountBlocked
          country {
            name
            id
          }
          salesManager {
            id
            name
            user {
              email
            }
          }
          deals {
            type
            pipedriveDealId
          }
        }
        organizationSettings {
          companyType
          companySize
          keywordsSize
        }
        abuse
        user {
          email
        }
        affiliateVisitor {
          id
          origin
        }
        latestPlan {
          id
          endDate
          isTrial
          maxKeywords
        }
        domains
        keywords
        inDialog
      }
    }
  }
`;

const SET_SALES_MANAGER = gql`
  mutation($input: SetSalesManagerInput!) {
    setSalesManager(input: $input) {
      organization {
        id
        salesManager {
          id
          name
          user {
            email
          }
        }
      }
    }
  }
`;

class SalesDashboardInfiniteTable extends Component<Props, State> {
  state = {
    resetIndicator: 0,
  };

  // actions

  // table

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.filters !== this.props.filters ||
      nextProps.salesManagerId !== this.props.salesManagerId
    ) {
      this.resetTable();
    }
  }

  getQuery = () => {
    const { filters, salesManagerId } = this.props;

    const input = {
      salesManagerId,
      filters,
    };

    return this.props.client.query({
      query: adminDashboardQuery,
      variables: {
        input,
      },
      fetchPolicy: 'network-only',
    });
  };

  defaultColumns = [
    ColumnIDs.CREATED_AT,
    ColumnIDs.SALES_MANAGER,
    ColumnIDs.ORGANIZATION,
    ColumnIDs.COUNTRY,
    ColumnIDs.TYPE,
    ColumnIDs.ABUSE,
    ColumnIDs.REQUIRED_KEYWORDS,
    ColumnIDs.EMPLOYEES,
    ColumnIDs.ORIGIN,
    ColumnIDs.PLAN_DAYS_LEFT,
    ColumnIDs.DOMAINS,
    ColumnIDs.KEYWORDS,
    // ColumnIDs.IN_DIALOGUE,
    ColumnIDs.STATUS,
    ColumnIDs.ACTIONS,
  ];

  getColumns = () => {
    const { user } = this.props;
    return [
      {
        id: ColumnIDs.CREATED_AT,
        name: t('Date'),
        width: 200,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { organization } = props.rowData;
          return <span>{moment(new Date(organization.dateAdded)).format('LLL')}</span>;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.CREATED_AT}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.SALES_MANAGER,
        name: t('Sales Manager'),
        width: 300,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => (
          <Mutation mutation={SET_SALES_MANAGER}>
            {(setSalesManager, { data }) => {
              let sm = props.rowData.organization.salesManager;
              if (data) {
                sm = data.setSalesManager.organization.salesManager;
              }

              const deal = props.rowData.organization.deals.find(d => d.type === 'A_1');

              const actions = [];

              if (sm) {
                if (deal) {
                  actions.push({
                    onSelect: () => {
                      window.open(`${config.pipeDriveUrl}/deal/${deal.pipedriveDealId}`, '_blank');
                    },
                    label: t('Goto deal in PipeDrive'),
                    icon: PipedriveIcon,
                    className: 'pipedrive-active',
                  });
                } else {
                  actions.push({
                    onSelect: () => {
                      this.props.showModal({
                        modalType: 'SalesCreatePipedriveDeal',
                        modalTheme: 'light',
                        modalProps: {
                          organizationId: props.rowData.id,
                          onSuccess: () => {
                            this.resetTable();
                          },
                        },
                      });
                    },
                    label: t('Send to Pipedrive'),
                    icon: PipedriveIcon,
                  });
                }
              }

              return (
                <div className="w-100">
                  {sm ? (
                    <React.Fragment>
                      <Gravatar email={sm.user.email} rating="g" default="mm" size={25} />
                      <span className="ml-1">{sm.name}</span>
                    </React.Fragment>
                  ) : (
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setSalesManager({
                          variables: {
                            input: {
                              organizationId: props.rowData.id,
                              salesManagerId: user.salesManager.id,
                            },
                          },
                        });
                      }}
                    >
                      {t('Assign to you')}
                    </a>
                  )}

                  {sm && (
                    <span className="float-right">
                      <ActionsCell shouldUpdateIndicator={props.rowData} actions={actions} />
                    </span>
                  )}
                </div>
              );
            }}
          </Mutation>
        ),
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.SALES_MANAGER}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.ORGANIZATION,
        name: t('Organization'),
        width: 200,
        responsive: true,
        hasDynamicHeight: true,
        cellRenderer: (props: CellRendererParams) => {
          const { organization } = props.rowData;
          const emailTooltipId = uniqueId('email-tooltip');
          const phoneTooltipId = uniqueId('phone-tooltip');

          return (
            <div className="organization-cell">
              <strong>
                <Link to={`/sales/organization/${organization.id}`}>
                  {props.rowData.organization.name}
                </Link>
              </strong>
              <div className={'actions-cell'}>
                <div className={'icon-with-tooltip'}>
                  {props.rowData.user && (
                    <React.Fragment>
                      <EmailIcon
                        id={emailTooltipId}
                        onClick={() => {
                          copyToClipboard(props.rowData.user.email);
                          toast.success(t('Copied to clipboard'));
                        }}
                      />
                      <UncontrolledTooltip
                        delay={{ show: 0, hide: 0 }}
                        placement="top"
                        target={emailTooltipId}
                        key={emailTooltipId}
                      >
                        {props.rowData.user.email}
                      </UncontrolledTooltip>
                    </React.Fragment>
                  )}
                  {organization.phoneNumber && (
                    <React.Fragment>
                      <PhoneIcon
                        id={phoneTooltipId}
                        onClick={() => {
                          copyToClipboard(organization.phoneNumber);
                          toast.success(t('Copied to clipboard'));
                        }}
                      />
                      <a href={`callto:${organization.phoneNumber}`}>
                        {organization.phoneNumber.replace(/\s/g, '')}
                      </a>
                      <UncontrolledTooltip
                        delay={{ show: 0, hide: 0 }}
                        placement="top"
                        target={phoneTooltipId}
                        key={phoneTooltipId}
                      >
                        {organization.phoneNumber}
                      </UncontrolledTooltip>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.ORGANIZATION}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.COUNTRY,
        name: t('Country'),
        width: 70,
        cellRenderer: (props: CellRendererParams) => {
          const { organization } = props.rowData;
          if (!organization.country) {
            return <span />;
          }
          const tooltipId = uniqueId('country-tooltip');

          return (
            <React.Fragment>
              <div id={tooltipId}>
                <span className={`flag-icon flag-icon-${organization.country.id.toLowerCase()}`} />
                <span className="ml-1">{organization.country.id}</span>
              </div>
              <UncontrolledTooltip
                delay={{ show: 0, hide: 0 }}
                placement="top"
                target={tooltipId}
                key={tooltipId}
              >
                {organization.country.name}
              </UncontrolledTooltip>
            </React.Fragment>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.COUNTRY}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.TYPE,
        name: t('Type'),
        width: 200,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { companyType } = props.rowData.organizationSettings;

          if (companyType === 'A_1') {
            return <span className="badge badge-primary">{t('Agency')}</span>;
          } else if (companyType === 'A_2') {
            return <span className="badge badge-success">{t('E-commerce')}</span>;
          } else if (companyType === 'A_3') {
            return <span className="badge badge-info">{t('Brand')}</span>;
          } else if (companyType === 'A_4') {
            return <span className="badge badge-warning">{t('Independent/Consultant')}</span>;
          }

          return <span />;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.TYPE}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.ABUSE,
        name: t('Abuse'),
        width: 60,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { abuse } = props.rowData;
          let color = 'success';
          if (abuse > 0) {
            color = 'warning';
          }
          if (abuse > 5) {
            color = 'danger';
          }

          return (
            <span
              className={`badge badge-${color}`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.props.showModal({
                  modalType: 'SalesOrganizationAbuseLog',
                  modalTheme: 'light',
                  modalProps: {
                    organizationId: props.rowData.organization.id,
                  },
                });
              }}
            >
              {abuse}
            </span>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.ABUSE}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.REQUIRED_KEYWORDS,
        name: t('R.K.'),
        width: 60,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { keywordsSize } = props.rowData.organizationSettings;
          return <span>{keywordsSize}</span>;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            tooltip={t(
              'Amount of requested keywords selected by user when they created the account.',
            )}
            sortField={ColumnIDs.REQUIRED_KEYWORDS}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.EMPLOYEES,
        name: t('Employees'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { companySize } = props.rowData.organizationSettings;

          if (companySize === 'A_1') {
            return <span>{t('1')}</span>;
          } else if (companySize === 'A_2') {
            return <span>{t('2 to 15')}</span>;
          } else if (companySize === 'A_3') {
            return <span>{t('16 to 50')}</span>;
          } else if (companySize === 'A_4') {
            return <span>{t('51 to 200')}</span>;
          } else if (companySize === 'A_5') {
            return <span>{t('201 to 1,000')}</span>;
          } else if (companySize === 'A_6') {
            return <span>{t('1,000 or more')}</span>;
          }

          return <span>{t('n/a')}</span>;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.EMPLOYEES}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.ORIGIN,
        name: t('Origin'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { affiliateVisitor } = props.rowData;
          return (
            <span>{affiliateVisitor && affiliateVisitor.origin && affiliateVisitor.origin}</span>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.ORIGIN}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.PLAN_DAYS_LEFT,
        name: t('Days left'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { latestPlan } = props.rowData;
          if (latestPlan) {
            return <span>{moment(new Date(latestPlan.endDate)).fromNow()}</span>;
          }
          return <span>{t('n/a')}</span>;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.PLAN_DAYS_LEFT}
            tableName={tableName}
            tooltip={t('The time left on the customers plan.')}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.DOMAINS,
        name: t('Domains'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { domains } = props.rowData;
          return (
            <span
              style={{ cursor: 'pointer', 'text-decoration': 'underline' }}
              onClick={() => {
                this.props.showModal({
                  modalType: 'SalesOrganizationDomains',
                  modalTheme: 'light',
                  modalProps: {
                    organizationId: props.rowData.organization.id,
                  },
                });
              }}
            >
              {domains}
            </span>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.DOMAINS}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.KEYWORDS,
        name: t('Keywords'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { keywords } = props.rowData;
          const { latestPlan } = props.rowData;
          return (
            <span
              style={{ cursor: 'pointer', 'text-decoration': 'underline' }}
              onClick={() => {
                this.props.showModal({
                  modalType: 'SalesOrganizationDomains',
                  modalTheme: 'light',
                  modalProps: {
                    organizationId: props.rowData.organization.id,
                  },
                });
              }}
            >
              {keywords}/{latestPlan ? latestPlan.maxKeywords : 'n/a'}
            </span>
          );
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.KEYWORDS}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.IN_DIALOGUE,
        name: t('In Dialogue'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { inDialog } = props.rowData;
          return <input type="checkbox" checked={inDialog} />;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.IN_DIALOGUE}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.STATUS,
        name: t('Status'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => {
          const { status } = props.rowData;
          if (status === t('No plan info') || status === t('Expired paid plan')) {
            return <span className="badge badge-danger">{status}</span>;
          } else if (status === t('Active trial')) {
            return <span className="badge badge-primary">{status}</span>;
          } else if (status === t('Active paid plan')) {
            return <span className="badge badge-success">{status}</span>;
          } else if (status === t('Expired trial')) {
            return <span className="badge badge-warning">{status}</span>;
          }
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.STATUS}
            tableName={tableName}
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
      {
        id: ColumnIDs.ACTIONS,
        name: t('Actions'),
        width: 200,
        cellRenderer: (props: CellRendererParams) => {
          const { organization } = props.rowData;
          const { latestPlan } = props.rowData;

          let actions = [
            {
              onSelect: () => {
                redirectToExternalUrl('/app/sales/plans/create');
              },
              label: t('Create Offer'),
              icon: CreateOfferIcon,
            },
          ];

          if (latestPlan) {
            const isActive = latestPlan ? new Date(latestPlan.endDate) >= new Date() : false;

            if (isActive && organization.active && !organization.accountLocked) {
              actions.push({
                onSelect: () => {
                  this.props.showModal({
                    modalType: 'SalesLockOrganization',
                    modalTheme: 'light',
                    modalProps: {
                      organizationId: organization.id,
                    },
                  });
                },
                label: t('Lock Account'),
                icon: LockAccountIcon,
              });
            }

            actions.push({
              onSelect: () => {
                this.props.showModal({
                  modalType: 'SalesOrganizationPlan',
                  modalTheme: 'light',
                  modalProps: {
                    planId: latestPlan.id,
                  },
                });
              },
              label: t('Edit Plan'),
              icon: EditPlanIcon,
            });

            if (latestPlan.isTrial) {
              actions.push({
                onSelect: () => {
                  this.props.showModal({
                    modalType: 'SalesExtendForm',
                    modalTheme: 'light',
                    modalProps: {
                      organizationId: organization.id,
                    },
                  });
                },
                label: t('Extend Trial'),
                icon: ExtendPlanIcon,
              });
            }
          }

          return <ActionsCell shouldUpdateIndicator={props.rowData} actions={actions} />;
        },
        headerRenderer: (props: HeaderRendererParams) => (
          <HeaderCell
            id={props.id}
            label={props.label}
            sortField={ColumnIDs.ACTIONS}
            tableName={tableName}
            hideLabel
            scrollXContainer={props.scrollXContainer}
          />
        ),
      },
    ];
  };

  resetTable = () => {
    console.log('resetTable');
    this.setState({
      resetIndicator: uniqueId(),
    });
  };

  queryDataFormatter = ({ adminSalesDashboard: { organizations } }) => {
    const organizationsWithIds = organizations.map(e => {
      // Active Trial, Expired Trial, Purchased, Abuse
      const { latestPlan, affiliateVisitor } = e;

      function getStatus() {
        const isActive = latestPlan ? new Date(latestPlan.endDate) >= new Date() : false;

        if (!latestPlan) {
          return t('No plan info');
        }

        if (isActive) {
          if (latestPlan.isTrial) {
            return t('Active trial');
          }

          return t('Active paid plan');
        }

        if (latestPlan.isTrial) {
          return t('Expired trial');
        }

        return t('Expired paid plan');
      }

      let className = '';

      if (e.organization.accountBlocked) {
        className += ' account-blocked';
      } else if (e.subAccount) {
        className += ' sub-account';
      }

      return {
        ...e,
        id: e.organization.id,
        status: getStatus(),
        className: className,
      };
    });
    const filteredData = this.props.prepareData(organizationsWithIds);
    return {
      list: filteredData,
      numResults: filteredData.length,
    };
  };

  render() {
    const { onUpdate } = this.props;
    const { resetIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.SALES_DASHBOARD}
        tableName={tableName}
        defaultSortField={ColumnIDs.CREATED_AT}
        itemsName={t('organizations')}
        defaultColumns={this.defaultColumns}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        minRowHeight={defaultRowHeight}
        defaultRowHeight={defaultRowHeight}
        resetIndicator={resetIndicator}
        onUpdate={onUpdate}
      />
    );
  }
}

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);
const mapStateToProps = state => {
  return {
    user: state.user,
    filters: state.filter.filterGroup.filters,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
  offlineFilter({
    tableName,
    skip: ['compare_to', 'period'],
    mappings: {
      [ColumnIDs.CREATED_AT]: 'organization.dateAdded',
      [ColumnIDs.SALES_MANAGER]: 'organization.salesManager.id',
      [ColumnIDs.ORGANIZATION]: 'organization.name',
      [ColumnIDs.COUNTRY]: 'organization.country.id',
      [ColumnIDs.TYPE]: 'organizationSettings.companyType',
      [ColumnIDs.ABUSE]: 'abuse',
      [ColumnIDs.REQUIRED_KEYWORDS]: 'organizationSettings.keywordsSize',
      [ColumnIDs.EMPLOYEES]: 'organizationSettings.companySize',
      [ColumnIDs.ORIGIN]: 'affiliateVisitor.origin',
      [ColumnIDs.PLAN_DAYS_LEFT]: 'latestPlan.endDate',
      [ColumnIDs.DOMAINS]: 'domains',
      [ColumnIDs.KEYWORDS]: 'keywords',
      [ColumnIDs.STATUS]: 'status',
      [ColumnIDs.IN_DIALOGUE]: 'inDialog',
    },
    withoutPagination: true,
  }),
)(withApollo(SalesDashboardInfiniteTable, { withRef: true }));
