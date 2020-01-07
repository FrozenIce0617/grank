// @flow
import React, { Component } from 'react';
import RankDistribution from 'Components/RankDistribution';

type Props = {
  domainId: string,
  rankingDistributionData: Object,
};

class RankingDistributionCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      nextProps.rankingDistributionData !== this.props.rankingDistributionData ||
      nextProps.domainId !== this.props.domainId
    );
  }

  render() {
    const { domainId, rankingDistributionData } = this.props;
    return (
      <RankDistribution
        linkable
        domainId={domainId}
        rankingDistribution={rankingDistributionData}
      />
    );
  }
}

export default RankingDistributionCell;
