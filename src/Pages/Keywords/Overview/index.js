// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo/index';

// Components
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import AdvancedPlanUpsellChart from 'Components/AdvancedPlanUpsellChart';
import Overlay from 'Components/Overlay';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import ShareOfVoice from './ShareOfVoice';
import SearchTypeSwitch from './SearchTypeSwitch';
import RankingDistribution from './RankingDistribution';
import WinnersAndLosers from './WinnersAndLosers';
import AverageRank from './AverageRank';
import OrganicAnalytics from './OrganicAnalytics';
import GoogleAnalytics from './GoogleAnalytics';
import UnknownCompetitors from './UnknownCompetitors';
import Notifications from './Notifications';

// Utilities
import { updateScrollTarget, resetScrollTarget } from 'Actions/ScrollAction';
import scrollToComponent from 'react-scroll-to-component';
import cn from 'classnames';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { debounce, every } from 'lodash';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import { showModal } from 'Actions/ModalAction';
import { FilterAttribute } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { tct, t } from 'Utilities/i18n/index';
import { Link } from 'react-router-dom';

import './keywords-overview.scss';

type Props = {
  domainId?: string,
  showModal: Function,
  domainInfo?: DomainInfo,
  notes: Object,
  refetchDomainInfo: () => void,
  scrollTarget: string,
  updateScrollTarget: Function,
  resetScrollTarget: Function,
  overviewPage: Object,
  featureAdvancedMetrics: boolean,
  isTrial: boolean,
};

type State = {
  isPageLoaded: boolean,
  superCellCollapsed: boolean,
};

class KeywordsOverview extends Component<Props, State> {
  _subHandler: SubscriptionHandle;
  notificationsRef = React.createRef();

  state = {
    isPageLoaded: false,
    superCellCollapsed: true,
  };

  componentDidMount() {
    this._subHandler = subscribeToDomain(debounce(this.handleRefresh, 1000));
  }

  componentDidUpdate(prevProps) {
    if (!this.state.isPageLoaded && prevProps.overviewPage !== this.props.overviewPage) {
      const isPageLoaded = every(this.props.overviewPage, ({ loaded }) => loaded);
      console.log(isPageLoaded);
      if (isPageLoaded) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ isPageLoaded });

