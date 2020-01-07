// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import Chart from 'Components/GoogleAnalytics/Chart';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n/index';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import { doAnyway } from 'Utilities/promise';

type Props = {
  data: Object,
  googleAnalytics: Object,
  period: any,
  isLoading: boolean,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

type State = {
  isSilentUpdate: boolean,
};

class GoogleAnalytics extends Component<Props, State> {
  _id: string = 'GoogleAnalytics';
  _subHandle: SubscriptionHandle;

  state = {
    isSilentUpdate: false,
  };

  componentDidMount() {
    this.props.registerOverviewComponent(this._id);

    this._subHandle = subscribeToDomain(this.handleUpdate);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isLoading !== this.props.isLoading && !this.props.isLoading) {
      this.props.overviewComponentLoaded(this._id);
    }
  }

  componentWillUnmount() {
    this._subHandle.unsubscribe();
  }

  handleUpdate = () => {
    this.setState({
      isSilentUpdate: true,
    });
    this.props.data.refetch().then(
      ...doAnyway(() => {
        this.setState({
          isSilentUpdate: false,
        });
      }),
    );
  };

  render() {
    const { googleAnalytics, period, isLoading } = this.props;
    const { isSilentUpdate } = this.state;
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
        <Chart data={googleAnalytics} period={period} isLoading={isLoading && !isSilentUpdate} />
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
  connect(
    mapStateToProps,
    { registerOverviewComponent, overviewComponentLoaded },
  ),
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
    props: ({ ownProps, data, data: { loading, keywords } }) => ({
      ...ownProps,
      data,
      isLoading: loading,
      googleAnalytics: keywords && keywords.overview ? keywords.overview.googleAnalytics : {},
    }),
  }),
)(GoogleAnalytics);
