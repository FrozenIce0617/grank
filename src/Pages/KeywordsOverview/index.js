// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { debounce, forOwn } from 'lodash';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { showModal } from 'Actions/ModalAction';
import { resetKeywordsTableState } from 'Actions/KeywordsTableActions';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ShareOfVoice from './ShareOfVoice';
import RankingDistribution from './RankingDistribution';
import GoogleAnalytics from './GoogleAnalytics';
import OrganicAnalytics from './OrganicAnalytics/index';
import Notifications from './Notifications';
import WinnersAndLosers from './WinnersAndLosers';
import ShareOfVoiceCompetitors from './ShareOfVoiceCompetitors';
import ShareOfVoiceLandingPages from './ShareOfVoiceLandingPages';
import ShareOfVoiceTags from './ShareOfVoiceTags';
import AverageRankChart from './AverageRankChart';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import { FilterAttribute } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { tct, t } from 'Utilities/i18n/index';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import AdvancedPlanUpsellChart from 'Components/AdvancedPlanUpsellChart';
import Overlay from 'Components/Overlay';
import cn from 'classnames';
import './keywords-overview.scss';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo/index';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import UnknownCompetitors from './UnknownCompetitors';
import { updateScrollTarget, resetScrollTarget } from 'Actions/ScrollAction';
import scrollToComponent from 'react-scroll-to-component';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import { linkToPageWithDomains } from 'Components/Filters/LinkToDomain';

// todo: it would be cool to import this variable from './keywords-overview.scss'
const LEGEND_WIDTH = 210;

type Props = {
  domainId?: string,
  showModal: Function,
  domainInfo?: DomainInfo,
  notes: Object[],
  refetchDomainInfo: () => void,
  featureAdvancedMetrics: boolean,
  isTrial: boolean,
  overviewPage: { [componentId: string]: boolean },
  scrollTarget: string,
  updateScrollTarget: Function,
  resetScrollTarget: Function,
};

type State = {
  superCellCollapsed: boolean,
  useSmallLegend: boolean,
  isPageLoaded: boolean,
  areWinnersAndLosersLoading: boolean,
};

class Overview extends Component<Props, State> {
  media: Object;
  notificationsRef = React.createRef();
  _subHandler: SubscriptionHandle;

  state = {
    superCellCollapsed: true,
    useSmallLegend: false,
    isPageLoaded: false,
    areWinnersAndLosersLoading: false,
  };

  UNSAFE_componentWillMount() {
    this.media = matchMedia(`screen
                                and (min-width: 1300px)
                                and (max-width: 1600px`);

    if (this.media.matches) {
      this.handleChange({ matches: true });
    }

    this.media.addListener(this.handleChange);

    this._subHandler = subscribeToDomain(debounce(this.handleRefresh, 1000));
  }

