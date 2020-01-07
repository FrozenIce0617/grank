// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { withRouter } from 'react-router';
import TopNavbar from './TopNavbar';
import Menu from './Menu';
import Filters from 'Components/Filters';
import Footer from 'Pages/Layout/FooterEmpty';
import TrialBar from 'Components/TrialBar';
import FeedbackBar from 'Components/FeedbackBar';
import SideNavbar from 'Pages/Layout/SideNavbar';
import { showModal } from 'Actions/ModalAction';

import './dashboard-template.scss';

type Props = {
  showFilters: boolean,
  showSegments: boolean,
  message: React.Node,
  children: React.Node,
  showModal: Function,
  organization: Object,
  user: Object,
  match: Object,
  domainIds?: string[],
};

class DashboardTemplate extends Component<Props> {
  static defaultProps = {
    showFilters: true,
    showSegments: true,
  };

  render() {
    const { showFilters, organization, message, user, showSegments } = this.props;
    const { isTrial, endDate } = (organization && organization.activePlan) || {};
    let hasNextPlan = false;
    if (organization && organization.nextPlan) {
      hasNextPlan = true;
    }

    return (
      <div className="dashboard-template-container">
        <div className="dashboard-template">
          <div className="dashboard-side-navbar-container">
            <SideNavbar />
          </div>
          <div className="dashboard-template-content">
            <div className="navigation">
              <TrialBar isTrial={isTrial} endDate={endDate} hasNextPlan={hasNextPlan} />
              {!user.salesManager && <FeedbackBar question={user.unansweredFeedback} />}
              <TopNavbar showHubspot={isTrial} />
              <Menu />
            </div>
            {message && <div className="dashboard-message">{message}</div>}
            {showFilters && <Filters showSegments={showSegments} />}
            <div className="dashboard-template-main-content">{this.props.children}</div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);

  return {
    user: state.user,
    organization: state.user.organization,
    domainIds: domainFilter && domainFilter.value,
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    { showModal },
  )(DashboardTemplate),
);
