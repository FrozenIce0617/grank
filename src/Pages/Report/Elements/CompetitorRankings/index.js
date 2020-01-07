// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import groupBy, { getGroupFieldData } from 'Pages/Report/groupBy';
import RankOptions from 'Components/Table/TableRow/RankOptions';
import LocationCell from 'Components/Table/TableRow/LocationCell';
import ElementsHeader from '../../ElementHeader';
import ValueDelta from 'Components/Table/TableRow/ValueDelta';

type Props = {
  onLoad: Function,
  loading: boolean,
  keywords: Object[],
  filters: FilterBase[],
};

class CompetitorRankings extends React.Component<Props> {
  renderHeader = groupId => {
    const labelFunc = getGroupFieldData('competitor').labelFunc;
    return (
      <thead key={`head-${groupId}`}>
        <tr>
          <th scope="col">{labelFunc(groupId)}</th>
          <th scope="col" className="thin-cell">
            {}
          </th>
          <th scope="col">{t('Location')}</th>
          <th scope="col">{t('URL')}</th>
          <th scope="col">{t('Rank')}</th>
          <th scope="col">{t('Your rank')}</th>
          <th scope="col">{t('Diff +/-')}</th>
        </tr>
      </thead>
    );
  };

  renderRow = (keywordData, groupId) => {
    const idFunc = getGroupFieldData('competitor').idFunc;
    const competitorId = idFunc(groupId);

    const { countrylocale: { countryCode, region, locale } = {}, location } = keywordData;
    const yourRank = keywordData.rank.rank;
    const competitorRankData = keywordData.rank.competitorRanks.find(
      rankData => rankData.competitor.id === competitorId,
    );
    const competitorRank = competitorRankData ? competitorRankData.rank : 0;
    const competitorURL = (competitorRankData && competitorRankData.highestRankingPage) || '-';
    const diff = yourRank ? yourRank - competitorRank : '-';
    return (
      <tr key={keywordData.id}>
        <td>{keywordData.keyword}</td>
        <td className="thin-cell">
          <RankOptions keywordData={keywordData} />
        </td>
        <td>
          <LocationCell
            countryCode={countryCode}
            region={region}
            locale={locale}
            location={location}
          />
        </td>
        <td>{competitorURL}</td>
        <td>{competitorRank}</td>
        <td>{yourRank || 'Not in top'}</td>
        <td>
          <ValueDelta delta={Number(diff)} />
        </td>
      </tr>
    );
  };

  renderGroup({ groupId, keywords }) {
    return [
      this.renderHeader(groupId),
      <tbody key={groupId}>
        {keywords.map(keywordData => this.renderRow(keywordData, groupId))}
      </tbody>,
    ];
  }

  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();
    const groups = groupBy('competitor', this.props.keywords);
    return (
      <div className="competitors-rankings">
        <ElementsHeader title={t('Competitor rankings')} filters={this.props.filters} />
        <table className="data-table table">{groups.map(group => this.renderGroup(group))}</table>
      </div>
    );
  }
}

const competitorsQuery = gql`
  query competitorRankings_keywords(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        keyword
        location
        countrylocale {
          id
          countryCode
          region
          locale
        }
        rank {
          competitorRanks {
            competitor {
              id
              domain
              displayName
            }
            highestRankingPage
            rank
          }
          id
          rank
        }
        searchType
        searchEngine {
          id
          name
          icon
        }
      }
    }
  }
`;

export default graphql(competitorsQuery, {
  options: (props: Props) => {
    const { filters } = props;
    return {
      fetchPolicy: 'network-only',
      variables: {
        filters,
        pagination: {
          page: 1,
          results: 100,
        },
        ordering: {
          order: 'ASC',
          orderBy: 'keyword',
        },
      },
    };
  },
  props: ({ ownProps, data: { loading, keywords } }) => ({
    ...ownProps,
    loading,
    keywords: keywords ? keywords.keywords : [],
  }),
})(CompetitorRankings);
