// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { roundNumber, formatDate } from 'Utilities/format';
import moment from 'moment';
import { t } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';

type Props = {
  metric: string,
  date: Date,
  data: any,
};

type State = {};

const renderCurrency = (num: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);

class MetricTable extends Component<Props, State> {
  static defaultProps = {
    data: [],
  };

  state = {};

  render() {
    if (underdash.graphqlLoading({ ...this.props })) {
      return <p>{t('Loading...')}</p>;
    }

    return (
      <div>
        <p>{t('Showing %s for %s', this.props.metric, formatDate(this.props.date))}</p>
        <table className="table">
          <tr>
            <th>{t('Organization')}</th>
            <th>{t('Joined')}</th>
            <th>{t('Current MRR')}</th>
            <th>{t('Current ARR')}</th>
            <th>{t('Prev. MRR')}</th>
            <th>{t('Prev. ARR')}</th>
            <th>{t('MRR Change')}</th>
            {/* <th>{t('NET')}</th> */}
          </tr>

          {this.props.data.map((e, index) => {
            return (
              <tr key={`MetricTable-${e.organization.id}-${index}`}>
                <td>
                  <Link to={`/sales/organization/${e.organization.id}`}>
                    #{e.organization.id} {e.organization.name}
                  </Link>
                </td>
                <td>
                  {moment(e.organization.dateAdded).fromNow()} ({new Date(
                    e.organization.dateAdded,
                  ).toDateString()})
                </td>
                <td>{renderCurrency(roundNumber(e.mrr))}</td>
                <td>{renderCurrency(roundNumber(e.mrr * 12))}</td>
                <td>{renderCurrency(roundNumber(e.beforeMrr))}</td>
                <td>{renderCurrency(roundNumber(e.beforeMrr * 12))}</td>
                <td>{renderCurrency(roundNumber(e.mrr - e.beforeMrr))}</td>
                {/* <td>{renderCurrency(roundNumber(e.netCashFlow))}</td> */}
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}

export default MetricTable;
