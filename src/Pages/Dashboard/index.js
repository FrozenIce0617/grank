// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import DashboardInfiniteTable from 'Components/InfiniteTable/Tables/DashboardInfiniteTable';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';

import { t } from 'Utilities/i18n';

type Props = {
  showModal: Function,
};

class Dashboard extends Component<Props> {
  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddDomain',
      modalTheme: 'light',
    });
  };

  render() {
    return (
      <DashboardTemplate showFilters>
        <ActionsMenu menuFor="dashboard">
          <Actions.AddAction key="add" label={t('Add domain')} onClick={this.handleAddAction} />
        </ActionsMenu>
        <div className="dashboard-table content-container">
          <div className="table-container">
            <DashboardInfiniteTable />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => ({
  isBasic:
    !state.user.organization.activePlan.featureAdvancedMetrics &&
    !state.user.organization.activePlan.isTrial,
});

export default connect(
  mapStateToProps,
  { showModal },
)(Dashboard);
