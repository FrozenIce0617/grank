// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import groupBy, { getGroupFieldData } from 'Pages/Report/groupBy';
import RankOptions from 'Components/Table/TableRow/RankOptions';
import RankCell from 'Components/Table/TableRow/RankCell';
import ElementsHeader from '../../ElementHeader';
import LocationCell from 'Components/Table/TableRow/LocationCell';
import ValueDelta from 'Components/Table/TableRow/ValueDelta';
import ValueBar from 'Components/Table/TableRow/ValueBar';
import FormatNumber from 'Components/FormatNumber';
import SearchVolume from 'Components/Table/TableRow/SearchVolume';

type Settings = {
  show_visits_potential: { value: boolean },
  show_search_volume: { value: boolean },
  show_rank_features: { value: boolean },
  show_all_ranks: { value: boolean },
  show_start_date_rank: { value: boolean },
  show_initial_rank: { value: boolean },
  order_by: { value: string },
  group_by: { value: string },
};

type Props = {
  onLoad: Function,
  loading: boolean,
  keywords: Array<Object>,
  filters: FilterBase[],
  settings: Settings,
};

type ShowSettings = {
  features: boolean,
  visitsPotential: boolean,
  initialRank: boolean,
  startDateRank: boolean,
  searchVolume: boolean,
  showExtraRanks: boolean,
};

const formatPercent = (value: number) => Math.round(value * 100);

const sortFunctions = {
  keyword: (keywordA: Object, keywordB: Object) => keywordA.keyword.localeCompare(keywordB.keyword),
  rank: (keywordA: Object, keywordB: Object) => {
    const rankA = (keywordA.rank && keywordA.rank.rank) || Number.MAX_SAFE_INTEGER;
    const rankB = (keywordB.rank && keywordB.rank.rank) || Number.MAX_SAFE_INTEGER;
    return rankA - rankB;
  },
  searchvolume: (keywordA: Object, keywordB: Object) => {
    const searchVolumeA =
      (keywordA.searchVolume && keywordA.searchVolume.searchVolume) || Number.MAX_SAFE_INTEGER;
    const searchVolumeB =
      (keywordB.searchVolume && keywordB.searchVolume.searchVolume) || Number.MAX_SAFE_INTEGER;
    return searchVolumeB - searchVolumeA;
  },
  visits: (keywordA: Object, keywordB: Object) => {
    const visitsA = keywordA.rank ? keywordA.rank.analyticsVisitors : Number.POSITIVE_INFINITY;
    const visitsB = keywordB.rank ? keywordB.rank.analyticsVisitors : Number.POSITIVE_INFINITY;
    return visitsB - visitsA;
  },
  potential: (keywordA: Object, keywordB: Object) => {
    const potentialA = keywordA.rank ? keywordA.rank.analyticsPotential : Number.POSITIVE_INFINITY;
    const potentialB = keywordB.rank ? keywordB.rank.analyticsPotential : Number.POSITIVE_INFINITY;
    return potentialB - potentialA;
  },
};

class KeywordsList extends React.Component<Props> {
  renderHead = (show: ShowSettings) => (
    <thead>
      <tr>
        <th>{t('Keyword')}</th>
        {show.features && <th className="thin-cell">{''}</th>}
        <th>{t('Location')}</th>
        {show.initialRank && <th className="text-right">{t('Initial rank')}</th>}
        <th className="text-right">{t('Current rank')}</th>
        {show.startDateRank && <th className="text-right">{t('Start date rank')}</th>}
        <th className="text-right">{t('Change +/-')}</th>
        <th>{t('URL')}</th>
        {show.searchVolume && <th className="text-right">{t('Searches')}</th>}
        {show.visitsPotential && <th className="text-right">{t('Visits')}</th>}
        {show.visitsPotential && <th>{t('Potential')}</th>}
      </tr>
    </thead>
  );

  renderExtraRow = (rank: string, url: string, id: string, show: ShowSettings) => (
    <tr key={`${id}-${url}`} className="extra-rank-row">
      <td>{}</td>
      {show.features && <td className="thin-cell">{}</td>}
      <td>{}</td>
      {show.initialRank && <td className="text-right">{}</td>}
      <td className="text-right">{rank}</td>
      {show.startDateRank && <td className="text-right">{}</td>}
      <td>{}</td>
      <td>{url || '-'}</td>
      {show.searchVolume && <td className="text-right">{}</td>}
      {show.visitsPotential && <td className="text-right">{}</td>}
      {show.visitsPotential && <td className="align-middle">{}</td>}
    </tr>
  );

