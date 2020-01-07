// @flow
import React, { Component } from 'react';
import DropdownList from 'Components/Controls/DropdownList';
import { t } from 'Utilities/i18n';

type Props = {
  rowsPerPage: number,
  totalRows: number,
  startingRow: number,
  endingRow: number,
  onChange: (page: number) => void,
};

class PageSelector extends Component<Props> {
  render() {
    const { startingRow, endingRow, rowsPerPage, totalRows } = this.props;
    const itemsCount =
      Math.floor(totalRows / rowsPerPage) + (totalRows % rowsPerPage === 0 ? 0 : 1);
    const items = Array(itemsCount)
      .fill()
      .map((_, index) => {
        const startRow = totalRows ? index * rowsPerPage + 1 : 0;
        const endRow = Math.min(startRow + rowsPerPage - 1, totalRows);
        return {
          value: index + 1,
          label: `${startRow} - ${endRow}`,
        };
      });
    return (
      <DropdownList
        className="page-selector"
        disabled={totalRows <= rowsPerPage}
        placeholder={t('%s - %s of %s', startingRow, endingRow, totalRows)}
        direction="up"
        right={true}
        items={items}
        onChange={this.props.onChange}
      />
    );
  }
}

export default PageSelector;
