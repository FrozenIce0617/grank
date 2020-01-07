// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n';
import { uniq } from 'lodash';

const getGroupFieldsData = () => ({
  tags: {
    header: t('Tag'),
    groupFunc: (keywordData: Object) =>
      keywordData.tags && keywordData.tags.length ? uniq(keywordData.tags) : '',
    labelFunc: (groupId: string) => groupId || t('(untagged)'),
  },
  url: {
    header: t('URL'),
    groupFunc: (keywordData: Object) =>
      (keywordData.rank && keywordData.rank.highestRankingPage) || '',
    labelFunc: (groupId: string) => groupId || t('no URL'),
  },
  location: {
    header: t('Location'),
    groupFunc: (keywordData: Object) => keywordData.location,
    labelFunc: (groupId: string) => groupId || t('no location'),
  },
  country: {
    header: t('Country'),
    groupFunc: (keywordData: Object) =>
      `${keywordData.countrylocale.countryCode}::${keywordData.countrylocale.region}`,
    labelFunc: (groupId: string) => {
      const [countryCode, region] = groupId.split('::');
      return (
        <span>
          <span className={`flag-icon flag-icon-${countryCode.toLowerCase()}`} />
          {region}
        </span>
      );
    },
  },
  searchengine: {
    header: t('Search engine'),
    groupFunc: (keywordData: Object) => keywordData.searchEngine.name,
    labelFunc: (groupId: string) => groupId || t('no search engine'),
  },
  searchtype: {
    header: t('Search type'),
    groupFunc: (keywordData: Object) => keywordData.searchType,
    labelFunc: (groupId: string) => {
      if (groupId === 'A_1') {
        return t('Desktop');
      }
      if (groupId === 'A_2') {
        return t('Mobile');
      }
      return t('Total');
    },
  },
  competitor: {
    header: t('Competitor'),
    groupFunc: (keywordData: Object) => {
      if (keywordData.rank) {
        const competitorRanks = keywordData.rank.competitorRanks;
        return competitorRanks.map(
          rankData =>
            `${rankData.competitor.id}::${rankData.competitor.displayName ||
              rankData.competitor.domain}`,
        );
      }
      return null;
    },
    labelFunc: (groupId: string) => {
      const [, displayName] = groupId.split('::');
      return displayName;
    },
    idFunc: (groupId: string) => {
      const [id] = groupId.split('::');
      return id;
    },
  },
});

let groupFieldsData;

export const getGroupFieldData = (field: string) => {
  if (!groupFieldsData) {
    groupFieldsData = getGroupFieldsData();
  }
  return groupFieldsData[field];
};

const groupBy = (field: string, keywords: Object[]) => {
  const groupFunc = getGroupFieldData(field).groupFunc;
  const recordKeyword = (currentMap, keywordData, groupId) => {
    if (!currentMap[groupId]) {
      currentMap[groupId] = {
        groupId,
        keywords: [],
      };
    }
    currentMap[groupId].keywords.push(keywordData);
  };
  const groupsMap = keywords.reduce((currentMap, keywordData) => {
    const groupIds = groupFunc(keywordData);
    if (groupIds === null) {
      return currentMap;
    }
    if (Array.isArray(groupIds)) {
      groupIds.forEach(groupId => recordKeyword(currentMap, keywordData, groupId));
    } else {
      recordKeyword(currentMap, keywordData, groupIds);
    }
    return currentMap;
  }, {});
  const result = (Object.values(groupsMap): any);
  return result.sort((groupA, groupB) => {
    if (groupA.groupId === '') {
      return 1;
    }
    if (groupB.groupId === '') {
      return -1;
    }
    return groupA.groupId.localeCompare(groupB.groupId);
  });
};

export default groupBy;
