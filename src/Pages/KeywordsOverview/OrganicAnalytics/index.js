// @flow
import React, { Component } from 'react';
import LabelWithHelp from 'Components/LabelWithHelp';
import Chart from './Chart';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import { doAnyway } from 'Utilities/promise';

import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';

type Props = {
  data: Object,
  organicHistory: Object,
  isLoading: boolean,
  period: number,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

type State = {
  isSilentUpdate: boolean,
};

class OrganicAnalytics extends Component<Props, State> {
  _id: string = 'OrganicAnalytics';
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
    const {
      organicHistory,
      isLoading,
      period,
      notes,
      onNoteSelect,
      onMultipleNotesSelect,
    } = this.props;
    const { isSilentUpdate } = this.state;
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
          isLoading={isLoading && !isSilentUpdate}
          period={period}
          watermark
          watermarkBig
          notes={notes}
          onNoteSelect={onNoteSelect}
          onMultipleNotesSelect={onMultipleNotesSelect}
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
  connect(
    mapStateToProps,
    { registerOverviewComponent, overviewComponentLoaded },
  ),
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
    props: ({ ownProps, data, data: { loading, keywords } }) => ({
      ...ownProps,
      data,
      isLoading: loading,
      organicHistory:
        keywords && keywords.overview && keywords.overview.googleAnalytics
          ? keywords.overview.googleAnalytics.organicHistory
          : [],
    }),
  }),
)(OrganicAnalytics);
