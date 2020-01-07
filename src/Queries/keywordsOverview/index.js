import averageRankQuery from './averageRank';
import shareOfVoiceQuery from './shareOfVoice';
import searchVolumeQuery from './searchVolume';
import analyticsVisitorsQuery from './analyticsVisitors';
import competitorsQuery from './competitors';
import keywordsTrackingQuery from './keywordsTracking';

const keywordsOverviewQueries = {
  averageRank: averageRankQuery(),
  shareOfVoice: shareOfVoiceQuery(),
  searchVolume: searchVolumeQuery(),
  analyticsVisitors: analyticsVisitorsQuery(),
  competitors: competitorsQuery(),
  keywordsTracking: keywordsTrackingQuery(),
};

export default keywordsOverviewQueries;