        if (this.props.scrollTarget === 'notifications') {
          this.props.resetScrollTarget();
          scrollToComponent(this.notificationsRef.current, {
            offset: 0,
            align: 'top',
            duration: 300,
            ease: 'linear',
          });
        }
      }
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();
  }

  renderActionButtons() {
    const { domainInfo } = this.props;
    const actions = [];

    // only show if we don't have multiple domains
    if (domainInfo) {
      const { isGAConnected, isGCConnected, isAdobeMarketingConnected } = domainInfo;

      actions.push(
        <Actions.AddAction key="add" label={t('Add keywords')} onClick={this.handleAddAction} />,
        !isGAConnected &&
          !isAdobeMarketingConnected && (
            <Actions.ConnectToAnalyticsAction
              key="addAnalytics"
              onClick={this.handleConnectToAnalytics}
            />
          ),
        !isGCConnected && (
          <Actions.ConnectToGSCAction key="addGSC" onClick={this.handleConnectToGSC} />
        ),
        <Actions.EditDomainAction key="editDomain" onClick={this.handleEditDomain} />,
        <Actions.UpgradeAction key="upgrade" alignRight={true} />,
      );
    }
    actions.push(<SearchTypeSwitch key="searchTypeSwitch" />);
    return actions;
  }

  handleRefresh = () => {
    this.props.refetchDomainInfo && this.props.refetchDomainInfo();
  };

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        refresh: this.resetTable,
      },
    });
  };

  handleConnectToAnalytics = () => {
    this.props.showModal({
      modalType: 'ConnectToAnalytics',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainInfo && this.props.domainId,
        refresh: this.handleRefresh,
      },
    });
  };

  handleConnectToGSC = () => {
    this.props.showModal({
      modalType: 'ConnectToGSC',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainInfo && this.props.domainInfo.id,
        refresh: this.handleRefresh,
      },
    });
  };

  handleEditDomain = () => {
    this.props.showModal({
      modalType: 'EditDomain',
      modalProps: {
        theme: 'light',
        domainId: this.props.domainInfo && this.props.domainInfo.id,
        refresh: this.handleRefresh,
      },
    });
  };

  handleNotesSelect = notes => {
    console.log(notes);
    if (notes.length === 1) {
      this.props.showModal({
        modalType: 'EditNote',
        modalProps: {
          theme: 'light',
          noteId: notes[0].id,
        },
      });
    } else {
      this.props.showModal({
        modalType: 'EditNotes',
        modalProps: {
          theme: 'light',
          notes,
        },
      });
    }
  };

  handleSuperCellCollapse = () => {
    this.setState({
      superCellCollapsed: !this.state.superCellCollapsed,
    });
  };

  renderUnknownCompetitors() {
    const { domainInfo } = this.props;
    const { superCellCollapsed } = this.state;

    if (domainInfo) {
      const { featureAdvancedMetrics, isTrial } = this.props;
      const showFake = !featureAdvancedMetrics;
      return (
        <Overlay
          className="unknown-competitors"
          contentClassName="flex-row"
          isEnabled={showFake}
          isUpgradable={isTrial}
          collapsed={superCellCollapsed}
          onTop={
            <AdvancedPlanUpsellChart
              collapsed={superCellCollapsed}
              subSubTitle={tct(
                'This feature is available in [link1:Professional], [link2:Expert] and [link3:Enterprise] plans.',
                {
                  link1: <Link to={'/billing/package/select'} />,
                  link2: <Link to={'/billing/package/select'} />,
                  link3: <Link to={'/billing/package/select'} />,
                },
              )}
              onCollapse={this.handleSuperCellCollapse}
            />
          }
        >
          <div className="flex-cell">
            <UnknownCompetitors showFake={showFake} />
          </div>
        </Overlay>
      );
    }
  }

  renderContent() {
    const { domainInfo, domainId, notes } = this.props;
    const { isGAConnected, isAdobeMarketingConnected } = domainInfo || {};
    const analyticsConnected = isGAConnected || isAdobeMarketingConnected;
    return (
      <div className="keywords-overview content-container multi">
        {domainInfo &&
          domainInfo.canUpdate === false && (
            <p className="alert alert-warning">
              {t(
                'This is a demo domain, you can therefore not edit or add any keywords. To add keywords add your own domain on the Dashboard.',
              )}
            </p>
          )}
        <div className="content-row sov-avgrank-row">
          <ShareOfVoice
            className={cn({ 'share-of-voice-without-pro': !this.props.domainInfo })}
            notes={notes}
            domain={domainInfo ? domainInfo.domain : ''}
            onNotesSelect={this.handleNotesSelect}
            showPercentage={domainInfo ? domainInfo.shareOfVoicePercentage : false}
          />
          <AverageRank notes={notes} onNotesSelect={this.handleNotesSelect} />
        </div>
        <div className="content-row">
          <RankingDistribution notes={notes} onNotesSelect={this.handleNotesSelect} />
          <WinnersAndLosers domainId={domainId} />
        </div>
        <div className="content-row">{this.renderUnknownCompetitors()}</div>
        {analyticsConnected && <GoogleAnalytics />}
        {analyticsConnected && (
          <OrganicAnalytics notes={notes} onNotesSelect={this.handleNotesSelect} />
        )}
        <div ref={this.notificationsRef}>
          <Notifications domainId={this.props.domainId} />
        </div>
      </div>
    );
  }

  render() {
    const { domainInfo } = this.props;
    return (
      <DashboardTemplate>
        <ActionsMenu menuFor="keywords_overview" domainInfo={domainInfo}>
          {this.renderActionButtons()}
        </ActionsMenu>
        {this.renderContent()}
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
    overviewPage: state.overviewPage,
    featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
    isTrial: state.user.organization.activePlan.isTrial,
    scrollTarget: state.scrollToElement.scrollTarget,
  };
};

const notesQuery = gql`
  query overview_keywordsNotes(
    $filters: [FilterInput]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      overview {
        notes {
          id
          createdAt
          user {
            id
            fullName
          }
          note
        }
      }
    }
  }
`;

export default compose(
  connect(
    mapStateToProps,
    {
      showModal,
      updateScrollTarget,
      resetScrollTarget,
    },
  ),
  graphql(notesQuery, {
    options: props => {
      const { filters } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          fakePagination: {
            page: 1,
            results: 5,
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
        },
      };
    },
    props: ({ ownProps, data: { keywords, loading, error } }) => ({
      ...ownProps,
      notes: !(loading || error) && keywords && keywords.overview ? keywords.overview.notes : [],
    }),
  }),
  queryDomainInfo(),
)(KeywordsOverview);
