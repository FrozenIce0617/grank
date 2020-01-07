// @flow
import React, { Component } from 'react';
import { withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import LandingPagesChart from './LandingPagesChart';
import { showModal } from 'Actions/ModalAction';
import { t, tct } from 'Utilities/i18n/index';
import { FilterAttribute } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import AdvancedPlanUpsellChart from 'Components/AdvancedPlanUpsellChart';
import Overlay from 'Components/Overlay';
import DropdownList from 'Components/Controls/DropdownList';
import { isEmpty, debounce } from 'lodash';
import './keywords-landingpages.scss';
import { throwNetworkError } from 'Utilities/errors';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import LandingPagesInfiniteTable from 'Components/InfiniteTable/Tables/LandingPagesInfiniteTable';
import { Link } from 'react-router-dom';
import { subscribeToDomain } from 'Utilities/websocket';
import colorScheme from 'Utilities/colors';
import { graphql } from 'react-apollo/index';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { doAnyway } from 'Utilities/promise';

const colors = colorScheme.defaultLines;

type Props = {
  client: Object,
  filters: FilterBase[],
  showModal: Function,
  domainId: ?string,
  domainInfo: DomainInfo,
  domainData: Object,
  refetchDomainInfo: () => void,
  period: number,
  isNotesLoading: boolean,
  featureAdvancedMetrics: boolean,
  notes: Object[],
};

type State = {
  selectedLandingpages: Set<number>,
  metric: string,
  lpChartData: Map<string | null, Object>,
  lpColors: { [key: string]: string },
  currentColorIndex: number,
  chartShouldUpdate: number,
  isLoading: boolean,
  superCellCollapsed: boolean,
  isSilentUpdate: boolean,
};

const landingPagesChartDataQuery = gql`
  query keywordsLandingpages_keywordsLandingPagesChart(
    $landingPages: [ID]!
    $metric: String!
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      landingPages(pagination: $pagination, ordering: $ordering) {
        chart(landingPages: $landingPages, metric: $metric) {
          landingPage {
            id
            path
          }
          days {
            date
            value
          }
        }
      }
    }
  }
`;

class KeywordsLandingpages extends Component<Props, State> {
  landingPagesTable: LandingPagesInfiniteTable;
  _subHandlers: SubscriptionHandle[];

  state = {
    selectedLandingpages: new Set(),
    superCellCollapsed: true,
    metric: 'share_of_voice',
    isLoading: false,
    currentColorIndex: 1,
    chartShouldUpdate: +new Date(),
    lpChartData: new Map(),
    lpColors: {},
    isSilentUpdate: false,
  };

  UNSAFE_componentWillMount() {
    const { metric, selectedLandingpages } = this.state;
    const { filters } = this.props;

    this.queryLandingPagesData(Array.from(selectedLandingpages), metric, filters, true);

    const action = debounce(() => this.handleRefresh(true), 1000);
    this._subHandlers = [subscribeToDomain(action)];
  }

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    const { metric, lpChartData, selectedLandingpages } = nextState;
    const { filters } = nextProps;

    if (nextProps.filters !== this.props.filters && !isEmpty(lpChartData)) {
      this.queryLandingPagesData(Array.from(selectedLandingpages), metric, filters, true);
    }

    if (nextProps.notes !== this.props.notes) {
      this.setState({
        chartShouldUpdate: +new Date(),
      });
    }
  }

  componentWillUnmount() {
    this._subHandlers.forEach(handler => {
      handler.unsubscribe();
    });
  }

  getMetric = metricValue => this.metricsOptions.find(option => option.value === metricValue) || {};

  metricsOptions = [
    {
      label: t('Share of Voice'),
      value: 'share_of_voice',
    },
    {
      label: t('Revenue'),
      value: 'analytics_avg_revenue',
    },
    {
      label: t('Search volume'),
      value: 'search_volume',
    },
  ];

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

  handleRefresh = (isSilent: boolean) => {
    const { metric, selectedLandingpages } = this.state;
    const { filters } = this.props;

    this.props.refetchDomainInfo();

    if (!isSilent) {
      this.landingPagesTable
        .getWrappedInstance()
        .getWrappedInstance()
        .resetTable();
    }

    isSilent && this.setState({ isSilentUpdate: true });
    this.queryLandingPagesData(Array.from(selectedLandingpages), metric, filters, true).then(
      ...doAnyway(() => {
        isSilent && this.setState({ isSilentUpdate: false });
      }),
    );
  };

  handleMetricChange = metric => {
    const { filters } = this.props;
    const { selectedLandingpages } = this.state;

    this.queryLandingPagesData(Array.from(selectedLandingpages), metric, filters, true);

    this.setState({
      metric,
    });
  };

  handleSelect = ({ currentTarget: target }) => {
    const { filters } = this.props;
    const { metric, selectedLandingpages, lpColors, currentColorIndex } = this.state;

    if (target.checked && !lpColors[target.name]) {
      this.setState({
        lpColors: {
          ...lpColors,
          [target.name]: colors[currentColorIndex % colors.length],
        },
        currentColorIndex: currentColorIndex + 1,
      });
    }

    const set = new Set(selectedLandingpages);
    (target.checked ? set.add : set.delete).call(set, target.name);

    this.setState({
      selectedLandingpages: set,
    });

    return this.queryLandingPagesData([target.name], metric, filters);
  };

  handleSuperCellCollapse = () => {
    this.setState({
      superCellCollapsed: !this.state.superCellCollapsed,
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

  queryLandingPagesData = (landingPages = [], metric, filters, chartShouldUpdate = false) => {
    if (this.shouldShowFake()) {
      return Promise.resolve();
    }

    const { client } = this.props;

    this.setState({
      isLoading: true,
      lpChartData: !chartShouldUpdate ? this.state.lpChartData : new Map(),
    });

    return client
      .query({
        query: landingPagesChartDataQuery,
        variables: {
          filters,
          pagination: {
            page: 1,
            results: 25,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          landingPages,
          metric,
        },
      })
      .then(({ data }) => {
        const { selectedLandingpages } = this.state;
        const {
          keywords: {
            landingPages: { chart },
          },
        } = data;

        const newLandingPages = chart.reduce((acc, item) => {
          acc.set(item.landingPage.id, item);
          return acc;
        }, new Map());

        this.setState({
          lpChartData: new Map([...this.state.lpChartData, ...newLandingPages]),
          ...(!isEmpty(newLandingPages) && isEmpty(this.state.lpChartData)
            ? {
                selectedLandingpages: selectedLandingpages.add(newLandingPages.keys().next().value),
              }
            : {}),
          ...(chartShouldUpdate ? { chartShouldUpdate: +new Date() } : {}),
          isLoading: false,
        });
      }, throwNetworkError)
      .catch(error => {
        this.setState({ isLoading: false });
        throw error;
      });
  };

  renderActionButtons = () => {
    const actions = [];
    const { domainInfo } = this.props;
    // only show if we don't have multiple domains
    if (domainInfo) {
      const { isGAConnected, isGCConnected, isAdobeMarketingConnected } = domainInfo;

      actions.push(
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
        <Actions.SettingsAction key="settings" onClick={this.showTableSettings} />,
        <Actions.UpgradeAction key="upgradePlan" alignRight={true} />,
      );
    }

    return actions;
  };

  renderChartContent(showFake) {
    const { notes, isNotesLoading, period } = this.props;
    const {
      selectedLandingpages,
      lpChartData,
      isLoading,
      chartShouldUpdate,
      lpColors,
      metric,
      isSilentUpdate,
    } = this.state;

    return [
      <div key="select" className="graph-select-container">
        <DropdownList
          items={this.metricsOptions}
          placeholder={this.getMetric(metric).label}
          right
          onChange={this.handleMetricChange}
        />
      </div>,
      <LandingPagesChart
        key="chart"
        isLoading={!showFake && !isSilentUpdate && (isLoading || isNotesLoading)}
        period={period}
        selectedLandingPages={selectedLandingpages}
        landingPagesData={lpChartData}
        landingPagesColors={lpColors}
        notes={notes}
        onNoteSelect={this.handleNoteSelect}
        onMultipleNotesSelect={this.handleMultipleNotesSelect}
        shouldUpdate={chartShouldUpdate}
        showFake={showFake}
      />,
    ];
  }

  shouldShowFake = () => {
    const { domainInfo, domainData } = this.props;
    return domainInfo && !domainData.loading && !this.props.featureAdvancedMetrics;
  };

  shouldShowUpgradable = () => {
    const { domainInfo, domainData } = this.props;
    return domainInfo && !domainData.loading && this.props.isTrial;
  };

  setTableRef = ref => {
    this.landingPagesTable = ref;
  };

  showTableSettings = () =>
    this.landingPagesTable &&
    this.landingPagesTable
      .getWrappedInstance()
      .getWrappedInstance()
      .showSettings();

  handleUpdate = () => {
    this.forceUpdate();
  };

  render() {
    const { superCellCollapsed } = this.state;

    const { domainInfo, domainId } = this.props;
    const showFake = this.shouldShowFake();
    const isUpgradable = this.shouldShowUpgradable();

    return (
      <DashboardTemplate>
        <ActionsMenu menuFor="keywords_landingpages" domainId={domainId} domainInfo={domainInfo}>
          {this.renderActionButtons()}
        </ActionsMenu>
        <div className="keywords-landingpages content-container">
          <Overlay
            collapsed={superCellCollapsed}
            onTop={
              <AdvancedPlanUpsellChart
                collapsed={superCellCollapsed}
                onCollapse={this.handleSuperCellCollapse}
                subSubTitle={tct(
                  'This feature is available in [link1:Professional], [link2:Expert] and [link3:Enterprise] plans.',
                  {
                    link1: <Link to={'/billing/package/select'} />,
                    link2: <Link to={'/billing/package/select'} />,
                    link3: <Link to={'/billing/package/select'} />,
                  },
                )}
              />
            }
            isEnabled={showFake}
            isUpgradable={isUpgradable}
          >
            {this.renderChartContent(showFake)}
          </Overlay>
          <div className="table-container">
            <LandingPagesInfiniteTable
              ref={this.setTableRef}
              selected={this.state.selectedLandingpages}
              onSelect={this.handleSelect}
              onUpdate={this.handleUpdate}
              showShareOfVoicePercentage={domainInfo ? domainInfo.shareOfVoicePercentage : false}
            />
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);
const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  const periodFilter = periodFilterSelector(state);

  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: state.filter.filterGroup.filters,
    period: periodFilter && daysInPeriod(periodFilter),
    featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
    isTrial: state.user.organization.activePlan.isTrial,
  };
};

const notesQuery = gql`
  query keywordsLandingpages_keywordsNotes(
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
  withApollo,
  connect(
    mapStateToProps,
    { showModal },
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
      isNotesLoading: loading,
      notes: !(loading || error) && keywords && keywords.overview ? keywords.overview.notes : [],
    }),
  }),
  queryDomainInfo(),
)(KeywordsLandingpages);
