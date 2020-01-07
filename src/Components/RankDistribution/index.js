// @flow
import * as React from 'react';
import Distribution from 'Components/Distribution';
import { t } from 'Utilities/i18n/index';
import './rank-distribution.scss';

type Props = {
  domainId: string,
  rankingDistribution: Object,
  linkable?: boolean,
};

const RANGE_1 = '1-3';
const RANGE_2 = '4-10';
const RANGE_3 = '11-20';
const RANGE_4 = '21-50';
const RANGE_5 = '51-500';
const RANGE_6 = 'Not ranking';

const keys = [
  'keywords0To3',
  'keywords4To10',
  'keywords11To20',
  'keywords21To50',
  'keywordsAbove50',
  'keywordsUnranked',
];

class RankDistribution extends React.Component<Props> {
  ranges = [RANGE_1, RANGE_2, RANGE_3, RANGE_4, RANGE_5, RANGE_6];
  labels = [
    t('Top %s', RANGE_1),
    t('Top %s', RANGE_2),
    t('Top %s', RANGE_3),
    t('Top %s', RANGE_4),
    t('Top %s', RANGE_5),
    t(RANGE_6),
  ];

  render() {
    const { rankingDistribution: rd, domainId, linkable } = this.props;

    const items = keys.map((key, index) => ({
      id: `ranking-distribution-${domainId}-total-${index}`,
      label: `${this.labels[index]}: ${rd[key]} (${parseFloat(
        (rd[key] / rd.keywordsTotal) * 100,
      ).toFixed(1)}%)`,
      value: rd[key],
      range: this.ranges[index],
      domainId,
    }));

    return (
      <div className="rank-distribution">
        <Distribution linkable={linkable} items={items} />
      </div>
    );
  }
}

export default RankDistribution;
