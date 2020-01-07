// @flow
import React, { Component } from 'react';
import Icon from 'Pages/Keywords/Table/Icon';
import { t } from 'Utilities/i18n/index';
import FormatNumber from 'Components/FormatNumber';
import ClockIcon from 'icons/clock.svg?inline';

type Props = {
  competitorRanksData: Object,
  competitor: Object,
};

class CompetitorRankCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      nextProps.competitorRanksData !== this.props.competitorRanksData ||
      nextProps.competitor !== this.props.competitor
    );
  }

  formatRank = (rank: number) => {
    if (rank < 0) {
      return <Icon inline={true} icon={ClockIcon} tooltip={t('Waiting for ranking data')} />;
    }
    if (rank === null) {
      return t('Not in top 500');
    }
    return <FormatNumber>{rank}</FormatNumber>;
  };

  render() {
    const { competitorRanksData: data, competitor } = this.props;
    const competitorRanks = data.rank ? data.rank.competitorRanks || [] : [];
    const competitorRank = competitorRanks.find(rankObj => rankObj.competitor.id === competitor.id);
    return competitorRank ? this.formatRank(competitorRank.rank) : '-';
  }
}

export default CompetitorRankCell;
