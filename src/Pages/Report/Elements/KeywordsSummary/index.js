// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import groupBy, { getGroupFieldData } from 'Pages/Report/groupBy';
import ElementsHeader from '../../ElementHeader';
import ValueDelta from 'Components/Table/TableRow/ValueDelta';
import SearchVolume from 'Components/Table/TableRow/SearchVolume';
import './keywords-summary.scss';
import colorScheme from 'Utilities/colors';

type Settings = {
  show_average_rank: { value: boolean },
  show_search_volume: { value: boolean },
  group_by: { value: string },
};

type Props = {
  onLoad: Function,
  loading: boolean,
  keywords: Object[],
  filters: FilterBase[],
  settings: Settings,
};

const colors = colorScheme.rankIntervals;

const rankIntervals = [
  { from: 1, to: 3, color: colors.ranks1_3 },
  { from: 4, to: 10, color: colors.ranks4_10 },
  { from: 11, to: 20, color: colors.ranks11_20 },
  { from: 21, to: 50, color: colors.ranks21_50 },
  { from: 51, to: 500, color: colors.ranks51_500 },
  { from: 501, to: Number.POSITIVE_INFINITY, color: colors.ranks501_rest },
];

const findRankIntervalIndex = (rank: number) => {
  const index = rankIntervals.findIndex(interval => rank <= interval.to && rank >= interval.from);
  return index === -1 ? rankIntervals.length - 1 : index;
};

const buildRankDistribution = (keywordsData: Object[]) => {
  const result = rankIntervals.map(({ color }, index) => ({
    id: index,
    color,
    keywordsCount: 0,
    rankChange: 0,
  }));
  keywordsData.forEach(keywordData => {
    const rank = keywordData.rank ? keywordData.rank.rank : 1000;
    const rankChange = keywordData.rank ? keywordData.rank.changes.rankChange : 0;
    const rankIndex = findRankIntervalIndex(rank);
    result[rankIndex].keywordsCount += 1;
    result[rankIndex].rankChange += rankChange;
  });
  return result;
};

const averageRank = (keywords: Object[]) => {
  const rankSum = keywords.reduce((currentRankSum, keywordData) => {
    const rank = keywordData.rank ? keywordData.rank.rank : 0;
    return currentRankSum + rank;
  }, 0);
  return Math.round(rankSum / keywords.length);
};

class KeywordsSummary extends React.Component<Props> {
  buildData = (keywords: Object[]) => {
    const field = this.props.settings.group_by.value;
    if (field) {
      const groups = groupBy(field, keywords);
      const labelFunc = getGroupFieldData(field).labelFunc;
      return groups.map(group => ({
        id: group.groupId,
        groupLabel: labelFunc(group.groupId),
        keywordsCount: group.keywords.length,
        searchVolume: group.keywords.searchVolume
          ? group.keywords.reduce(
              (acc, keywordData) => acc + keywordData.searchVolume.searchVolume,
              0,
            )
          : 0,
        averageRank: averageRank(group.keywords),
        rankingDistribution: buildRankDistribution(group.keywords),
      }));
    }
    return keywords.map(keywordData => ({
      id: keywordData.id,
      groupLabel: keywordData.keyword,
      keywordsCount: 1,
      searchVolume: keywordData.searchVolume ? keywordData.searchVolume.searchVolume : null,
      averageRank: keywordData.rank ? keywordData.rank.rank : '-',
      rankingDistribution: buildRankDistribution([keywordData]),
    }));
  };

  renderHead = () => {
    const showSearchVolume = this.props.settings.show_search_volume.value;
    const show_average_rank = this.props.settings.show_average_rank.value;
    const groupByLabel = this.props.settings.group_by.value
      ? getGroupFieldData(this.props.settings.group_by.value).header
      : '';
    return (
      <thead>
        <tr>
          <th className="group-label" scope="col">
            {groupByLabel || t('Keyword')}
          </th>
          {groupByLabel ? <th scope="col">{t('Keywords')}</th> : null}
          {showSearchVolume ? <th scope="col">{t('Search volume')}</th> : null}
          {show_average_rank ? <th scope="col">{t('Avg. rank')}</th> : null}
          <th scope="col">{t('1-3')}</th>
          <th scope="col">{t('4-10')}</th>
          <th scope="col">{t('11-20')}</th>
          <th scope="col">{t('21-25')}</th>
          <th scope="col">{t('51-500')}</th>
          <th>{t('Unranked')}</th>
        </tr>
      </thead>
    );
  };

  renderRow = (itemData: Object) => {
    const isGrouped = !!this.props.settings.group_by.value;
    const showSearchVolume = this.props.settings.show_search_volume.value;
    const showAverageRank = this.props.settings.show_average_rank.value;
    return (
      <tr key={itemData.id}>
        <td className="group-label">{itemData.groupLabel}</td>
        {isGrouped && <td>{itemData.keywordsCount}</td>}
        {showSearchVolume && (
          <td>
            <SearchVolume searchVolume={itemData.searchVolume} />
          </td>
        )}
        {showAverageRank && <td>{itemData.averageRank || '-'}</td>}
        {itemData.rankingDistribution.map(({ keywordsCount, rankChange, color, id }) => (
          <td key={id} style={{ borderBottom: `2px solid ${color}` }}>
            {keywordsCount} ( <ValueDelta delta={rankChange} /> )
          </td>
        ))}
      </tr>
    );
  };

  renderBody = () => {
    const keywords = this.buildData(this.props.keywords);
    return <tbody>{keywords.map(keywordData => this.renderRow(keywordData))}</tbody>;
  };

  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();
    const isGrouped = !!this.props.settings.group_by.value;
    let title = t('Keywords summary');
    if (isGrouped) {
      const groupByLabel = getGroupFieldData(this.props.settings.group_by.value).header;
      title = t('Keywords summary by %s', groupByLabel);
    }
    return (
      <div className="keywords-summary">
        <ElementsHeader title={title} filters={this.props.filters} />
        <table className="data-table table">
          {this.renderHead()}
          {this.renderBody()}
        </table>
      </div>
    );
  }
}

const keywordsQuery = gql`
  query keywordsSummary_keywords(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        keyword
        location
        tags
        searchType
        searchEngine {
          id
          name
          icon
        }
        searchVolume {
          id
          searchVolume
        }
        countrylocale {
          id
          countryCode
          region
          locale
        }
        rank {
          id
          rank
          highestRankingPage
          changes {
            rankChange
          }
        }
      }
    }
  }
`;

export default graphql(keywordsQuery, {
  options: (props: Props) => {
    const { filters } = props;
    return {
      fetchPolicy: 'network-only',
      variables: {
        filters,
        pagination: {
          page: 1,
          results: 99999,
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
})(KeywordsSummary);
