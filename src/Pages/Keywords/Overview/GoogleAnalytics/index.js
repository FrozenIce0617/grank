// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import Chart from 'Components/GoogleAnalytics/Chart';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n/index';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import overviewComponent from '../overviewComponent';

type Props = {
  data: Object,
  googleAnalytics: Object,
  period: any,
  loading: boolean,
};

class GoogleAnalytics extends Component<Props> {
  render() {
    const { googleAnalytics, period, loading } = this.props;
    return (
      <div className="google-analytics">
        <LabelWithHelp
          helpTitle={t('Analytics')}
          help={t(
            'These numbers are pulled from the Google Analytics (or Adobe Analytics) account connected to this domain. The numbers are updated daily at midnight in the timezone specified in Google Analytics.',
          )}
        >
          {t('Analytics')}
        </LabelWithHelp>
        <Chart data={googleAnalytics} period={period} isLoading={loading} />
      </div>
    );
  }
}

const googleAnalyticsQuery = gql`
  query googleAnalytics_keywordsGoogleAnalytics(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        googleAnalytics {
          traffic {
            direct
            organic
            cpc
            referral
            social
            email
            display
            other
          }
          goals {
            direct
            organic
            cpc
            referral
            social
            email
            display
            other
          }
          revenue {
            direct
            organic
            cpc
            referral
            social
            email
            display
            other
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
  graphql(googleAnalyticsQuery, {
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
      googleAnalytics: keywords && keywords.overview ? keywords.overview.googleAnalytics : {},
    }),
  }),
  overviewComponent('GoogleAnalytics'),
)(GoogleAnalytics);
