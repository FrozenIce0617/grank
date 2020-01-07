// @flow
import React, { Component } from 'react';
import PieChart from 'Components/PieChart';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n/index';
import ArrowUp from 'icons/arrow-up.svg?inline';
import ArrowDown from 'icons/arrow-down.svg?inline';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import FormatNumber from 'Components/FormatNumber';
import LinkToKeywordsFromWinnersAndLosers from 'Components/Filters/LinkToKeywordsFromWinnersAndLosers';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import colorScheme from 'Utilities/colors';
import overviewComponent from '../overviewComponent';
import './winners-and-losers.scss';

type Props = {
  data: Object,
  domainId: number,
  loading: boolean,
  winnersAndLosers: Object,
  period: number,
};

class WinnersAndLosers extends Component<Props> {
  render() {
    const { winnersAndLosers, loading, period } = this.props;

    const {
      winners,
      winnersShareOfVoice,
      losers,
      losersShareOfVoice,
      noMovement: unchanged,
    } = winnersAndLosers;

    const colors = colorScheme.winnersAndLosers;

    const chartData = [
      { name: 'Winners', y: winners, color: colors.winners },
      { name: 'Losers', y: losers, color: colors.losers },
      { name: 'Unchanged', y: unchanged, color: colors.unchanged },
    ];
    return (
      <div className="winners-and-losers">
        <LabelWithHelp
          helpTitle={t('Winners & Losers')}
          help={t(
            'Winners & Losers shows you the number of keywords that have moved up, down or remained unchanged. To be included a keyword has to have been tracked on both of the dates that you are comparing.',
          )}
        >
          {t('Winners & Losers')}
        </LabelWithHelp>
        <div className="flex-row">
          <div className="flex-cell">
            <PieChart
              totalLabel={t('Total Keywords')}
              seriesLabel={t('Keywords')}
              linkTo={evt =>
                LinkToKeywordsFromWinnersAndLosers(this.props.domainId, evt.point.name)
              }
              data={chartData}
              isLoading={loading}
              period={period}
              noDataMessage={t('No data for the selected period')}
              showLegend={false}
              watermark
              watermarkBig
              watermarkCutNumber={1}
            />
          </div>
          {!loading && (
            <div className="stats">
              <div className="stats-row">
                <ArrowUp className="icon increase" />
                <div className="stats-column">
                  <span className="main-value increase">
                    <FormatNumber>{winners}</FormatNumber>
                  </span>
                  <span className="label">{t('Keywords moved up')}</span>
                  <span className="delta-value increase">
                    <FormatNumber>{winnersShareOfVoice}</FormatNumber>
                  </span>
                  <span className="label">{t('Share of Voice increased')}</span>
                </div>
              </div>
              <div className="stats-row">
                <ArrowDown className="icon decrease" />
                <div className="stats-column">
                  <span className="main-value decrease">
                    <FormatNumber>{losers}</FormatNumber>
                  </span>
                  <span className="label">{t('Keywords moved down')}</span>
                  <span className="delta-value decrease">
                    <FormatNumber>{losersShareOfVoice}</FormatNumber>
                  </span>
                  <span className="label">{t('Share of Voice decreased')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const winnersAndLosersQuery = gql`
  query winnersAndLosers_winnersAndLosers(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        winnersAndLosers {
          winners
          winnersShareOfVoice
          losers
          losersShareOfVoice
          noMovement
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
  graphql(winnersAndLosersQuery, {
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
      winnersAndLosers:
        keywords && keywords.overview && keywords.overview.winnersAndLosers
          ? keywords.overview.winnersAndLosers
          : {},
    }),
  }),
  overviewComponent('WinnersAndLosers'),
)(WinnersAndLosers);
