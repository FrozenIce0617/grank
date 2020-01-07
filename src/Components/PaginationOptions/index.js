// @flow
import React, { Component } from 'react';
import DropdownList from 'Components/Controls/DropdownList';
import Pagination from 'Components/Pagination';
import { t } from 'Utilities/i18n/index';
import { connect } from 'react-redux';
import { changeNumberOfRows, changePage } from 'Actions/TableAction';
import './pagination-options.scss';
import { MAX_NUMBER_OF_ROWS } from 'Types/Table';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import { StickyIDs } from 'Types/Sticky';

type Props = {
  allRowsNumber?: number,
  tableName: string,
  totalRows: number,
  rowsPerPage: number,
  page: number,
  changePage: Function,
  changeNumberOfRows: Function,
};

class PaginationOptions extends Component<Props> {
  getPageCountOptions = () => {
    const { allRowsNumber } = this.props;
    return [10, 25, 50, 100, 250, !allRowsNumber ? MAX_NUMBER_OF_ROWS : allRowsNumber].map(
      value => ({
        value,
        label: t('%s rows', value === MAX_NUMBER_OF_ROWS ? t('All') : value),
      }),
    );
  };

  handleChangeNumberOfRows = newRowsPerPage => {
    const { tableName, page, rowsPerPage } = this.props;
    this.props.changeNumberOfRows(newRowsPerPage, tableName);

    const currentStartPage = rowsPerPage * (page - 1) + 1;
    const newPage = Math.floor(currentStartPage / newRowsPerPage) + 1;
    this.props.changePage(newPage, tableName);
  };

  render() {
    const { totalRows, rowsPerPage, tableName } = this.props;
    return (
      <Sticky
        showPlaceholder
        containerName={tableName}
        name={StickyIDs.items.PAGINATION}
        position="bottom"
      >
        {({ isSticky, style, getRef }) => (
          <div
            className={cn('pagination-options', { sticky: isSticky })}
            ref={getRef}
            style={style}
          >
            <span className="show-label">{t('Show')}</span>
            <DropdownList
              direction="up"
              right={false}
              items={this.getPageCountOptions()}
              value={rowsPerPage}
              onChange={this.handleChangeNumberOfRows}
            />
            <div className="spacer" />
            <Pagination totalRows={totalRows} tableName={tableName} />
          </div>
        )}
      </Sticky>
    );
  }
}

const mapStateToProps = (state, { tableName }) => {
  const tableProps = tableName ? state.table[tableName] : state.table;
  return {
    page: tableProps.page,
    rowsPerPage: tableProps.numberOfRows,
  };
};

export default connect(
  mapStateToProps,
  { changeNumberOfRows, changePage },
)(PaginationOptions);
