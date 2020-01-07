// @flow
import * as React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import ReportLineChart from 'Components/ReportLineChart';
import ElementsHeader from '../../ElementHeader';
import './report-share-of-voice.scss';
import { isEmpty } from 'lodash';

type Settings = {
  include_competitors: { value: boolean },
};

type Props = {
  onLoad: Function,
  loading: boolean,
  filters: FilterBase[],
  settings: Settings,
  competitors: string[] | null,
  chartData: Object,
};

class ShareOfVoice extends React.Component<Props> {
  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();
    const series = this.props.chartData.reduce((acc, domainData) => {
      const seriesPoints = domainData.days
        .map(dayData => ({
          x: new Date(dayData.date).getTime(),
          y: dayData.value,
        }))
        .sort((pointA, pointB) => pointA.x - pointB.x);

      !isEmpty(seriesPoints) &&
        acc.push({
          name: domainData.domain,
          points: seriesPoints,
        });
      return acc;
    }, []);
    return (
      <div className="report-share-of-voice">
        <ElementsHeader title={t('Share of Voice')} filters={this.props.filters} />
        <ReportLineChart
          series={series}
          animation={false}
          noDataMessage={t('No share of voice data for the selected period')}
        />
      </div>
    );
  }
}

const competitorsIdsQuery = gql`
  query shareOfVoice_competitors(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $fakeOrdering: OrderingInput!
    $fakePagination: PaginationInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        competitors {
          id
        }
      }
    }
  }
`;

const chartDataQuery = gql`
  query shareOfVoice_competitorsShareOfVoice(
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

const getQueryBaseParams = (props: Props) => ({
  filters: props.filters,
  pagination: { page: 1, results: 100 },
  ordering: { order: 'ASC', orderBy: 'domain' },
  fakeOrdering: { order: 'ASC', orderBy: 'keyword' },
  fakePagination: { page: 1, results: 100 },
});

export default compose(
  graphql(competitorsIdsQuery, {
    skip: (props: Props) =>
      !(props.settings.include_competitors && props.settings.include_competitors.value),
    options: (props: Props) => ({
      fetchPolicy: 'network-only',
      variables: getQueryBaseParams(props),
    }),
    props: ({ data: { loading, keywords } }) => {
      let competitors = null;
      if (keywords) {
        competitors = keywords.competitors.competitors.map(competitor => competitor.id);
      }
      return {
        loading,
        competitors,
      };
    },
  }),
  graphql(chartDataQuery, {
    skip: (props: Props) => {
      const include_competitors =
        props.settings.include_competitors && props.settings.include_competitors.value;
      return include_competitors && !props.competitors;
    },
    options: (props: Props) => {
      const baseParams = getQueryBaseParams(props);
      return {
        fetchPolicy: 'network-only',
        variables: {
          ...baseParams,
          competitors: props.competitors || [],
          metric: 'share_of_voice',
        },
      };
    },
    props: ({ data: { loading, keywords } }) => ({
      loading,
      chartData: keywords && keywords.competitors.chart,
    }),
  }),
)(ShareOfVoice);
