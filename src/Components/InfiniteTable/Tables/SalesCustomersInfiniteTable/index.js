// @flow
import React, { Component, Fragment } from 'react';
import { compose, withApollo, graphql, Mutation } from 'react-apollo';
import { Link } from 'react-router-dom';
import type { CellRendererParams } from 'react-virtualized';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { uniqueId, debounce } from 'lodash';

import InfiniteTable from 'Components/InfiniteTable';
import { offlineFilter } from 'Components/HOC';

import { t } from 'Utilities/i18n/index';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { formatDate } from 'Utilities/format';
import { showModal } from 'Actions/ModalAction';
import PromiseMemorizer from 'Utilities/PromiseMemorizer';

import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';

import './sales-customers.scss';
import { doAnyway } from '../../../../Utilities/promise';

export const ColumnIDs = {
  ID: 'id',
  DATE_ADDED: 'dateAdded',
  NAME: 'name',
  SALES_MANAGER: 'salesManager.user.email',
  CHURN_DATE: 'churn_date',
  CHURN_MRR: 'churn_mrr',
  TRIAL_ENDED: 'trial_ended',
  BILLING_RETRY_DATE: 'billing_retry_date',
  FAILED_PAYMENTS: 'failed_payments',
  CONTRACTION_DATE: 'contraction_date',
};

type Props = {
  searchTerm: string,
  customerType: string,
  filter: boolean | string,
  adminSalesManagersData: Object,
  onLoading: Function,

  // Automatic
  client: Object,
  history: Object,
  filters: any,
  user: Object,
  showModal: Function,
};

type State = {
  resetIndicator: number,
  silentUpdateIndicator: number,
};

const tableName = TableIDs.SALES_CUSTOMERS;

const ADMIN_ORGANIZATIONS = gql`
  query salesCustomersInfiniteTable_adminOrganizations(
    $salesManagerId: ID
    $getAssigned: Boolean
    $dataType: String
  ) {
    adminOrganizations(
      salesManagerId: $salesManagerId
      getAssigned: $getAssigned
      dataType: $dataType
    ) {
      id
      name
      dateAdded
      active
      salesManager {
        id
        name
        user {
          email
        }
      }
      additionalData
    }
  }
`;

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

class SalesCustomersInfiniteTable extends Component<Props, State> {
  _table: any;
  _subHandler: SubscriptionHandle;
  _customersMemorizer = new PromiseMemorizer();

  state = {
    resetIndicator: 0,
    silentUpdateIndicator: 0,
  };

  static defaultProps: {
    filter: '',
  };

  resetTable = keepMemorizer => {
    !keepMemorizer && this._customersMemorizer.clear();
    return this.setState({ resetIndicator: uniqueId() });
  };
  updateTable = () => {
    this._customersMemorizer.clear();
    return this.setState({ silentUpdateIndicator: uniqueId() });
  };

  UNSAFE_componentWillMount() {
    this._subHandler = subscribeToDomain(debounce(() => this.updateTable(), 1000));
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.customerType !== this.props.customerType ||
      nextProps.filter !== this.props.filter
    ) {
      this.resetTable();
    }

    if (nextProps.searchTerm !== this.props.searchTerm) {
      debounce(() => this.resetTable(true), 300)();
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();
  }

  getQuery = ({ startIndex, stopIndex, sortOrder, sortField, customColumns }) => {
    const { customerType, user, filter, onLoading } = this.props;
    if (!this._customersMemorizer.result) {
      onLoading(true);
    }

    return this._customersMemorizer
      .wrap(() =>
        this.props.client.query({
          query: ADMIN_ORGANIZATIONS,
          variables: {
            salesManagerId: customerType === 'yours' ? user.salesManager.id : undefined,
            getAssigned: customerType === 'assigned' ? true : undefined,
            dataType: filter,
          },
          fetchPolicy: 'network-only',
        }),
      )
      .then(
        ...doAnyway(result => {
          onLoading(false);
          return result;
        }),
      );
  };

  renderSM = ({ val, orgId, setSalesManager }) => (
    <span>
      {val}
      <span
        className="sales-customers-unassign"
        onClick={() =>
          setSalesManager({
            variables: {
              input: {
                organizationId: orgId,
                salesManagerId: 0,
              },
            },
          })
        }
      >
        ×
      </span>
    </span>
  );

