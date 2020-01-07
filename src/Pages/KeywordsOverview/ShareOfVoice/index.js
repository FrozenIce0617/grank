/* eslint-disable react/no-did-update-set-state */
// @flow
import React, { Component } from 'react';
import LabelWithHelp from 'Components/LabelWithHelp';
import CompetitorsLegend from './CompetitorsLegend';
import type { CompetitorsVisibility, CompetitorColors } from 'Components/ShareOfVoice/Chart';
import Stats from './Stats';
import DomainLegend from './DomainLegend';
import Chart from 'Components/ShareOfVoice/Chart';
import './share-of-voice.scss';
import { t } from 'Utilities/i18n/index';
import { compose, graphql, withApollo } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphqlOK } from 'Utilities/underdash';
import { showModal } from 'Actions/ModalAction';
import { map, isEmpty, mapValues, last } from 'lodash';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { DomainInfo } from 'Pages/queryDomainInfo';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import cn from 'classnames';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import { doAnyway } from 'Utilities/promise';
import { graphqlLoading } from 'Utilities/underdash';

import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import colorScheme from 'Utilities/colors';

const competitorColorsPalette = colorScheme.competitors;

type Props = {
  className?: string,
  domainId: number,
  domainInfo?: DomainInfo,
  client: any,
  stats: Object,
  chartData: Object,
  shareOfVoice: Array<any>,
  shareOfVoiceData: Object,
  showModal: Function,
  period: number,
  filters: any,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
  showPercentage: boolean,

  // competitors
  competitors: {
    id: string,
    domain: string,
  }[],
  competitorsItemsData: Object,
  competitorColors: CompetitorColors,
};

type State = {
  competitorsVisibility: CompetitorsVisibility,
  competitorsData: Object,
  isLoading: boolean,
  isSilentUpdate: boolean,
};

const shareOfVoiceCompetitorQuery = gql`
  query shareOfVoice_keywordsSoVCompetitorsChart(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $competitorId: ID!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        shareOfVoiceCompetitor(id: $competitorId) {
          shareOfVoice {
            date
            shareOfVoice
            shareOfVoicePercentage
          }
        }
      }
    }
  }
`;

class ShareOfVoice extends Component<Props, State> {
  _id: string = 'ShareOfVoice';
  _subHandle: SubscriptionHandle;
  _exportContainer: any = React.createRef();

  state = {
    competitorsVisibility: {},
    competitorsData: {},
    isLoading: false,
    isSilentUpdate: false,
    isOwnDomainDesktopVisible: true,
    isOwnDomainMobileVisible: true,
  };

  componentDidMount() {
    this.props.registerOverviewComponent(this._id);

    this._subHandle = subscribeToDomain(this.handleUpdate);
  }

  componentDidUpdate(prevProps: Props) {
    if (graphqlLoading(prevProps) && !graphqlLoading(this.props)) {
      this.props.overviewComponentLoaded(this._id);
    }
  }

  // TODO Temp fix for refetching competitors data for SoV,
  // need to have endpoint for mass fetch data for SoV
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { competitorsData, competitorsVisibility } = this.state;

