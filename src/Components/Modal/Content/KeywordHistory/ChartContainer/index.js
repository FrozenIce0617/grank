// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import { showModal } from 'Actions/ModalAction';
import { withApollo, compose, graphql } from 'react-apollo';
import Chart from '../Chart';
import type { CompetitorsVisibility, CompetitorColors } from 'Components/ShareOfVoice/Chart';
import DomainLegend from 'Pages/KeywordsOverview/ShareOfVoice/DomainLegend';
import CompetitorsLegend from 'Pages/KeywordsOverview/ShareOfVoice/CompetitorsLegend';
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';
import { MAX_NUMBER_OF_ROWS } from 'Types/Table';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import colorScheme from 'Utilities/colors';

const competitorColorsPalette = colorScheme.competitors;

type Props = {
  client: any,
  filters: any,
  keywordId: string,
  keyword: string,
  hideModal: Function,
  period: number,
  notes: Object[],
  notesData: Object,
  showModal: Function,
  ranksData: Object,

  competitors: Object,
  competitorColors: CompetitorColors,
  competitorsItemsData: Object,
};

type State = {
  domainVisibility: boolean,
  competitorsVisibility: CompetitorsVisibility,
  competitorsRanks: Object,
  isLoading: boolean,
};

const competitorRanksQuery = gql`
  query keywordHistoryChartContainer_keywordCompetitorsRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $competitors: [ID]!
    $keywordId: ID!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keyword(id: $keywordId) {
        id
        keyword
        ranks(competitors: $competitors) {
          id
          rank
          searchDate
          competitorRanks {
            id
            searchDate
            rank
          }
        }
      }
    }
  }
`;

class KeywordHistoryChartContainer extends Component<Props, State> {
  state = {
    competitorsRanks: {},
    isLoading: false,
    competitorsVisibility: {},
    domainVisibility: true,
  };

  handleCompetitorLegendSelect = (competitorId, domain, isVisible) => {
    const { client, filters, keywordId } = this.props;

    this.setState({
      isLoading: true,
      competitorsVisibility: {
        ...this.state.competitorsVisibility,
        [competitorId]: isVisible,
      },
    });

    client
      .query({
        fetchPolicy: 'network-only',
        query: competitorRanksQuery,
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
          competitors: [competitorId],
          keywordId,
        },
      })
      .then(({ data }) => {
        this.setState({
          competitorsRanks: {
            ...this.state.competitorsRanks,
            [competitorId]: {
              domain,
              data: data.keywords.keyword.ranks.map(item => item.competitorRanks[0]),
            },
          },
          isLoading: false,
        });
      });
  };

  handleBack = () => {
    const { keywordId, keyword } = this.props;
    this.props.showModal({
      modalType: 'KeywordHistory',
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

  render() {
    const {
      notesData,
      ranksData,
      period,
      notes,
      competitors,
      competitorColors,
      competitorsItemsData,
    } = this.props;
    const { competitorsVisibility, competitorsRanks, isLoading, domainVisibility } = this.state;

    const { ranks, domain, domainId } =
      ranksData && ranksData.keywords && ranksData.keywords.keyword
        ? {
            ranks: ranksData.keywords.keyword.ranks,
            domain: ranksData.keywords.keyword.domain.domain,
            domainId: ranksData.keywords.keyword.domain.id,
          }
        : {};

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
            isLoading={isLoading || ranksData.loading || notesData.loading}
            period={period}
            domain={domain}
            domainId={domainId}
          />
        </div>
        <div className="keyword-chart-export-container-legend">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {domain && (
              <DomainLegend
                domain={domain}
                isDesktopVisible={domainVisibility}
                isKeywordModal={true}
                onToggle={this.handleDomainLegendToggle}
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
      </div>
    );
  }
}

const competitorsQuery = gql`
  query keywordHistoryChartContainer_competitors(
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
      }
    }
  }
`;

const notesQuery = gql`
  query keywordHistoryChartContainer_keywordsNotes(
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
  query keywordHistoryChartContainer_keywordsRanks(
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
            results: 5,
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          pagination: {
            page: 1,
            results: MAX_NUMBER_OF_ROWS,
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
  graphql(ranksQuery, {
    name: 'ranksData',
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
)(KeywordHistoryChartContainer);
