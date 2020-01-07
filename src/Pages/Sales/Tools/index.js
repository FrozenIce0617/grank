// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

// actions
import { showModal } from 'Actions/ModalAction';

// components
import * as Actions from 'Pages/Layout/ActionsMenu/Actions/index';
import ActionsMenu, { SALES_TOOLS } from 'Pages/Layout/ActionsMenu/index';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate/index';

// utils
import { t } from 'Utilities/i18n/index';

type Props = {
  // automatic
  showModal: Function,
};

class SalesTools extends Component<Props, State> {
  handleMoveDomain = () => {
    this.props.showModal({
      modalType: 'MoveDomain',
    });
  };

  handleExportAdTracking = () => {
    this.props.showModal({
      modalType: 'ExportAdTracking',
    });
  };

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_TOOLS}>
          <Actions.NormalAction label={t('Move domain')} onClick={this.handleMoveDomain} />
          <Actions.NormalAction
            label={t('Export Ad Tracking')}
            onClick={this.handleExportAdTracking}
          />
        </ActionsMenu>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(SalesTools);
