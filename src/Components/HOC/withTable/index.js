// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { resetTable, changePage, changeNumberOfRows } from 'Actions/TableAction';
import { MAX_NUMBER_OF_ROWS } from 'Types/Table';
import type { TableProps } from 'Types/Table';
import LocalStorage from 'Utilities/storage';

const getStoragePropName = tableName => `table_props:${tableName}`;
const getTablePropName = tableName => (tableName ? `${tableName}TableProps` : 'tableProps');

const makeMapStateToProps = tableName => state => ({
  [getTablePropName(tableName)]: tableName ? state.table[tableName] : state.table,
});

type WithTableArgs = {
  sortField: string,
  descDefault: boolean,
  rowsDefault: 25,
};

type Props = {
  tableProps: TableProps,
  resetTable: typeof resetTable,
  changePage: typeof changePage,
  changeNumberOfRows: typeof changeNumberOfRows,
};

//Ignore first render to fix the issue: https://github.com/reactjs/react-redux/issues/210
export const withTable = (
  tableName: string,
  { sortField = '', descDefault = false, rowsDefault = 25 }: WithTableArgs = {},
) => (Component: React.ComponentType<*>) =>
  connect(
    makeMapStateToProps(tableName),
    { resetTable, changePage, changeNumberOfRows },
  )(
    class RenderTablePage extends React.Component<Props, { firstRender: boolean }> {
      lastTableProps: TableProps;

      state = {
        firstRender: true,
      };

      constructor(props) {
        super(props);

        const tableProps = this.props[getTablePropName(tableName)];
        if (!tableProps) {
          const tablePropsData = LocalStorage.get(getStoragePropName(tableName));
          if (tablePropsData) {
            const loadedTableProps = (JSON.parse(tablePropsData): TableProps);
            const numberOfRows =
              loadedTableProps.numberOfRows === MAX_NUMBER_OF_ROWS
                ? rowsDefault
                : loadedTableProps.numberOfRows;
            this.props.resetTable(
              loadedTableProps.sortField,
              loadedTableProps.sortOrder === 'desc',
              numberOfRows,
              0,
              50,
              tableName,
            );
          } else {
            this.props.resetTable(sortField || '', descDefault, rowsDefault, 0, 50, tableName);
          }
        } else {
          if (tableProps.numberOfRows === MAX_NUMBER_OF_ROWS) {
            this.props.changeNumberOfRows(rowsDefault, tableName);
          }
          this.props.changePage(1, tableName);
        }
      }

      componentDidMount() {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
          firstRender: false,
        });
      }

      UNSAFE_componentWillReceiveProps(nextProps: Props) {
        const tableProps = nextProps[getTablePropName(tableName)];
        if (this.lastTableProps !== tableProps) {
          LocalStorage.save(getStoragePropName(tableName), tableProps);
        }
      }

      render() {
        if (this.state.firstRender) {
          return null;
        }
        return <Component {...this.props} />;
      }
    },
  );

export default withTable;
