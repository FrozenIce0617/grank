// @flow
import React, { Component } from 'react';
import IconButton from 'Components/IconButton/index';
import NewIcon from 'icons/plus-rounded.svg?inline';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate/index';
import ActionsMenu, { SALES_PLANS } from 'Pages/Layout/ActionsMenu/index';
import { t } from 'Utilities/i18n/index';
import SearchInput from 'Components/SearchInput/index';
import SalesPlansInfiniteTable from 'Components/InfiniteTable/Tables/SalesPlansInfiniteTable/index';

type State = {
  searchTerm: string,
};

class SalesPlans extends Component<{}, State> {
  state = {
    searchTerm: '',
  };

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      searchTerm: event.currentTarget.value,
    });
  };

  render() {
    const { searchTerm } = this.state;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_PLANS}>
          <IconButton key="new" brand="orange" link="/sales/plans/create" icon={<NewIcon />}>
            {t('Create plan')}
          </IconButton>
          <SearchInput
            value={searchTerm}
            onChange={this.handleChange}
            placeholder={t('Name, ID, Comment...')}
          />
        </ActionsMenu>
        <div className="sales-plans-table content-container">
          <div className="table-container">
            <SalesPlansInfiniteTable searchTerm={searchTerm} />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default SalesPlans;
