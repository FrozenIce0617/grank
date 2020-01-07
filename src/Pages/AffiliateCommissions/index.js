// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import AffiliateCommissionsInfiniteTable from 'Components/InfiniteTable/Tables/AffiliateCommissionsInfiniteTable';
import ActionsMenu, { AFFILIATE_COMMISSIONS } from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
};

class AffiliateCommissions extends Component<Props> {
  handleUpdate = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <DashboardTemplate showSegments={false}>
        <ActionsMenu menuFor={AFFILIATE_COMMISSIONS} onlyPeriodFilter />
        <div className="affiliate-visitors-table content-container">
          <div className="table-container">
            <AffiliateCommissionsInfiniteTable onUpdate={this.handleUpdate} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(AffiliateCommissions);
