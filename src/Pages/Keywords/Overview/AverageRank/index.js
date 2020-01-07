// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import LabelWithHelp from 'Components/LabelWithHelp';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import overviewComponent from '../overviewComponent';
import ArrowUp from 'icons/arrow-up.svg?inline';
import ArrowDown from 'icons/arrow-down.svg?inline';
import FormatNumber from 'Components/FormatNumber';
import Chart from './Chart';
import cn from 'classnames';
import './average-rank.scss';

type Props = {
  data: Object,
  averageRank: Object,
  domainId: number,
  loading: boolean,
  period: number,
  notes: Object[],
  onNotesSelect: Function,
};

class AverageRank extends Component<Props> {
  renderStats() {
    if (!this.props.data.keywords) {
      return null;
    }
    // const data = this.props.data.keywords.overview.averageRank;
    // Mock data
    const data = {
      averageRank: this.props.data.keywords.overview.averageRank,
      averageRankChange: 234,
      averageRankChangePercentage: 0.5,
    };
    const averageRankChange = data.averageRankChange;
    const icon =
      averageRankChange < 0 ? <ArrowDown className="icon" /> : <ArrowUp className="icon" />;
    const averageRank =
      data.averageRank && data.averageRank.length
        ? data.averageRank[data.averageRank.length - 1].amount
        : 0;
    const percent = data.averageRankChangePercentage;
    return (
      <div className="stats-row">
        <div className="main-value">
          <FormatNumber>{averageRank}</FormatNumber>
        </div>
        <span
          className={cn('delta-value', {
            decrease: averageRankChange < 0,
            increase: averageRankChange > 0,
          })}
        >
          {icon}
          <FormatNumber className="delta">{Math.abs(averageRankChange)}</FormatNumber>
        </span>
        <div
          className={cn('delta-percent Kpi-evolution small', {
            red: averageRankChange < 0,
            green: averageRankChange > 0,
          })}
        >
          {`${percent < 0 ? '' : '+'}${(percent * 100).toFixed(0)}%`}
        </div>
      </div>
    );
  }

  render() {
    const { averageRank, period, domainId, loading, notes, onNotesSelect } = this.props;
    return (
      <div className="average-rank">
        <div className="header">
          <LabelWithHelp
            helpTitle={t('Average Rank')}
            help={t('The average rank for all your keywords on the given date.')}
          >
            {t('Average Rank')}
          </LabelWithHelp>
          {this.renderStats()}
        </div>
        <div className="content">
          <Chart
            data={averageRank}
            domainId={domainId}
            loading={loading}
            period={period}
            notes={notes}
            onNotesSelect={onNotesSelect}
            watermark
            watermarkBig
          />
        </div>
      </div>
    );
  }
}

const averageRankQuery = gql`
  query averageRankChart_keywordsAverageRank(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        averageRank {
          date
          amount
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
  graphql(averageRankQuery, {
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
      averageRank: keywords && keywords.overview ? keywords.overview.averageRank : [],
    }),
  }),
  overviewComponent('AverageRankChart'),
)(AverageRank);
