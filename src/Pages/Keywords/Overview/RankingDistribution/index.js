// @flow
import React, { Component } from 'react';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n/index';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import Chart from './Chart';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import overviewComponent from '../overviewComponent';
import LatestRankDistribution from './LatestRankDistribution';
import './ranking-distribution.scss';

type Props = {
  data: Object,
  domainId: string,
  rankingDistribution: Object,
  loading: boolean,
  period: number,
  notes: Object[],
  onNotesSelect: Function,
};

class RankingDistribution extends Component<Props> {
  render() {
    const { rankingDistribution, loading, domainId, period, notes, onNotesSelect } = this.props;
    return (
      <div className="ranking-distribution-container">
        <div className="ranking-distribution">
          <LabelWithHelp
            helpTitle={t('Ranking Distribution')}
            help={t(
              'In this graph, the rankings are split into six different groups according to range - for example range 1 - 3 . This enables you to quickly see if your keywords ranked in these particular ranges are going up or down.',
            )}
          >
            {t('Ranking Distribution')}
          </LabelWithHelp>
          <Chart
            data={rankingDistribution}
            domainId={domainId}
            isLoading={loading}
            period={period}
            notes={notes}
            onNotesSelect={onNotesSelect}
            watermark
            watermarkBig
          />
        </div>
        <LatestRankDistribution rankingDistribution={rankingDistribution} loading={loading} />
      </div>
    );
  }
}

const rankingDistributionQuery = gql`
  query keywords(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        rankingDistribution {
          days {
            date
            keywords0To3
            keywords4To10
            keywords11To20
            keywords21To50
            keywordsAbove50
            keywordsUnranked
            keywordsTotal
          }
        }
      }
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);
const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  const periodFilter = periodFilterSelector(state);
  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: state.filter.filterGroup.filters,
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

export default compose(
  connect(mapStateToProps),
  graphql(rankingDistributionQuery, {
    options: props => {
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
    },
    props: ({ ownProps, data, data: { keywords } }) => ({
      ...ownProps,
      data,
      rankingDistribution:
        keywords && keywords.overview ? keywords.overview.rankingDistribution : {},
    }),
  }),
  overviewComponent('RankingDistribution'),
)(RankingDistribution);
