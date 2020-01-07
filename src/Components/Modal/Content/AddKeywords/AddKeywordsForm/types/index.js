// @flow
import type { SearchType } from 'Types/Filter';

export type SearchEngine = {
  id: string,
  searchTypes: SearchType[],
};

export type KeywordSettings = {
  starred: boolean,
  ignoreLocalResults: boolean,
  ignoreFeaturedSnippet: boolean,
  ignoreInShareOfVoice: boolean,
};
