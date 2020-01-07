// @flow
import React, { Component } from 'react';
import PieChart from 'Components/PieChart';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import { doAnyway } from 'Utilities/promise';

import './share-of-voice-competitors.scss';
import colorScheme from 'Utilities/colors';

const colors = colorScheme.sovCompetitors;

type Props = {
  data: Object,
  shareOfVoicePotential: Object[],
  showFake: boolean,
  legendWidth: number,
  isLoading: boolean,
  period: number,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

type State = {
  isSilentUpdate: boolean,
};

class ShareOfVoiceCompetitors extends Component<Props, State> {
  _id: string = 'ShareOfVoiceCompetitors';
  _subHandle: SubscriptionHandle;

  state = {
    isSilentUpdate: false,
  };

  componentDidMount() {
    this.props.registerOverviewComponent(this._id);

    if (!this.props.showFake) {
      this._subHandle = subscribeToDomain(this.handleUpdate);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isLoading !== this.props.isLoading && !this.props.isLoading) {
      this.props.overviewComponentLoaded(this._id);
    }
  }

  componentWillUnmount() {
    if (this._subHandle) {
      this._subHandle.unsubscribe();
    }
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

  getFakeData() {
    return this.getChartData([
      {
        label: 'Potential',
        type: 'potential',
        amount: Math.floor(Math.random() * 100),
        amountPercentage: Math.floor(Math.random() * 100),
      },
      {
        label: 'domain.com',
        type: 'domain',
        amount: Math.floor(Math.random() * 100),
        amountPercentage: Math.floor(Math.random() * 100),
      },
      {
        label: 'competitor.com',
        type: 'competitor',
        amount: Math.floor(Math.random() * 100),
        amountPercentage: Math.floor(Math.random() * 100),
      },
    ]);
  }

  getChartData = shareOfVoicePotential =>
    shareOfVoicePotential
      ? shareOfVoicePotential.map((x, index) => {
          let color = colors.domain;
          let name = x.label;

          if (x.type === 'domain') {
            color = colors.domain;
          } else if (x.type === 'potential') {
            color = colors.potential;
            name = t('Untracked SoV');
          } else {
            color = colors.other[index % colors.other.length];
            name = x.label;
          }

          return {
            name,
            y: this.props.showShareOfVoicePercentage ? x.amountPercentage : x.amount,
            color,
          };
        })
      : [];

  getData = () => this.getChartData(this.props.shareOfVoicePotential);

  render() {
    const { showFake, legendWidth, isLoading, period } = this.props;
    const { isSilentUpdate } = this.state;
    return (
      <div className="share-of-voice-competitors">
        <LabelWithHelp
          helpTitle={t('Share of Voice Competitors')}
          help={t(
            'Shows both your and your competitors share of the market and the potential available.',
          )}
        >
          {t('Share of Voice Competitors')}
        </LabelWithHelp>
        <div className="flex-row">
          <div className="flex-cell">
            <PieChart
              totalLabel={t('Total Competitors SoV')}
              seriesLabel={t('Share of Voice')}
              data={!showFake ? this.getData() : this.getFakeData()}
              isLoading={isLoading && !isSilentUpdate}
              period={period}
              legendWidth={legendWidth}
              noDataMessage={t('No data for the selected period')}
              watermark
              watermarkBig
              percentage={this.props.showShareOfVoicePercentage}
            />
          </div>
        </div>
      </div>
    );
  }
}

const shareOfVoicePotentialQuery = gql`
  query shareOfVoiceCompetitors_shareOfVoiceCompetitors(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        shareOfVoicePotential {
          label
          type
          amount
          amountPercentage
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
  graphql(shareOfVoicePotentialQuery, {
    skip: props => props.showFake,
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
      isLoading: !ownProps.showFake && loading,
      shareOfVoicePotential:
        keywords && keywords.overview ? keywords.overview.shareOfVoicePotential : [],
    }),
  }),
)(ShareOfVoiceCompetitors);