  renderRow = (keywordData: Object, groupId: string, show: ShowSettings) => {
    const rank = keywordData.rank || {
      rank: -1,
      changes: {},
      extraRanks: null,
      analyticsVisitors: '-',
      analyticsPotential: 0,
      highestRankingPage: '',
    };
    const { countrylocale: { countryCode, region, locale } = {}, location } = keywordData;

    let result = (
      <tr key={keywordData.id}>
        <td>{keywordData.keyword}</td>
        {show.features && <td>{<RankOptions keywordData={keywordData} />}</td>}
        <td>
          <LocationCell
            countryCode={countryCode}
            region={region}
            locale={locale}
            location={location}
          />
        </td>
        {show.initialRank &&
          keywordData.initialRank && (
            <td className="text-right">
              <FormatNumber>{keywordData.initialRank.rank}</FormatNumber>
            </td>
          )}
        <td className="text-right">
          <RankCell keywordData={keywordData} rank={rank.rank} />
        </td>
        {show.startDateRank && (
          <td className="text-right">
            <FormatNumber>{keywordData.ranks && keywordData.ranks[0].rank}</FormatNumber>
          </td>
        )}
        <td className="text-right">
          <ValueDelta delta={rank.changes.rankChange} />
        </td>
        <td>{rank.highestRankingPage || '-'}</td>
        {show.searchVolume && (
          <td className="text-right">
            <SearchVolume
              keywordData={keywordData}
              searchVolume={keywordData.searchVolume && keywordData.searchVolume.searchVolume}
            />
          </td>
        )}
        {show.visitsPotential && (
          <td className="text-right">
            <FormatNumber>{rank.analyticsVisitors}</FormatNumber>
          </td>
        )}
        {show.visitsPotential && (
          <td className="align-middle">
            <ValueBar checkmarkOnComplete value={rank.analyticsPotential} />
          </td>
        )}
      </tr>
    );
    if (show.showExtraRanks && rank.extraRanks && rank.extraRanks.length) {
      const extraRows = rank.extraRanks.map(([extraRank, url]) =>
        this.renderExtraRow(extraRank, url, keywordData.id, show),
      );
      result = [result, ...extraRows];
    }
    return result;
  };

  renderGroup = ({ keywords, groupId }, show: ShowSettings) => {
    const groupFieldData = getGroupFieldData(this.props.settings.group_by.value);
    let header = t('Keywords');
    if (groupFieldData) {
      header = `${t('Keywords for')} "${groupFieldData.labelFunc(groupId)}"`;
    }
    return (
      <div key={`group-${groupId}`}>
        <ElementsHeader title={header} filters={this.props.filters} />
        <table className="data-table table">
          {this.renderHead(show)}
          <tbody>{keywords.map(keywordData => this.renderRow(keywordData, groupId, show))}</tbody>
        </table>
      </div>
    );
  };

  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();
    let keywords = this.props.keywords;
    if (this.props.settings.order_by.value) {
      keywords = keywords.slice().sort(sortFunctions[this.props.settings.order_by.value]);
    }
    let groups = [
      {
        groupId: '',
        keywords,
      },
    ];
    if (this.props.settings.group_by.value) {
      groups = groupBy(this.props.settings.group_by.value, keywords);
    }
    const settings = this.props.settings;
    const show = {
      features: settings.show_rank_features && settings.show_rank_features.value,
      visitsPotential: settings.show_visits_potential && settings.show_visits_potential.value,
      initialRank: settings.show_initial_rank && settings.show_initial_rank.value,
      startDateRank: settings.show_start_date_rank && settings.show_start_date_rank.value,
      searchVolume: settings.show_search_volume && settings.show_search_volume.value,
      showExtraRanks: settings.show_all_ranks && settings.show_all_ranks.value,
    };
    return (
      <div className="keywords-list">{groups.map(group => this.renderGroup(group, show))}</div>
    );
  }
}

const keywordsQuery = gql`
  query keywordsList_keywords(
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
        searchType
        searchEngine {
          id
          name
          icon
        }
        ranks {
          rank
        }
        rank {
          id
          changes {
            rankChange
          }
          extraRanks
          analyticsPotential
          analyticsVisitors
          highestRankingPage
          rank
          shareOfVoice
        }
        initialRank {
          rank
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
})(KeywordsList);
