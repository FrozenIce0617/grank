// @flow
import React, { Component } from 'react';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { SALES_AFFILIATE_DASHBOARD } from 'Pages/Layout/ActionsMenu';

import SalesAffiliateDashboardInfiniteTable from 'Components/InfiniteTable/Tables/SalesAffiliateDashboardInfiniteTable';

class SalesAffiliateDashboard extends Component<{}> {
  render() {
    return (
      <DashboardTemplate showSegments={false} showFilters={false}>
        <ActionsMenu menuFor={SALES_AFFILIATE_DASHBOARD} onlyPeriodFilter />
        <div className="sales-affiliate-dashboard content-container">
          <div className="table-container">
            <SalesAffiliateDashboardInfiniteTable />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default SalesAffiliateDashboard;
