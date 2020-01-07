// @flow
import React, { Component } from 'react';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { showModal } from 'Actions/ModalAction';
import cn from 'classnames';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute, TOTAL } from 'Types/Filter';
import type { SearchType } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import Chart from './Chart';
import overviewComponent from '../overviewComponent';
import ArrowUp from 'icons/arrow-up.svg?inline';
import ArrowDown from 'icons/arrow-down.svg?inline';
import FormatNumber from 'Components/FormatNumber';
import './share-of-voice.scss';

type Props = {
  className?: string,
  domainId?: number,
  domain?: string,
  loading: boolean,
  chartData: Object,
  data: Object,
  showModal: Function,
  period: number,
  filters: any,
  searchType: SearchType,
  notes: Object[],
  onNotesSelect: Function,
  showPercentage: boolean,
};

class ShareOfVoice extends Component<Props> {
  _exportContainer: any = React.createRef();

  renderStats() {
    const { showPercentage } = this.props;
    if (!this.props.data.keywords) {
      return null;
    }
    const data = this.props.data.keywords.overview.shareOfVoice[0];
    const shareOfVoiceChange = data.shareOfVoiceChange;
    const icon =
      shareOfVoiceChange < 0 ? <ArrowDown className="icon" /> : <ArrowUp className="icon" />;
    if (showPercentage) {
      const shareOfVoicePercentage =
        data.shareOfVoice && data.shareOfVoice.length
          ? data.shareOfVoice[data.shareOfVoice.length - 1].shareOfVoicePercentage
          : 0;
      const percent = data.shareOfVoicePercentageChange;
      return (
        <div className="stats-row">
          <div className="main-value">
            <FormatNumber percentage precision={2}>
              {shareOfVoicePercentage}
            </FormatNumber>
          </div>
          <span
            className={cn('delta-value', {
              decrease: shareOfVoiceChange < 0,
              increase: shareOfVoiceChange > 0,
            })}
          >
            {icon}
            <FormatNumber className="delta" percentage precision={2}>
              {percent}
            </FormatNumber>
          </span>
        </div>
      );
    }
    const shareOfVoice =
      data.shareOfVoice && data.shareOfVoice.length
        ? data.shareOfVoice[data.shareOfVoice.length - 1].shareOfVoice
        : 0;
    const percent = data.shareOfVoiceChangePercentage;
    return (
      <div className="stats-row">
        <div className="main-value">
          <FormatNumber>{shareOfVoice}</FormatNumber>
        </div>
        <span
          className={cn('delta-value', {
            decrease: shareOfVoiceChange < 0,
            increase: shareOfVoiceChange > 0,
          })}
        >
          {icon}
          <FormatNumber className="delta">{Math.abs(shareOfVoiceChange)}</FormatNumber>
        </span>
        <div
          className={cn('delta-percent Kpi-evolution small', {
            red: shareOfVoiceChange < 0,
            green: shareOfVoiceChange > 0,
          })}
        >
          {`${percent < 0 ? '' : '+'}${(percent * 100).toFixed(0)}%`}
        </div>
      </div>
    );
  }

  render() {
    const {
      chartData,
      domainId,
      notes,
      domain,
      className,
      period,
      searchType,
      onNotesSelect,
      showPercentage,
      loading,
    } = this.props;
    return (
      <div className={cn('share-of-voice', className)}>
        <div className="header">
          <LabelWithHelp
            helpTitle={t('Share of Voice')}
            help={t(
              'Share of Voice is an indicator of how your most important keywords are performing. All keywords that rank between positions 1 to 20 are used for the calculation. The average CTR for the position is multiplied by the search volume of each keyword, allowing you to see if a high traffic keyword is losing rank.',
            )}
          >
            {t('Share of Voice')}
          </LabelWithHelp>
          {this.renderStats()}
        </div>
        <div className="content">
          <div ref={this._exportContainer} className="chart-export-container">
            <div className="chart-export-container-chart">
              <Chart
                searchType={searchType}
                data={chartData}
                domain={domain}
                notes={notes}
                onNotesSelect={onNotesSelect}
                isLoading={loading}
                domainId={domainId}
                height={330}
                period={period}
                watermark
                watermarkBig
                exportContainer={this._exportContainer.current}
                showPercentage={showPercentage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const shareOfVoiceQuery = gql`
  query shareOfVoice_keywordsSoVChart(
    $filters: [FilterInput]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      overview {
        shareOfVoice {
          shareOfVoice {
            date
            keywords
            shareOfVoice
            shareOfVoicePercentage
          }
          shareOfVoiceChange
          shareOfVoiceChangePercentage
          shareOfVoicePercentageChange
        }
      }
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);
const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);
const searchTypeFilterSelector = SpecificFilterSelector(FilterAttribute.SEARCH_TYPE);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  const periodFilter = periodFilterSelector(state);
  const searchTypeFilter = searchTypeFilterSelector(state);
  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    period: periodFilter && daysInPeriod(periodFilter),
    filters: state.filter.filterGroup.filters,
    searchType: searchTypeFilter ? searchTypeFilter.value : TOTAL,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(shareOfVoiceQuery, {
    options: props => {
      const { filters } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          fakePagination: {
            page: 1,
            results: 5,
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
        },
      };
    },
    props: ({ data }) => {
      const { keywords } = data;

      const shareOfVoice =
        keywords && keywords.overview && keywords.overview.shareOfVoice
          ? keywords.overview.shareOfVoice
          : [];

      const chartData = shareOfVoice.length ? shareOfVoice[0].shareOfVoice : [];
      console.log(data);
      return {
        data,
        chartData,
      };
    },
  }),
  overviewComponent('ShareOfVoice'),
)(ShareOfVoice);