  componentDidUpdate(prevProps) {
    if (this.props.domainId !== prevProps.domainId) {
      this.props.resetKeywordsTableState();
    }
    if (!this.state.isPageLoaded && prevProps.overviewPage !== this.props.overviewPage) {
      let isPageLoaded = true;
      forOwn(this.props.overviewPage, ({ loaded }) => {
        if (!loaded) {
          isPageLoaded = false;
        }
      });

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

  handleWinnersAndLosersLoadState = isLoading => {
    this.setState({
      areWinnersAndLosersLoading: isLoading,
    });
  };

  componentWillUnmount() {
    this.media.removeListener(this.handleChange);

    this._subHandler.unsubscribe();
  }

  handleChange = ({ matches }: Object) => {
    this.setState({ useSmallLegend: matches });
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

  handleNoteSelect = noteId => {
    this.props.showModal({
      modalType: 'EditNote',
      modalProps: {
        theme: 'light',
        noteId,
      },
    });
  };

  handleMultipleNotesSelect = notes => {
    this.props.showModal({
      modalType: 'EditNotes',
      modalProps: {
        theme: 'light',
        notes,
      },
    });
  };

  handleRefresh = () => {
    this.props.refetchDomainInfo && this.props.refetchDomainInfo();
  };

  handleSuperCellCollapse = () => {
    this.setState({
      superCellCollapsed: !this.state.superCellCollapsed,
    });
  };

  renderActionButtons = () => {
    const actions = [];
    const { domainInfo } = this.props;
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

    return actions;
  };

  renderShareOfVoicePro() {
    const { domainInfo } = this.props;
    const { useSmallLegend, superCellCollapsed } = this.state;

    const legendWidth = useSmallLegend ? LEGEND_WIDTH : 0;

    if (domainInfo) {
      const { featureAdvancedMetrics, isTrial } = this.props;
      const showFake = !featureAdvancedMetrics;
      const showShareOfVoicePercentage = domainInfo.shareOfVoicePercentage;
      return (
        <Overlay
          className="share-of-voice-pro"
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
            <ShareOfVoiceCompetitors
              showFake={showFake}
              legendWidth={legendWidth}
              showShareOfVoicePercentage={showShareOfVoicePercentage}
            />
          </div>

          <div className="flex-cell">
            <ShareOfVoiceTags
              showFake={showFake}
              legendWidth={legendWidth}
              showShareOfVoicePercentage={showShareOfVoicePercentage}
            />
          </div>

          <div className="flex-cell">
            <ShareOfVoiceLandingPages
              showFake={showFake}
              legendWidth={legendWidth}
              showShareOfVoicePercentage={showShareOfVoicePercentage}
            />
          </div>
        </Overlay>
      );
    }
  }

  renderUnknownCompetitors() {
    const { domainInfo } = this.props;
    const { useSmallLegend, superCellCollapsed } = this.state;

    const legendWidth = useSmallLegend ? LEGEND_WIDTH : 0;

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
            <UnknownCompetitors showFake={showFake} legendWidth={legendWidth} />
          </div>
        </Overlay>
      );
    }
  }

  renderContent() {
    const { domainInfo, notes } = this.props;
    const { isGAConnected, isAdobeMarketingConnected, id } = domainInfo || {};
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

        <ShareOfVoice
          className={cn({ 'share-of-voice-without-pro': !this.props.domainInfo })}
          notes={notes}
          onNoteSelect={this.handleNoteSelect}
          onMultipleNotesSelect={this.handleMultipleNotesSelect}
          showPercentage={domainInfo ? domainInfo.shareOfVoicePercentage : false}
        />
        {this.renderShareOfVoicePro()}
        <div className="content-row">{this.renderUnknownCompetitors()}</div>
        <div className="content-row">
          <RankingDistribution
            notes={notes}
            onNoteSelect={this.handleNoteSelect}
            onMultipleNotesSelect={this.handleMultipleNotesSelect}
            areWinnersAndLosersLoading={this.state.areWinnersAndLosersLoading}
          />
          <WinnersAndLosers
            onLoadingStatusChanged={this.handleWinnersAndLosersLoadState}
            domainId={this.props.domainId}
          />
        </div>
        <AverageRankChart
          notes={notes}
          onNoteSelect={this.handleNoteSelect}
          onMultipleNotesSelect={this.handleMultipleNotesSelect}
        />
        {analyticsConnected && <GoogleAnalytics />}
        {analyticsConnected && (
          <OrganicAnalytics
            notes={notes}
            onNoteSelect={this.handleNoteSelect}
            onMultipleNotesSelect={this.handleMultipleNotesSelect}
          />
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
    featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
    isTrial: state.user.organization.activePlan.isTrial,
    overviewPage: state.overviewPage,
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
    { showModal, updateScrollTarget, resetScrollTarget, resetKeywordsTableState },
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
    props: ({ ownProps, data, data: { keywords, loading, error } }) => ({
      ...ownProps,
      notesData: data,
      notes: !(loading || error) && keywords && keywords.overview ? keywords.overview.notes : [],
    }),
  }),
  queryDomainInfo(),
)(Overview);
