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
import colorScheme from 'Utilities/colors';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import './share-of-voice-tags.scss';
import { doAnyway } from 'Utilities/promise';

type Props = {
  data: Object,
  shareOfVoiceTags: Object,
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

const colors = colorScheme.defaultAreas;

class ShareOfVoiceTags extends Component<Props, State> {
  _id: string = 'ShareOfVoiceTags';
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

  getFakeData = () =>
    this.getChartData([
      {
        label: 'Development',
        amount: Math.floor(Math.random() * 100),
        amountPercentage: Math.floor(Math.random() * 100),
      },
      {
        label: 'Marketing',
        amount: Math.floor(Math.random() * 100),
        amountPercentage: Math.floor(Math.random() * 100),
      },
      {
        label: 'Awesome',
        amount: Math.floor(Math.random() * 100),
        amountPercentage: Math.floor(Math.random() * 100),
      },
    ]);

  getChartData = shareOfVoiceTags => {
    let arr = shareOfVoiceTags.slice();
    arr.sort((a, b) => {
      if (a.amount > b.amount) return -1;
      if (a.amount < b.amount) return 1;
      return 0;
    });

    return arr.map((x, index) => ({
      name: x.type === 'potential' ? t('Untagged SoV') : x.label,
      y: this.props.showShareOfVoicePercentage ? x.amountPercentage : x.amount,
      color: colors[index % colors.length],
    }));
  };

  getData = () => this.getChartData(this.props.shareOfVoiceTags || []);

  render() {
    const { showFake, legendWidth, isLoading, period } = this.props;
    const { isSilentUpdate } = this.state;
    return (
      <div className="share-of-voice-tags">
        <LabelWithHelp
          helpTitle={t('Share of Voice Tags')}
          help={t(
            'Shows Share of Voice figures for the combined totals of all the keywords with tags applied in your account. ',
          )}
        >
          {t('Share of Voice Tags')}
        </LabelWithHelp>
        <div className="flex-row">
          <div className="flex-cell">
            <PieChart
              totalLabel={t('Total Tagged SoV')}
              seriesLabel={t('Share of Voice')}
              data={!showFake ? this.getData() : this.getFakeData()}
              legendWidth={legendWidth}
              isLoading={isLoading && !isSilentUpdate}
              period={period}
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

const shareOfVoiceTagsQuery = gql`
  query shareOfVoiceTags_shareOfVoiceTags(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        shareOfVoiceTags {
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
  graphql(shareOfVoiceTagsQuery, {
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
      shareOfVoiceTags: keywords && keywords.overview ? keywords.overview.shareOfVoiceTags : [],
    }),
  }),
)(ShareOfVoiceTags);
