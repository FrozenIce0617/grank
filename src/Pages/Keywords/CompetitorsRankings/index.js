// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import ActionsMenu, { KEYWORDS_COMPETITORS_RANKINGS } from 'Pages/Layout/ActionsMenu';
import CompetitorsRanksInfiniteTable from 'Components/InfiniteTable/Tables/CompetitorsRanksInfiniteTable';

import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';

import { showModal } from 'Actions/ModalAction';
import queryDomainInfo from 'Pages/queryDomainInfo';

import type { DomainInfo } from 'Pages/queryDomainInfo';
import { FilterAttribute } from 'Types/Filter';

import './keywords-competitors-rankings.scss';

type Props = {
  domainId: ?string,
  domainInfo: DomainInfo,
  showModal: Function,
  refetchDomainInfo: () => void,
};

class KeywordsCompetitorsRankings extends Component<Props> {
  handleReportAction = () => {
    this.props.showModal({
      modalType: 'CompetitorsRanksReport',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
      },
    });
  };

  renderActionButtons = () => [
    <Actions.ReportAction key="report" onClick={this.handleReportAction} />,
    <Actions.UpgradeAction key="upgradePlan" alignRight={true} />,
  ];

  handleUpdate = () => {
    this.forceUpdate();
  };

  render() {
    const { domainId, domainInfo } = this.props;
    return (
      <DashboardTemplate>
        <ActionsMenu
          menuFor={KEYWORDS_COMPETITORS_RANKINGS}
          domainId={domainId}
          domainInfo={domainInfo}
        >
          {this.renderActionButtons()}
        </ActionsMenu>
        <div className="keywords-competitors-rankings content-container">
          <div className="table-container">
            <CompetitorsRanksInfiniteTable onUpdate={this.handleUpdate} />
          </div>
        </div>
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
)(KeywordsCompetitorsRankings);
