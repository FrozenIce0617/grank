// @flow
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import cn from 'classnames';

import NextPage from 'icons/arrow-head-down.svg?inline';
import PrevPage from 'icons/arrow-head-up.svg?inline';

import { withPagination } from 'Components/HOC';

import './chart-pagination.scss';

type Props = {
  page: number,
  totalRows: number,
  rowsPerPage: number,
  hasPrev: boolean,
  hasNext: boolean,
  onNext: Function,
  onPrev: Function,
};

class ChartPagination extends Component<Props> {
  render() {
    const { onNext, onPrev, page, totalRows, hasNext, hasPrev, rowsPerPage } = this.props;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    return (
      <div className="chart-pagination">
        <Icon
          className={cn('pagination-prev-page', {
            'pagination-disabled': !hasPrev,
          })}
          icon={PrevPage}
          onClick={onPrev}
        />
        <span className="pagination-content">{`${page} / ${totalPages}`}</span>
        <Icon
          className={cn('pagination-next-page', {
            'pagination-disabled': !hasNext,
          })}
          icon={NextPage}
          onClick={onNext}
        />
      </div>
    );
  }
}

export default withPagination(ChartPagination);
