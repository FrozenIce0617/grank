// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { SALES_CUSTOMERS } from 'Pages/Layout/ActionsMenu';

import SearchInput from 'Components/SearchInput';
import SalesCustomersInfiniteTable from 'Components/InfiniteTable/Tables/SalesCustomersInfiniteTable';
import Switch from 'Components/Switch';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList';
import { UpdateAction } from 'Pages/Layout/ActionsMenu/Actions';

import { t } from 'Utilities/i18n/index';

type Props = {
  adminOrganizationsData: Object,

  user: Object,
};

type State = {
  searchTerm: string,
  customerType: 'unassigned' | 'assigned' | 'yours',
  dropdown: boolean | string,
  filterVal: { value: string, label: string },
  isLoading: boolean,
};

const setDropdown = (curVal, newVal) => (curVal === newVal ? false : newVal);

class SalesCustomers extends Component<Props, State> {
  state = {
    searchTerm: '',
    customerType: 'unassigned',
    dropdown: false,
    filterVal: { value: '', label: 'All' },
    isLoading: false,
  };

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      searchTerm: event.currentTarget.value,
    });
  };

  handleLoading = isLoading => this.setState({ isLoading });

  renderActionButtons = () => {
    const { user: { isCfo } } = this.props; // prettier-ignore
    const { searchTerm, customerType, dropdown, filterVal, isLoading } = this.state;
    const els = [];
    els.push({ id: 'unassigned', name: t('Unassigned'), active: customerType === 'unassigned' });
    if (isCfo) {
      els.push({ id: 'assigned', name: t('Assigned'), active: customerType === 'assigned' });
    }
    els.push({ id: 'yours', name: t('Yours'), active: customerType === 'yours' });

    return [
      <SearchInput
        key="search-input"
        value={searchTerm}
        disabled={isLoading}
        onChange={this.handleChange}
        placeholder={t('Organization, Sales manager...')}
      />,
      <Dropdown
        key="selector-dropdown"
        isOpen={dropdown === 'filter'}
        toggle={() => this.setState({ dropdown: setDropdown(dropdown, 'filter') })}
        className={`simple-dropdown period-filter-dropdown`}
      >
        <DropdownToggle tag="div" disabled={isLoading} className="menu-toggle">
          <UpdateAction
            title="Filter"
            disabled={isLoading}
            label={filterVal.label}
            className="icn-settings"
          />
        </DropdownToggle>
        <DropdownMenu>
          <SimpleItemsList
            items={[
              { value: '', label: t('All') },
              { value: 'churned', label: t('Churned') },
              { value: 'trial_ended', label: t('Trial ended') },
              { value: 'failed_payments', label: t('Failed payments') },
              { value: 'contraction', label: t('Contraction') },
              { value: 'affiliate', label: t('Affiliates') },
            ]}
            item={filterVal}
            labelFunc={el => el.label}
            onSelect={el => {
              this.setState({ filterVal: el });
              // this.closeFilter();
            }}
          />
        </DropdownMenu>
      </Dropdown>,
      <Switch
        key="customerType"
        disabled={isLoading}
        width={isCfo ? 300 : 240}
        onClick={el => this.setState({ customerType: el.id })}
        els={els}
      />,
    ];
  };

  render() {
    const { searchTerm, customerType, filterVal } = this.state;

    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_CUSTOMERS}>{this.renderActionButtons()}</ActionsMenu>
        <Container className="generic-page sales-plans" fluid style={{ padding: '0px' }}>
          <div className="table-container">
            <SalesCustomersInfiniteTable
              searchTerm={searchTerm}
              onLoading={this.handleLoading}
              filter={filterVal.value}
              customerType={customerType}
            />
          </div>
        </Container>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => ({ user: state.user });

export default connect(mapStateToProps)(SalesCustomers);
