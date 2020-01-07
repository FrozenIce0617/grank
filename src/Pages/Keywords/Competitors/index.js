// @flow
import React, { Component } from 'react';
import { withApollo, compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { t, tct } from 'Utilities/i18n/index';
import './keywords-competitors.scss';
import { showModal } from 'Actions/ModalAction';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import CompetitorsChart from './CompetitorsChart';
import { FilterAttribute } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import DropdownList from 'Components/Controls/DropdownList';
import AdvancedPlanUpsellChart from 'Components/AdvancedPlanUpsellChart';
import Overlay from 'Components/Overlay';
import { isEmpty } from 'lodash';
import { throwNetworkError } from 'Utilities/errors';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import CompetitorsInfiniteTable from 'Components/InfiniteTable/Tables/CompetitorsInfiniteTable';
import { Link } from 'react-router-dom';
import colorScheme from 'Utilities/colors';

const colors = colorScheme.defaultLines;

type Props = {
  client: Object,
  filters: FilterBase[],
  domainId: ?string,
  domainInfo: DomainInfo,
  domainData: Object,
  showModal: Function,
  refetchDomainInfo: () => void,
  period: number,
  isNotesLoading: boolean,
  featureAdvancedMetrics: boolean,
  notes: Object[],
};

type State = {
  selectedCompetitors: Set<string>,
  competitorsChartData: Map<string | null, Object>,
  competitorsColors: { [key: string]: string },
  currentColorIndex: number,
  metric: string,
  chartShouldUpdate: number,
  isLoading: boolean,
  superCellCollapsed: boolean,
};

const competitorsChartDataQuery = gql`
  query keywordsCompetitors_keywordsCompetitorsChart(
    $competitors: [ID]!
    $metric: String!
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        chart(competitors: $competitors, metric: $metric) {
          domain
          days {
            date
            value
          }
        }
      }
    }
  }
`;

class KeywordsCompetitors extends Component<Props, State> {
  competitorsTable: CompetitorsInfiniteTable;

  state = {
    selectedCompetitors: new Set(),
    metric: 'share_of_voice',
    superCellCollapsed: true,
    isLoading: false,
    currentColorIndex: 1,
    chartShouldUpdate: +new Date(),
    competitorsChartData: new Map(),
    competitorsColors: {},
  };

  UNSAFE_componentWillMount() {
    const { metric, selectedCompetitors } = this.state;
    this.queryCompetitorsChartData(Array.from(selectedCompetitors), metric, this.props, true);
  }

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    const { metric, competitorsChartData, selectedCompetitors } = nextState;

    if (nextProps.filters !== this.props.filters && !isEmpty(competitorsChartData)) {
      this.queryCompetitorsChartData(Array.from(selectedCompetitors), metric, nextProps, true);
    }

    if (nextProps.notes !== this.props.notes) {
      this.setState({
        chartShouldUpdate: +new Date(),
      });
    }
  }

  getMetric = metricValue => this.metricsOptions.find(option => option.value === metricValue) || {};

  metricsOptions = [
    {
      label: t('Share of Voice'),
      value: 'share_of_voice',
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

  isReady = () => !graphqlError({ ...this.props }) && !graphqlLoading({ ...this.props });

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddCompetitor',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainInfo && this.props.domainInfo.id,
        refresh: this.handleAdd,
      },
    });
  };

  handleAdd = () => {
    this.competitorsTable
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .resetTable();
  };

  handleMetricChange = metric => {
    const { selectedCompetitors } = this.state;

    this.queryCompetitorsChartData(Array.from(selectedCompetitors), metric, this.props, true);

    this.setState({
      metric,
    });
  };

  handleSelect = ({ currentTarget: target }) => {
    const { metric, selectedCompetitors, competitorsColors, currentColorIndex } = this.state;

    if (target.checked && !competitorsColors[target.name]) {
      this.setState({
        competitorsColors: {
          ...competitorsColors,
          [target.name]: colors[currentColorIndex % colors.length],
        },
        currentColorIndex: currentColorIndex + 1,
      });
    }

    const set = new Set(selectedCompetitors);
    (target.checked ? set.add : set.delete).call(set, target.name);

    this.setState({
      selectedCompetitors: set,
    });
    return this.queryCompetitorsChartData([target.name], metric, this.props);
  };

  handleRefresh = () => {
    const { metric, selectedCompetitors } = this.state;

    this.props.refetchDomainInfo();
    this.handleAdd();
    this.queryCompetitorsChartData(Array.from(selectedCompetitors), metric, this.props, true);
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

  handleSuperCellCollapse = () => {
    this.setState({
      superCellCollapsed: !this.state.superCellCollapsed,
    });
  };

  handleDeleteCompetitor = competitor => {
    const domain = competitor.domain;
    const { selectedCompetitors } = this.state;
    const set = new Set(selectedCompetitors);
    set.delete(domain);
    this.setState({
      selectedCompetitors: set,
    });
  };

  queryCompetitorsChartData = (
    competitorsDomains = [],
    metric,
    props,
    chartShouldUpdate = false,
  ) => {
    if (this.shouldShowFake()) {
      return;
    }

    const { client, filters } = props;

    this.setState({
      isLoading: true,
      competitorsChartData: !chartShouldUpdate ? this.state.competitorsChartData : new Map(),
    });

    let competitors = [];
    if (this.competitorsTable) {
      // TODO - refactor this somehow
      // Why list of selected have to be list of domain names, better just use ids directly
      const list = this.competitorsTable
        .getWrappedInstance()
        .getWrappedInstance()
        .getWrappedInstance()
        .getList();
      if (list) {
        competitors = list;
      }
    }

    const allCompetitorsMap = competitors.reduce((acc, { id, domain }) => {
      acc[domain] = id;
      return acc;
    }, {});

    return client
      .query({
        query: competitorsChartDataQuery,
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
          competitors: competitorsDomains.map(domain => allCompetitorsMap[domain]),
          metric,
        },
      })
      .then(({ data }) => {
        const {
          keywords: {
            competitors: { chart },
          },
        } = data;

        const newCompetitorsChartData = chart.reduce((acc, item) => {
          acc.set(item.domain, item);
          return acc;
        }, new Map());

        this.setState({
          competitorsChartData: new Map([
            ...this.state.competitorsChartData,
            ...newCompetitorsChartData,
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

  renderActionButtons = () => [
    <Actions.AddAction key="add" label={t('Add competitor')} onClick={this.handleAddAction} />,
    <Actions.SettingsAction key="settings" onClick={this.showTableSettings} />,
    <Actions.UpgradeAction key="upgrade-plan" alignRight={true} />,
  ];

  renderChartContent(showFake) {
    const { notes, isNotesLoading, period, domainInfo } = this.props;

    const {
      selectedCompetitors,
      competitorsChartData,
      isLoading,
      chartShouldUpdate,
      competitorsColors,
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
      <CompetitorsChart
        key="chart"
        notes={notes}
        onNoteSelect={this.handleNoteSelect}
        onMultipleNotesSelect={this.handleMultipleNotesSelect}
        isLoading={!showFake && (isLoading || isNotesLoading)}
        period={period}
        selectedCompetitors={
          domainInfo ? new Set([domainInfo.domain, ...selectedCompetitors]) : selectedCompetitors
        }
        competitorsData={competitorsChartData}
        competitorsColors={competitorsColors}
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

  setTableRef = ref => {
    this.competitorsTable = ref;
  };

  showTableSettings = () =>
    this.competitorsTable &&
    this.competitorsTable
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .showSettings();

  render() {
    const { superCellCollapsed } = this.state;

    const { domainInfo, domainId } = this.props;
    const showFake = this.shouldShowFake();
    const isUpgradable = this.shouldShowUpgradable();

    return (
      <DashboardTemplate>
        <ActionsMenu menuFor="keywords_competitors" domainId={domainId} domainInfo={domainInfo}>
          {this.renderActionButtons()}
        </ActionsMenu>
        <div className="keywords-competitors content-container">
          <Overlay
            collapsed={superCellCollapsed}
            isUpgradable={isUpgradable}
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
          >
            {this.renderChartContent(showFake)}
          </Overlay>
          <div className="table-container">
            <CompetitorsInfiniteTable
              ref={this.setTableRef}
              selected={this.state.selectedCompetitors}
              onSelect={this.handleSelect}
              onDelete={this.handleDeleteCompetitor}
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
  query keywordsCompetitors_keywordsNotes(
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
)(KeywordsCompetitors);
