// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import AffiliatePaymentsInfiniteTable from 'Components/InfiniteTable/Tables/AffiliatePaymentsInfiniteTable';
import ActionsMenu, { AFFILIATE_PAYMENTS } from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
};

class AffiliatePayments extends Component<Props> {
  handleUpdate = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <DashboardTemplate showSegments={false}>
        <ActionsMenu menuFor={AFFILIATE_PAYMENTS} onlyPeriodFilter />
        <div className="affiliate-visitors-table content-container">
          <div className="table-container">
            <AffiliatePaymentsInfiniteTable onUpdate={this.handleUpdate} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(AffiliatePayments);
