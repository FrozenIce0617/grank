// @flow
import React, { Component } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import BackwardIcon from 'icons/chevron-backward.svg?inline';
import ForwardIcon from 'icons/chevron-forward.svg?inline';
import { withPagination } from 'Components/HOC';
import PageSelector from './PageSelector';

import './pagination.scss';

type Props = {
  startingRow: number,
  endingRow: number,
  totalRows: number,
  page: number,
  rowsPerPage: number,
  hasPrev: boolean,
  hasNext: boolean,
  onNext?: Function,
  onPrev?: Function,
  goToPage: (page: number) => void,
};

class Pagination extends Component<Props> {
  render() {
    const {
      startingRow,
      endingRow,
      page,
      rowsPerPage,
      onNext,
      onPrev,
      hasPrev,
      hasNext,
      totalRows,
    } = this.props;
    return (
      <div className="pagination">
        <PageSelector
          startingRow={startingRow}
          endingRow={endingRow}
          page={page}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onChange={this.props.goToPage}
        />
        <ButtonGroup>
          <Button onClick={onPrev} disabled={!hasPrev}>
            <BackwardIcon className="icon" />
          </Button>
          <Button onClick={onNext} disabled={!hasNext}>
            <ForwardIcon className="icon" />
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

export default withPagination(Pagination);
