// @flow
import React, { Component } from 'react';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { SALES_DASHBOARD } from 'Pages/Layout/ActionsMenu';

import SalesDashboardInfiniteTable from 'Components/InfiniteTable/Tables/SalesDashboardInfiniteTable';
import Switch from 'Components/Switch';
import { t } from 'Utilities/i18n/index';
import { connect } from 'react-redux';

type State = {
  salesManagerId: number,
  isLoading: boolean,
};

class SalesDashboard extends Component<Props, State> {
  state = {
    salesManagerId: this.props.user.salesManager.id,
    isLoading: false,
  };

  renderActionButtons = () => {
    const { salesManagerId, isLoading } = this.state;
    const { user } = this.props;
    return [
      <Switch
        key="customerType"
        disabled={isLoading}
        onClick={el => this.setState({ salesManagerId: el.id })}
        width={240}
        els={[
          { id: null, name: t('All'), active: salesManagerId === null },
          {
            id: user.salesManager.id,
            name: t('Yours'),
            active: salesManagerId === user.salesManager.id,
          },
        ]}
      />,
    ];
  };

  render() {
    const { salesManagerId } = this.state;

    return (
      <DashboardTemplate showSegments={false} showFilters={false}>
        <ActionsMenu menuFor={SALES_DASHBOARD} onlyPeriodFilter>
          {this.renderActionButtons()}
        </ActionsMenu>
        <div className="sales-dashboard content-container">
          <div className="table-container">
            <SalesDashboardInfiniteTable salesManagerId={salesManagerId} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(SalesDashboard);
