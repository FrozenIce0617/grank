// @flow
import React, { Component } from 'react';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { SALES_MAILS } from 'Pages/Layout/ActionsMenu';

import SalesMailsInfiniteTable from 'Components/InfiniteTable/Tables/SalesMailsInfiniteTable';

class SalesMails extends Component<Props, State> {
  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_MAILS} />
        <div className="sales-mails content-container">
          <div className="table-container">
            <SalesMailsInfiniteTable />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default SalesMails;
