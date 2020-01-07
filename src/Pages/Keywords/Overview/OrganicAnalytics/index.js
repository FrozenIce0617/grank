// @flow
import React, { Component } from 'react';
import LabelWithHelp from 'Components/LabelWithHelp';
import Chart from './Chart';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import overviewComponent from '../overviewComponent';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';

type Props = {
  data: Object,
  organicHistory: Object,
  loading: boolean,
  period: number,
  notes: Object[],
  onNotesSelect: Function,
};

class OrganicAnalytics extends Component<Props> {
  render() {
    const { organicHistory, loading, period, notes, onNotesSelect } = this.props;
    return (
      <div className="organic-analytics">
        <LabelWithHelp
          helpTitle={t('Organic Traffic')}
          help={t(
            'This is the organic traffic from Google Analytics (or Adobe Analytics). If you chose a date range greater than 30 days, the graph will show organic traffic per week instead of per day.',
          )}
        >
          {t('Organic Traffic')}
        </LabelWithHelp>
        <Chart
          data={organicHistory}
          loading={loading}
          period={period}
          watermark
          watermarkBig
          notes={notes}
          onNotesSelect={onNotesSelect}
        />
      </div>
    );
  }
}

const organicAnalyticsQuery = gql`
  query organicAnalytics_keywordsOrganicHistory(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        googleAnalytics {
          organicHistory {
            date
            traffic
          }
        }
      }
    }
  }
`;

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const periodFilter = periodFilterSelector(state);
  return {
    filters: state.filter.filterGroup.filters,
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

export default compose(
  connect(mapStateToProps),
  graphql(organicAnalyticsQuery, {
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
      organicHistory:
        keywords && keywords.overview && keywords.overview.googleAnalytics
          ? keywords.overview.googleAnalytics.organicHistory
          : [],
    }),
  }),
  overviewComponent('OrganicAnalytics'),
)(OrganicAnalytics);
