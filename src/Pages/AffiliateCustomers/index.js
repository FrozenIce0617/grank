// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import AffiliateCustomersInfiniteTable from 'Components/InfiniteTable/Tables/AffiliateCustomersInfiniteTable';
import ActionsMenu, { AFFILIATE_CUSTOMERS } from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
};

class AffiliateCustomers extends Component<Props> {
  render() {
    return (
      <DashboardTemplate showSegments={false}>
        <ActionsMenu menuFor={AFFILIATE_CUSTOMERS} onlyPeriodFilter />
        <div className="affiliate-customers-table content-container">
          <div className="table-container">
            <AffiliateCustomersInfiniteTable />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(AffiliateCustomers);
