// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { changeSorting } from 'Actions/TableAction';
import cn from 'classnames';

type TableProps = {
  sortOrder: 'asc' | 'desc' | null,
  sortField: string,
};

type Props = {
  column: string,
  children: React.Node,
  changeSorting: Function,
  tableProps: TableProps,
  tableName?: string,
  classNames?: string,
  descDefault: boolean,
  style?: Object,
};

class SortableHeader extends React.Component<Props> {
  static defaultProps = {
    descDefault: false,
  };

  handleClick = () => {
    const { column, descDefault, tableName } = this.props;
    this.props.changeSorting(column, descDefault, tableName);
  };

  render() {
    const {
      children,
      column,
      classNames,
      style,
      tableProps: { sortOrder, sortField },
    } = this.props;
    const className = cn(
      'sortable',
      {
        [`sorted ${sortOrder}`]: sortField === column && sortOrder,
      },
      classNames,
    );
    return (
      <th onClick={this.handleClick} className={className} style={style}>
        {children}
      </th>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { tableName } = props;
  return {
    tableProps: tableName ? state.table[tableName] : state.table,
  };
};

export default connect(
  mapStateToProps,
  { changeSorting },
)(SortableHeader);
