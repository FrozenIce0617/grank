// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import Chart from 'Components/GoogleAnalytics/Chart';
import ElementsHeader from '../../ElementHeader';

type Props = {
  onLoad: Function,
  isLoading: boolean,
  error: any,
  filters: FilterBase[],
  googleAnalytics: Object,
};

class GoogleAnalytics extends React.Component<Props> {
  render() {
    const { isLoading, error, onLoad, googleAnalytics, filters } = this.props;

    if (isLoading) {
      return null;
    }
    onLoad();
    return (
      <div className="report-google-analytics">
        <ElementsHeader title={t('Google analytics')} filters={filters} />
        <Chart data={googleAnalytics} error={error} isLoading={isLoading} />
      </div>
    );
  }
}

const googleAnalyticsQuery = gql`
  query googleAnalytics_googleAnalytics(
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

export default graphql(googleAnalyticsQuery, {
  options: (props: Props) => {
    const { filters } = props;
    return {
      fetchPolicy: 'network-only',
      variables: {
        filters,
        pagination: {
          page: 1,
          results: 100,
        },
        ordering: {
          order: 'ASC',
          orderBy: 'keyword',
        },
      },
    };
  },
  props: ({ ownProps, data: { error, loading, keywords } }) => ({
    ...ownProps,
    isLoading: loading,
    error,
    googleAnalytics: keywords && keywords.overview ? keywords.overview.googleAnalytics : {},
  }),
})(GoogleAnalytics);
