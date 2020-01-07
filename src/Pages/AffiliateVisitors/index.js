// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import AffiliateVisitorsInfiniteTable from 'Components/InfiniteTable/Tables/AffiliateVisitorsInfiniteTable';
import ActionsMenu, { AFFILIATE_VISITORS } from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
};

class AffiliateVisitors extends Component<Props> {
  handleUpdate = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <DashboardTemplate showSegments={false}>
        <ActionsMenu menuFor={AFFILIATE_VISITORS} onlyPeriodFilter />
        <div className="affiliate-visitors-table content-container">
          <div className="table-container">
            <AffiliateVisitorsInfiniteTable onUpdate={this.handleUpdate} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(AffiliateVisitors);
