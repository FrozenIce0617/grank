// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withApollo, compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { values, mapValues } from 'lodash';
import { hideModal, showModal } from 'Actions/ModalAction';
import Chart from 'Components/Modal/Content/KeywordHistory/Chart';
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';
import { MAX_NUMBER_OF_ROWS } from 'Types/Table';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';

import type { Competitor, Rank } from 'Components/Modal/Content/KeywordHistory/Chart';
import DomainLegend from 'Pages/KeywordsOverview/ShareOfVoice/DomainLegend';
import CompetitorsLegend from 'Pages/KeywordsOverview/ShareOfVoice/CompetitorsLegend';
import type { CompetitorColors, CompetitorsVisibility } from 'Components/ShareOfVoice/Chart';
import colorScheme from 'Utilities/colors';

const competitorColorsPalette = colorScheme.competitors;

type Props = {
  keywordId: string,
  keyword: string,

  // automatic
  hideModal: Function,
  period: number,
  notes: Object[],
  notesData: Object,
  showModal: Function,
  ranksData: Object,
  ranks: Rank[],
  domain: string,
  domainId: string,
  competitors: Competitor[],
  competitorsRanks: Rank[],
  competitorColors: CompetitorColors,
};

type State = {
  competitorsVisibility: CompetitorsVisibility,
  domainVisibility: boolean,
};

class TopCompetitorsChartContainer extends Component<Props, State> {
  state = {
    competitorsVisibility: {},
    domainVisibility: true,
  };

  handleBack = () => {
    const { keywordId, keyword } = this.props;
    this.props.showModal({
      modalType: 'KeywordInfo',
      modalProps: {
        keywordId,
        keyword,
      },
    });
  };

  handleNoteSelect = noteId => {
    this.props.showModal({
      modalType: 'EditNote',
      modalProps: {
        theme: 'light',
        noteId,
        onBack: this.handleBack,
      },
    });
  };

  handleMultipleNotesSelect = notes => {
    this.props.showModal({
      modalType: 'EditNotes',
      modalProps: {
        theme: 'light',
        notes,
        onBack: this.handleBack,
      },
    });
  };

  handleDomainLegendToggle = () => {
    const { domainVisibility: isDesktop } = this.state;
    this.setState({
      domainVisibility: !isDesktop,
    });
  };

  handleCompetitorLegendSelect = (competitorId, domain, isVisible) => {
    this.setState({
      isLoading: true,
      competitorsVisibility: {
        ...this.state.competitorsVisibility,
        [competitorId]: isVisible,
      },
    });
  };

  render() {
    const { competitorsVisibility, domainVisibility } = this.state;

    const {
      ranksData,
      period,
      notes,
      ranks,
      domain,
      competitors,
      competitorsRanks,
      notesData,
      domainId,
      competitorColors,
    } = this.props;

    return (
      <div className="keyword-chart-export-container">
        <div className="keyword-chart-export-container-chart">
          <Chart
            data={ranks}
            notes={notes}
            onNoteSelect={this.handleNoteSelect}
            onMultipleNotesSelect={this.handleMultipleNotesSelect}
            competitors={competitors}
            competitorsData={competitorsRanks}
            competitorColors={competitorColors}
            competitorsVisibility={competitorsVisibility}
            domainVisibility={domainVisibility}
            isLoading={ranksData.loading || notesData.loading}
            period={period}
            domain={domain}
            domainId={domainId}
          />
        </div>
        <div className="keyword-chart-export-container-legend">
          {domain && (
            <DomainLegend
              domain={domain}
              isDesktopVisible={domainVisibility}
              isKeywordModal
              onToggle={this.handleDomainLegendToggle}
            />
          )}
          <CompetitorsLegend
            competitors={competitors}
            competitorColors={competitorColors}
            competitorsVisibility={competitorsVisibility}
            isLoading={ranksData.loading}
            onChange={this.handleCompetitorLegendSelect}
          />
        </div>
      </div>
    );
  }
}

const notesQuery = gql`
  query topCompetitorsChartContainer_keywordsNotes(
    $filters: [FilterInput]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      overview {
        notes {
          id
          createdAt
          user {
            id
            fullName
          }
          note
          keywords {
            id
          }
        }
      }
    }
  }
`;

const ranksQuery = gql`
  query topCompetitorsChartContainer_keywordsRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $keywordId: ID!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keyword(id: $keywordId) {
        id
        domain {
          id
          domain
        }
        ranks(competitors: []) {
          id
          rank
          searchDate
          unknownCompetitorRanks {
            id
            rank
            unknownCompetitor {
              id
              domain
            }
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
    filters: RequiredFiltersSelector(state),
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

export default compose(
  withApollo,
  connect(
    mapStateToProps,
    { showModal, hideModal },
  ),
  graphql(ranksQuery, {
    options: props => {
      const { filters, keywordId } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          pagination: {
            page: 1,
            results: MAX_NUMBER_OF_ROWS,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          keywordId,
        },
      };
    },
    props: ({ ownProps, data, data: { keywords, loading, error } }) => {
      let result: Object;
      if (!(loading || error) && keywords && keywords.keyword) {
        const competitorsRanksMap = keywords.keyword.ranks.reduce((acc, rankObj) => {
          rankObj.unknownCompetitorRanks.forEach(competitorRank => {
            const competitor = competitorRank.unknownCompetitor;
            if (acc[competitor.id]) {
              acc[competitor.id].ranks.push({
                ...competitorRank,
                searchDate: rankObj.searchDate,
              });
            } else {
              acc[competitor.id] = {
                competitor,
                ranks: [],
              };
            }
          });
          return acc;
        }, {});

        const competitorsRanksValues = values(competitorsRanksMap);
        const competitors = competitorsRanksValues.map(value => value.competitor);

        const competitorColors = competitors.reduce((acc, competitor, idx) => {
          acc[competitor.id] = competitorColorsPalette[idx % competitorColorsPalette.length];
          return acc;
        }, {});

        result = {
          ranks: keywords.keyword.ranks,
          domain: keywords.keyword.domain.domain,
          domainId: keywords.keyword.domain.id,
          competitors,
          competitorColors,
          competitorsRanks: mapValues(competitorsRanksMap, value => ({
            data: value.ranks,
            domain: value.competitor.domain,
          })),
        };
      } else {
        result = {
          competitors: [],
          competitorColors: {},
        };
      }

      return {
        ...ownProps,
        ranksData: data,
        ...result,
      };
    },
  }),
  graphql(notesQuery, {
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
    props: ({ ownProps, data, data: { keywords, loading, error } }) => ({
      ...ownProps,
      notesData: data,
      notes: (!(loading || error) && keywords && keywords.overview
        ? keywords.overview.notes
        : []
      ).filter(note => note.keywords.find(({ id }) => id === ownProps.keywordId)),
    }),
  }),
)(TopCompetitorsChartContainer);
