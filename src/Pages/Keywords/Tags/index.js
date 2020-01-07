// @flow
import React, { Component } from 'react';
import { withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import TagsChart from './TagsChart';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';
import { showModal } from 'Actions/ModalAction';
import { t, tct } from 'Utilities/i18n/index';
import { FilterAttribute } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import AdvancedPlanUpsellChart from 'Components/AdvancedPlanUpsellChart';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import Overlay from 'Components/Overlay';
import { throwNetworkError } from 'Utilities/errors';
import { isEmpty } from 'lodash';
import DropdownList from 'Components/Controls/DropdownList';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import TagsInfiniteTable from 'Components/InfiniteTable/Tables/TagsInfiniteTable';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { Link } from 'react-router-dom';
import colorScheme from 'Utilities/colors';
import './keywords-tags.scss';
import { graphql } from 'react-apollo/index';

const colors = colorScheme.defaultLines;

type Props = {
  client: Object,
  filters: FilterBase[],
  showModal: Function,
  tagsData: Object,
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
  selectedTags: Set<string>,
  tagsChartData: Map<string | null, Object>,
  tagsColors: { [key: string]: string },
  currentColorIndex: number,
  metric: string,
  chartShouldUpdate: number,
  isLoading: boolean,
  superCellCollapsed: boolean,
};

const tagsChartDataQuery = gql`
  query keywordsTags_keywordsChartTags(
    $tags: [String]!
    $metric: String!
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      tags(pagination: $pagination, ordering: $ordering) {
        chart(tags: $tags, metric: $metric) {
          tag
          days {
            date
            value
          }
        }
      }
    }
  }
`;

class KeywordsTags extends Component<Props, State> {
  noNameTag: string;
  tagsTable: TagsInfiniteTable;
  _subHandler: SubscriptionHandle;

  constructor(props) {
    super(props);

    this.noNameTag = t('All untagged keywords');
    this.state = {
      selectedTags: new Set([this.noNameTag]),
      tagsChartData: new Map(),
      tagsColors: {
        [this.noNameTag]: colors[0],
      },
      currentColorIndex: 1,
      isLoading: false,
      chartShouldUpdate: +new Date(),
      superCellCollapsed: true,
      metric: 'share_of_voice',
    };
  }

  UNSAFE_componentWillMount() {
    const { metric, selectedTags } = this.state;
    const { filters } = this.props;

    this.queryTagsData(Array.from(selectedTags), metric, filters, true);

    this._subHandler = subscribeToDomain(debounce(() => this.handleRefresh(true), 1000));
  }

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    const { metric, tagsChartData, selectedTags } = nextState;
    const { filters } = nextProps;

    if (nextProps.filters !== this.props.filters && !isEmpty(tagsChartData)) {
      this.queryTagsData(Array.from(selectedTags), metric, filters, true);
    }

    if (nextProps.notes !== this.props.notes) {
      this.setState({
        chartShouldUpdate: +new Date(),
      });
    }
  }

  componentWillUnmount() {
    this._subHandler.unsubscribe();
  }

  getMetric = metricValue => this.metricsOptions.find(option => option.value === metricValue) || {};

  metricsOptions = [
    {
      label: t('Share of Voice'),
      value: 'share_of_voice',
    },
    {
      label: t('Estimated Monthly Visitors'),
      value: 'analytics_visitors',
    },
    {
      label: t('Revenue'),
      value: 'analytics_avg_revenue',
    },
    {
      label: t('Search Volume'),
      value: 'search_volume',
    },
    {
      label: t('1-3'),
      value: 'keywords0To3',
    },
    {
      label: t('4-10'),
      value: 'keywords4To10',
    },
    {
      label: t('11-20'),
      value: 'keywords11To20',
    },
    {
      label: t('21-50'),
      value: 'keywords21To50',
    },
    {
      label: t('51-200'),
      value: 'keywordsAbove50',
    },
    {
      label: t('Unranked'),
      value: 'keywordsUnranked',
    },
  ];

  handleRefresh = (isSilent: boolean) => {
    const { metric, selectedTags } = this.state;
    const { filters } = this.props;

    this.props.refetchDomainInfo();

    if (!isSilent) {
      this.tagsTable
        .getWrappedInstance()
        .getWrappedInstance()
        .resetTable(isSilent);
    }
    this.queryTagsData(Array.from(selectedTags), metric, filters, true);
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

  handleMetricChange = metric => {
    const { filters } = this.props;
    const { selectedTags } = this.state;

    this.queryTagsData(Array.from(selectedTags), metric, filters, true);

    this.setState({
      metric,
    });
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

  queryTagsData = (tagNames = [], metric, filters, chartShouldUpdate = false) => {
    if (this.shouldShowFake()) {
      return;
    }

    const { client } = this.props;

    this.setState({
      isLoading: true,
      tagsChartData: !chartShouldUpdate ? this.state.tagsChartData : new Map(),
    });

    return client
      .query({
        query: tagsChartDataQuery,
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
          tags: tagNames.map((name: string) => (name !== this.noNameTag ? name : null)),
          metric,
        },
      })
      .then(({ data }) => {
        const {
          keywords: {
            tags: { chart },
          },
        } = data;

        this.setState({
          tagsChartData: new Map([
            ...this.state.tagsChartData,
            ...tagNames.reduce((acc, name) => {
              const tagData = chart.find(item => item.tag === name);
              if (tagData) {
                acc.set(name, tagData);
              }
              return acc;
            }, new Map()),
          ]),
          ...(chartShouldUpdate ? { chartShouldUpdate: +new Date() } : {}),
          isLoading: false,
        });
      }, throwNetworkError)
      .catch(error => {
        this.setState({ isLoading: false });
        throw error;
      });
  };

  handleSelect = ({ currentTarget: target }) => {
    const { filters } = this.props;
    const { metric, selectedTags, tagsColors, currentColorIndex } = this.state;

    if (target.checked && !tagsColors[target.name]) {
      this.setState({
        tagsColors: {
          ...tagsColors,
          [target.name]: colors[currentColorIndex % colors.length],
        },
        currentColorIndex: currentColorIndex + 1,
      });
    }

    const set = new Set(selectedTags);
    (target.checked ? set.add : set.delete).call(set, target.name);

    this.setState({
      selectedTags: set,
    });
    return this.queryTagsData([target.name], metric, filters);
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
      selectedTags,
      tagsChartData,
      isLoading,
      chartShouldUpdate,
      tagsColors,
      metric,
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
      <TagsChart
        key="chart"
        notes={notes}
        onNoteSelect={this.handleNoteSelect}
        onMultipleNotesSelect={this.handleMultipleNotesSelect}
        isLoading={!showFake && (isLoading || isNotesLoading)}
        selectedTags={selectedTags}
        tagsData={tagsChartData}
        tagsColors={tagsColors}
        period={period}
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

  handleUpdate = () => {
    this.forceUpdate();
  };

  showTableSettings = () =>
    this.tagsTable &&
    this.tagsTable
      .getWrappedInstance()
      .getWrappedInstance()
      .showSettings();

  setTableRef = ref => {
    this.tagsTable = ref;
  };

  render() {
    const { superCellCollapsed } = this.state;
    const { domainInfo } = this.props;

    const showFake = this.shouldShowFake();
    const isUpgradable = this.shouldShowUpgradable();

    return (
      <DashboardTemplate>
        <ActionsMenu
          menuFor="keywords_tags"
          domainId={this.props.domainId}
          domainInfo={this.props.domainInfo}
        >
          {this.renderActionButtons()}
        </ActionsMenu>
        <div className="keywords-tags content-container">
          <Overlay
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
            isEnabled={showFake}
            isUpgradable={isUpgradable}
          >
            {this.renderChartContent(showFake)}
          </Overlay>
          <div className="table-container">
            <TagsInfiniteTable
              noNameTag={this.noNameTag}
              ref={this.setTableRef}
              selected={this.state.selectedTags}
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
  query keywordsTags_keywordsNotes(
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
  queryDomainInfo(),
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
)(KeywordsTags);