    if (nextProps.filters !== this.props.filters && !isEmpty(competitorsData)) {
      this.setState({
        isLoading: true,
      });
      Promise.all(
        map(competitorsData, (value, competitorId) =>
          this.handleCompetitorLegendSelect(
            competitorId,
            value.domain,
            competitorsVisibility[competitorId],
            nextProps.filters,
            true,
          ),
        ),
      ).then(() => this.setState({ isLoading: false }));
    }
  }

  componentWillUnmount() {
    this._subHandle.unsubscribe();
  }

  formatCompetitorData(shareOfVoice: Array<any>) {
    const types = ['total', 'desktop', 'mobile'];
    return shareOfVoice.reduce((acc, row, idx) => {
      if (idx === 0) {
        return acc;
      }

      acc[types[idx]] = row.shareOfVoice;
      return acc;
    }, {});
  }

  handleUpdate = () => {
    this.setState({
      isSilentUpdate: true,
    });
    this.props.shareOfVoiceData.refetch().then(
      ...doAnyway(() => {
        this.setState({
          isSilentUpdate: false,
        });
      }),
    );
  };

  handleDomainLegendSelect = id => {
    const { isOwnDomainDesktopVisible: isDesktop, isOwnDomainMobileVisible: isMobile } = this.state;
    this.setState({
      isOwnDomainDesktopVisible: id === 'desktop' ? !isDesktop : isDesktop,
      isOwnDomainMobileVisible: id === 'mobile' ? !isMobile : isMobile,
    });
  };

  handleCompetitorLegendSelect = (id, domain, visibility, queryFilters, isMultiple) => {
    const { client, filters } = this.props;
    const newFilters = queryFilters || filters;

    this.setState({
      isLoading: !(this.state.competitorsData[id] && !isMultiple),
      competitorsVisibility: {
        ...this.state.competitorsVisibility,
        [id]: visibility,
      },
    });

    return client
      .query({
        query: shareOfVoiceCompetitorQuery,
        variables: {
          filters: newFilters,
          pagination: {
            page: 1,
            results: 25,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          competitorId: id,
        },
      })
      .then(({ data }) => {
        this.setState({
          competitorsData: {
            ...this.state.competitorsData,
            [id]: {
              domain,
              data: this.formatCompetitorData(data.keywords.overview.shareOfVoiceCompetitor),
            },
          },
          isLoading: isMultiple,
        });
      });
  };

  getTotalKeywords = (
    data: { [searchType: string]: Array<{ keywords: number }> },
    searchType: string,
  ): number => {
    if (!data) {
      return 0;
    }

    const sovData = data[searchType];
    if (!sovData) {
      return 0;
    }

    const lastSoVItem = last(sovData);
    if (!lastSoVItem) {
      return 0;
    }

    return lastSoVItem.keywords;
  };

  render() {
    const {
      stats,
      chartData,
      domainId,
      notes,
      domainInfo,
      className,
      period,
      onNoteSelect,
      onMultipleNotesSelect,
      showPercentage,
      competitorColors,
      competitorsItemsData,
      competitors,
    } = this.props;
    const {
      competitorsVisibility,
      competitorsData,
      isLoading,
      isSilentUpdate,
      isOwnDomainDesktopVisible,
      isOwnDomainMobileVisible,
    } = this.state;

    const totalDesktopKeywords = this.getTotalKeywords(chartData, 'desktop');
    const totalMobileKeywords = this.getTotalKeywords(chartData, 'mobile');

    return (
      <div className={cn('share-of-voice', className)}>
        <div className="menu">
          <div className="bottom-part">
            <LabelWithHelp
              helpTitle={t('Share of Voice')}
              help={t(
                'Share of Voice is an indicator of how your most important keywords are performing. All keywords that rank between positions 1 to 20 are used for the calculation. The average CTR for the position is multiplied by the search volume of each keyword, allowing you to see if a high traffic keyword is losing rank.',
              )}
            >
              {t('Share of Voice')}
            </LabelWithHelp>
          </div>
        </div>
        <div className="content">
          <div ref={this._exportContainer} className="chart-export-container">
            <div className="chart-export-container-chart">
              <Chart
                data={chartData}
                competitorsData={competitorsData}
                competitorsVisibility={competitorsVisibility}
                isOwnDomainDesktopVisible={isOwnDomainDesktopVisible}
                isOwnDomainMobileVisible={isOwnDomainMobileVisible}
                competitorColors={competitorColors}
                currentDomain={domainInfo && domainInfo.domain}
                notes={notes}
                onNoteSelect={onNoteSelect}
                onMultipleNotesSelect={onMultipleNotesSelect}
                isLoading={(isLoading || !graphqlOK(this.props)) && !isSilentUpdate}
                domainId={domainId}
                height={330}
                period={period}
                watermark
                watermarkBig
                exportContainer={this._exportContainer.current}
                showPercentage={showPercentage}
              />
            </div>
            <div className="chart-export-container-legend">
              {domainInfo &&
                domainInfo.domain && (
                  <DomainLegend
                    domain={domainInfo.domain}
                    isDesktopVisible={isOwnDomainDesktopVisible}
                    isMobileVisible={isOwnDomainMobileVisible}
                    onToggle={this.handleDomainLegendSelect}
                  />
                )}
              <CompetitorsLegend
                competitors={competitors}
                competitorColors={competitorColors}
                competitorsVisibility={competitorsVisibility}
                isLoading={competitorsItemsData.loading}
                onChange={this.handleCompetitorLegendSelect}
              />
            </div>
          </div>
          <div className="stats">
            <Stats
              data={stats}
              showPercentage={showPercentage}
              showMobile={totalMobileKeywords}
              showDesktop={totalDesktopKeywords}
            />
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
          searchType
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

const competitorsQuery = gql`
  query shareOfVoice_competitors(
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $filters: [FilterInput]!
    $fakeOrdering: OrderingInput!
    $fakePagination: PaginationInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        competitors {
          id
          domain
        }
        pagination {
          numResults
        }
      }
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);
const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  const periodFilter = periodFilterSelector(state);
  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    period: periodFilter && daysInPeriod(periodFilter),
    filters: state.filter.filterGroup.filters,
  };
};

const formatStatsData = (shareOfVoice: Array<any>) =>
  shareOfVoice.reduce((acc, shareOfVoiceItem) => {
    let type = 'nocategory';
    if (shareOfVoiceItem.searchType === 1) {
      type = 'desktop';
    } else if (shareOfVoiceItem.searchType === 2) {
      type = 'mobile';
    }

    acc[type] = {
      ...shareOfVoiceItem,
      searchType: type,
    };
    return acc;
  }, {});

export default compose(
  withApollo,
  connect(
    mapStateToProps,
    { showModal, registerOverviewComponent, overviewComponentLoaded },
  ),
  queryDomainInfo(),
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

      const stats = formatStatsData(shareOfVoice);
      const chartData = mapValues(stats, dataRow => dataRow.shareOfVoice);

      return {
        shareOfVoiceData: data,
        shareOfVoice,
        stats,
        chartData,
      };
    },
  }),
  graphql(competitorsQuery, {
    name: 'competitorsItemsData',
    options: props => {
      const { filters } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          fakePagination: {
            page: 1,
            results: 100, // competitors can't contain more than 10 rows
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          pagination: {
            page: 1,
            results: 100, // competitors can't contain more than 10 rows
          },
          ordering: {
            order: 'ASC',
            orderBy: 'domain',
          },
        },
      };
    },
    props: ({ competitorsItemsData, competitorsItemsData: { loading, keywords, error } }) => {
      if (loading || error) {
        return {
          competitorsItemsData,
          competitorColors: {},
          competitors: [],
        };
      }

      const {
        competitors: { competitors },
      } = keywords;

      return {
        competitorsItemsData,
        competitors,
        competitorColors: competitors.reduce((acc, competitor, idx) => {
          acc[competitor.id] = competitorColorsPalette[idx % competitorColorsPalette.length];
          return acc;
        }, {}),
      };
    },
  }),
)(ShareOfVoice);
