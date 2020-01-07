// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { Container } from 'reactstrap';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import { t } from 'Utilities/i18n';
import { showModal } from 'Actions/ModalAction';
import { connect } from 'react-redux';
import { FilterAttribute } from 'Types/Filter';
import NotesInfiniteTable from 'Components/InfiniteTable/Tables/NotesInfiniteTable';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import queryDomainInfo from 'Pages/queryDomainInfo';
import './keywords-notes.scss';

type Props = {
  showModal: Function,
  domainId: string,
};

class NotesList extends Component<Props> {
  _table: any;

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddNote',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        refresh: this.resetTable,
        enableAddingKeywords: true,
      },
    });
  };

  handleUpdate = () => {
    this.forceUpdate();
  };

  resetTable = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .resetTable();

  showTableSettings = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .showSettings();

  setTableRef = ref => {
    this._table = ref;
  };

  renderActionButtons = () => [
    <Actions.AddAction
      key="add-note-action"
      label={t('Add note')}
      onClick={this.handleAddAction}
    />,
    <Actions.SettingsAction key="settings" onClick={this.showTableSettings} />,
    <Actions.UpgradeAction key="upgrade-plan-action" alignRight={true} />,
  ];

  render() {
    const { domainId } = this.props;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="notes" domainId={domainId} hidePeriodFilter>
          {this.renderActionButtons()}
        </ActionsMenu>
        <Container fluid className="keywords-notes-wrapper content-container">
          <div className="table-container">
            <NotesInfiniteTable
              domainId={domainId}
              onUpdate={this.handleUpdate}
              ref={this.setTableRef}
            />
          </div>
        </Container>
      </DashboardTemplate>
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);

  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: state.filter.filterGroup.filters,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  queryDomainInfo(),
)(NotesList);
