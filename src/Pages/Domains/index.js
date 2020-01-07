// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { DOMAINS } from 'Pages/Layout/ActionsMenu';
import DomainsInfiniteTable from 'Components/InfiniteTable/Tables/DomainsInfiniteTable';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { showModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';

import './domains.scss';

type Props = {
  showModal: Function,
};

class DomainsPage extends Component<Props> {
  _table: any;

  handleAddDomain = () => {
    this.props.showModal({
      modalType: 'AddDomain',
      modalTheme: 'light',
      modalProps: {
        refresh: () => {},
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
      <DashboardTemplate>
        <ActionsMenu menuFor={DOMAINS} hidePeriodFilter={true}>
          <Actions.AddAction key="add" label={t('Add domain')} onClick={this.handleAddDomain} />
        </ActionsMenu>
        <div className="domains-table content-container">
          <div className="table-container">
            <DomainsInfiniteTable onUpdate={this.handleUpdate} ref={this.setTableRef} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(DomainsPage);
