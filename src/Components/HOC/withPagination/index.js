// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';

import { changePage } from 'Actions/TableAction';

const mapStateToProps = (state, { tableName }) => {
  const tableProps = tableName ? state.table[tableName] : state.table;
  return {
    page: tableProps.page,
    rowsPerPage: tableProps.numberOfRows,
  };
};

type Props = {
  changePage: Function,
  page: number,
  tableName?: string,
  totalRows: number,
  rowsPerPage: number,
};

const withPagination = (Component: React.ComponentType<Props>) =>
  connect(
    mapStateToProps,
    { changePage },
  )(
    class WithPagination extends React.Component<Props> {
      handleNextPage = () => {
        const { page, tableName } = this.props;
        this.props.changePage(page + 1, tableName);
      };

      handlePrevPage = () => {
        const { page, tableName } = this.props;
        this.props.changePage(page - 1, tableName);
      };

      goToPage = (page: number) => {
        this.props.changePage(page, this.props.tableName);
      };

      render() {
        const { page, rowsPerPage, totalRows } = this.props;
        const startingRow = totalRows ? (page - 1) * rowsPerPage + 1 : 0;
        const endingRow = Math.min(totalRows, page * rowsPerPage);
        const hasPrev = page > 1;
        const hasNext = totalRows - endingRow > 0;

        return (
          <Component
            startingRow={startingRow}
            endingRow={endingRow}
            hasPrev={hasPrev}
            hasNext={hasNext}
            goToPage={this.goToPage}
            onNext={hasNext ? this.handleNextPage : noop}
            onPrev={hasPrev ? this.handlePrevPage : noop}
            {...this.props}
          />
        );
      }
    },
  );

export default withPagination;
