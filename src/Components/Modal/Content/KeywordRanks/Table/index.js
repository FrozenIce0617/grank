// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n';
import { Table } from 'reactstrap';
import moment from 'moment';
import { uniqueId } from 'lodash';

type Props = {
  keyword: Object,
};

class RanksTable extends React.Component<Props> {
  renderRows() {
    const rows = [];
    let highestRankingPageLink;
    let protocol;
    if (this.props.keyword.rank.highestRankingPage) {
      const el = document.createElement('a');
      el.href = this.props.keyword.rank.highestRankingPage;
      protocol = el.protocol.replace(':', '');
      highestRankingPageLink = (
        <a href={this.props.keyword.rank.highestRankingPage} target="_blank">
          {el.pathname}
        </a>
      );
    } else {
      highestRankingPageLink = <span>-</span>;
      protocol = '';
    }

    rows.push(
      <tr key={uniqueId('rank-table-row')}>
        <td>{moment(this.props.keyword.rank.searchDate).format('DD MMMM YYYY h:mm')}</td>
        <td>{this.props.keyword.rank.rank}</td>
        <td>{protocol}</td>
        <td>{highestRankingPageLink}</td>
      </tr>,
    );

    this.props.keyword.rank.extraRanks.forEach(rank => {
      const el = document.createElement('a');
      el.href = rank[1];

      rows.push(
        <tr key={uniqueId('rank-table-row')}>
          <td />
          <td>{rank[0]}</td>
          <td>{el.protocol.replace(':', '')}</td>
          <td>
            <a href={rank[1]} target="_blank">
              {el.pathname}
            </a>
          </td>
        </tr>,
      );
    });
    return rows;
  }

  render() {
    return (
      <Table className="data-table">
        <thead>
          <tr>
            <th>{t('Search Date')}</th>
            <th>{t('Rank')}</th>
            <th>{t('Protocol')}</th>
            <th>{t('URL')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows()}</tbody>
      </Table>
    );
  }
}

export default RanksTable;
