// @flow
import React, { Component } from 'react';
import LabelWithHelp from 'Components/LabelWithHelp';
import CompetitorsDistributionChart from './CompetitorsDistributionChart';
import CompetitorsTable from './CompetitorsTable';
import CompetitorsRankDistribution from './CompetitorsRankDistribution';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import { showModal } from 'Actions/ModalAction';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import isFQDN from 'validator/lib/isFQDN';
import colorScheme from 'Utilities/colors';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';

import './unknown-competitors.scss';

const colors = colorScheme.unknownCompetitors.competitors;

export type Competitor = {
  id: number,
  domain: string,
};

export type UnknownCompetitor = {
  unknownCompetitor: Competitor,
  amount: number,
  ownDomain: boolean,
};

type Props = {
  client: Object,
  unknownCompetitors: UnknownCompetitor[],
  showFake: boolean,
  unknownCompetitorsLoading: boolean,
  competitorsLoading: boolean,
  period: number,
  domainId: number,
  filters: FilterBase[],
  showModal: Function,
  refetchCompetitorsInfo: Function,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

type State = {
  selection: Set<number>,
};

class UnknownCompetitors extends Component<Props, State> {
  _id: string = 'UnknownCompetitors';

  state = {
    selection: new Set([]),
  };

  componentDidMount() {
    this.props.registerOverviewComponent(this._id);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      (prevProps.unknownCompetitorsLoading !== this.props.unknownCompetitorsLoading ||
        prevProps.competitorsLoading !== this.props.competitorsLoading) &&
      !this.props.competitorsLoading &&
      !this.props.unknownCompetitorsLoading
    ) {
      this.props.overviewComponentLoaded(this._id);
    }
  }

  getFakeData() {
    const fakeData = [];
    for (let i = 1; i < 11; i++) {
      fakeData.push({
        unknownCompetitor: {
          domain: `domain${i}.com`,
          id: i,
        },
        amount: 11 - i,
      });
    }
    return this.getChartData(fakeData);
  }

  getChartData = unknownCompetitors => {
    const knownCompetitors = this.props.showFake
      ? new Set([])
      : new Set(this.props.competitors.map(competitor => competitor.domain));
    return unknownCompetitors.map((x, index) => {
      const isValidDomainName = isFQDN(x.unknownCompetitor.domain);
      const isKnownCompetitor = knownCompetitors.has(x.unknownCompetitor.domain);
      return {
        name: x.unknownCompetitor.domain,
        id: x.unknownCompetitor.id,
        y: x.amount,
        color: colors[index % colors.length],
        isValidDomainName,
        isKnownCompetitor,
        ownDomain: x.ownDomain,
      };
    });
  };

  isLoading = () => {
    const { competitorsLoading, unknownCompetitorsLoading } = this.props;
    return competitorsLoading || unknownCompetitorsLoading;
  };

  getData = () => {
    const { showFake } = this.props;
    if (this.isLoading()) {
      return [];
    }
    if (showFake) {
      return this.getFakeData();
    }
    return this.getChartData(this.props.unknownCompetitors);
  };

  handleChange = (newSelection: Set<number>) => {
    this.setState({
      selection: newSelection,
    });
  };

  handleAddCompetitor = (domain: string) => {
    this.props.showModal({
      modalType: 'AddCompetitor',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        domainToAdd: domain,
        refresh: this.props.refetchCompetitorsInfo,
      },
    });
  };

  render() {
    const { period } = this.props;
    const isLoading = this.isLoading();
    const competitorsData = this.getData();
    return (
      <div className="unknown-competitors-chart">
        <LabelWithHelp
          helpTitle={t('Top Competitors')}
          help={t('Shows the most occuring competitors in top 10 for your keywords.')}
        >
          {t('Top Competitors')}
        </LabelWithHelp>
        <div className="flex-row">
          <div className="flex-cell">
            <CompetitorsDistributionChart
              data={competitorsData}
              isLoading={isLoading}
              period={period}
            />
          </div>
          <div className="flex-cell">
            <CompetitorsTable
              onChange={this.handleChange}
              selection={this.state.selection}
              data={competitorsData}
              isLoading={isLoading}
              onAddCompetitor={this.handleAddCompetitor}
              period={period}
            />
          </div>
          <div className="flex-cell flex-grow">
            <CompetitorsRankDistribution
              showFake={this.props.showFake}
              filters={this.props.filters}
              selection={this.state.selection}
              competitors={competitorsData}
              isLoading={isLoading}
              period={period}
            />
          </div>
        </div>
      </div>
    );
  }
}

const unknownCompetitorQuery = gql`
  query unknownCompetitors_unknownCompetitorDistributions(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        unknownCompetitorDistribution {
          unknownCompetitor {
            id
            domain
          }
          amount
          ownDomain
        }
      }
    }
  }
`;

const competitorsQuery = gql`
  query unknownCompetitors_competitors(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        competitors {
          id
          domain
        }
      }
    }
  }
`;

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);
const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const periodFilter = periodFilterSelector(state);
  const domainFilter = domainsFilterSelector(state);
  return {
    filters: state.filter.filterGroup.filters,
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

const queryOptions = props => {
  const { filters } = props;
  return {
    fetchPolicy: 'network-only',
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
    },
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal, registerOverviewComponent, overviewComponentLoaded },
  ),
  graphql(unknownCompetitorQuery, {
    skip: props => props.showFake,
    options: queryOptions,
    props: ({ ownProps, data: { loading, keywords } }) => ({
      unknownCompetitorsLoading: !ownProps.showFake && loading,
      unknownCompetitors:
        keywords && keywords.overview ? keywords.overview.unknownCompetitorDistribution : [],
    }),
  }),
  graphql(competitorsQuery, {
    skip: props => props.showFake,
    options: queryOptions,
    props: ({ ownProps, data: { loading, keywords, refetch } }) => ({
      competitorsLoading: !ownProps.showFake && loading,
      competitors: (keywords && keywords.competitors && keywords.competitors.competitors) || [],
      refetchCompetitorsInfo: refetch,
    }),
  }),
)(UnknownCompetitors);
