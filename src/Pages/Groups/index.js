// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { GROUPS } from 'Pages/Layout/ActionsMenu';
import GroupsInfiniteTable from 'Components/InfiniteTable/Tables/GroupsInfiniteTable';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { showModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';

type Props = {
  showModal: Function,
};

class GroupsPage extends Component<Props> {
  _table: any;

  handleAddGroup = () => {
    this.props.showModal({
      modalType: 'AddGroup',
      modalTheme: 'light',
      modalProps: {
        refetch: () => {},
      },
    });
  };

  handleUpdate = () => {
    this.forceUpdate();
  };

  setTableRef = ref => {
    this._table = ref;
  };

  render() {
    return (
      <DashboardTemplate showFilters>
        <ActionsMenu menuFor={GROUPS} hidePeriodFilter={true}>
          <Actions.AddAction key="add" label={t('Add group')} onClick={this.handleAddGroup} />
        </ActionsMenu>
        <div className="groups-table content-container">
          <div className="table-container">
            <GroupsInfiniteTable onUpdate={this.handleUpdate} ref={this.setTableRef} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(GroupsPage);