  getColumns = () => {
    const { user } = this.props;
    const managers = this.props.adminSalesManagersData.adminSalesManagers;

    return [
      {
        id: ColumnIDs.DATE_ADDED,
        name: t('Signed up'),
        width: 120,
        cellRenderer: (props: CellRendererParams) => formatDate(props.rowData.dateAdded),
        disableSort: true,
      },
      {
        id: ColumnIDs.TRIAL_ENDED,
        name: t('Trial ended'),
        className: 'infinite-table-column-grey',
        width: 120,
        cellRenderer: (props: CellRendererParams) =>
          formatDate(JSON.parse(props.rowData.additionalData)[ColumnIDs.TRIAL_ENDED]),
      },
      {
        id: ColumnIDs.CONTRACTION_DATE,
        name: t('Contraction date'),
        className: 'infinite-table-column-grey',
        width: 140,
        cellRenderer: (props: CellRendererParams) =>
          formatDate(JSON.parse(props.rowData.additionalData)[ColumnIDs.CONTRACTION_DATE]),
      },
      {
        id: ColumnIDs.ID,
        name: t('ID'),
        width: 100,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => (
          <Link to={`/sales/organization/${props.rowData.id}`}>{props.rowData.id}</Link>
        ),
      },
      {
        id: ColumnIDs.NAME,
        name: t('Name'),
        width: 300,
        responsive: true,
      },
      {
        id: ColumnIDs.CHURN_DATE,
        name: t('Churn date'),
        className: 'infinite-table-column-grey',
        width: 120,
        cellRenderer: (props: CellRendererParams) =>
          formatDate(JSON.parse(props.rowData.additionalData)[ColumnIDs.CHURN_DATE]),
      },
      {
        id: ColumnIDs.CHURN_MRR,
        name: t('Churn MRR'),
        className: 'infinite-table-column-grey',
        width: 120,
        cellRenderer: (props: CellRendererParams) =>
          JSON.parse(props.rowData.additionalData)[ColumnIDs.CHURN_MRR],
      },
      {
        id: ColumnIDs.BILLING_RETRY_DATE,
        name: t('Billing retry date'),
        className: 'infinite-table-column-grey',
        width: 140,
        cellRenderer: (props: CellRendererParams) =>
          formatDate(JSON.parse(props.rowData.additionalData)[ColumnIDs.BILLING_RETRY_DATE]),
      },
      {
        id: ColumnIDs.FAILED_PAYMENTS,
        name: t('Failed payments'),
        className: 'infinite-table-column-grey',
        width: 140,
        cellRenderer: (props: CellRendererParams) =>
          JSON.parse(props.rowData.additionalData)[ColumnIDs.FAILED_PAYMENTS],
      },
      {
        id: ColumnIDs.SALES_MANAGER,
        name: t('Sales Manager'),
        width: 400,
        responsive: true,
        cellRenderer: (props: CellRendererParams) => (
          <Mutation mutation={SET_SALES_MANAGER}>
            {(setSalesManager, { data }) => {
              const sm = props.rowData.salesManager;

              return (
                <div>
                  {this.props.customerType !== 'unassigned' && sm && !data ? (
                    sm.user ? (
                      this.renderSM({
                        val: sm.user.email,
                        orgId: props.rowData.id,
                        setSalesManager: setSalesManager,
                      })
                    ) : (
                      this.renderSM({
                        val: `${sm.name} (no e-mail)`,
                        orgId: props.rowData.id,
                        setSalesManager: setSalesManager,
                      })
                    )
                  ) : data && data.setSalesManager.organization.salesManager ? (
                    this.renderSM({
                      val: data.setSalesManager.organization.salesManager.user.email,
                      orgId: props.rowData.id,
                      setSalesManager: setSalesManager,
                    })
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

                  {/* CFOs can (re)assign customers to other sales managers */}
                  {user.isCfo && (
                    <Fragment>
                      <span style={{ padding: '0 8px' }}> | </span>
                      {managers && managers.length ? (
                        <select
                          className="infinite-table-select"
                          defaultValue="x"
                          onChange={e =>
                            setSalesManager({
                              variables: {
                                input: {
                                  organizationId: props.rowData.id,
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
                    </Fragment>
                  )}
                </div>
              );
            }}
          </Mutation>
        ),
      },
    ];
  };

  defaultColumns = () => {
    const { filter } = this.props;
    let cols = [ColumnIDs.ID, ColumnIDs.DATE_ADDED, ColumnIDs.NAME, ColumnIDs.SALES_MANAGER];
    if (filter === 'churned') cols.push(ColumnIDs.CHURN_DATE, ColumnIDs.CHURN_MRR);
    if (filter === 'trial_ended') cols.push(ColumnIDs.TRIAL_ENDED);
    if (filter === 'failed_payments')
      cols.push(ColumnIDs.BILLING_RETRY_DATE, ColumnIDs.FAILED_PAYMENTS);
    if (filter === 'contraction') cols.push(ColumnIDs.CONTRACTION_DATE);
    return cols;
  };

  queryDataFormatter = ({ adminOrganizations }) => {
    const st = this.props.searchTerm.toLowerCase();
    const filteredClients = this.props.prepareData(
      adminOrganizations.filter(
        el =>
          el.dateAdded.toLowerCase().indexOf(st) !== -1 || el.name.toLowerCase().indexOf(st) !== -1,
      ),
    );

    return {
      list: filteredClients,
      numResults: filteredClients.length,
    };
  };

  render() {
    const { resetIndicator, silentUpdateIndicator } = this.state;

    return (
      <InfiniteTable
        stickyId={StickyIDs.containers.SALES_CUSTOMERS}
        tableName={tableName}
        itemsName={t('new customers')}
        ref={ref => (this._table = ref)}
        defaultColumns={this.defaultColumns()}
        columns={this.getColumns()}
        query={this.getQuery}
        queryDataFormatter={this.queryDataFormatter}
        resetIndicator={resetIndicator}
        silentUpdateIndicator={silentUpdateIndicator}
      />
    );
  }
}

const adminSalesManagers = gql`
  query adminSalesManagers {
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

// Apollo is stupid: https://github.com/apollographql/react-apollo/issues/907
export default compose(
  connect(
    mapStateToProps,
    { showModal },
    null,
    { withRef: true },
  ),
  offlineFilter({
    tableName,
    withoutPagination: true,
  }),
  graphql(adminSalesManagers, { name: 'adminSalesManagersData' }),
)(withApollo(SalesCustomersInfiniteTable, { withRef: true }));
