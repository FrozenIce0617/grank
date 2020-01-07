// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeSorting } from 'Actions/TableAction';
import FilterCell from 'Components/InfiniteTable/Cells/FilterCell';
import Checkbox from 'Components/Controls/Checkbox';
import ReactGA from 'react-ga';
import { UncontrolledTooltip } from 'reactstrap';
import './header-cell.scss';
import Ellipsis from 'Components/Ellipsis';
import cn from 'classnames';

type Props = {
  id: string,
  tableName: string,
  label: string,
  scrollXContainer: Element | null,
  fixed: boolean,
  fixedOffset: number,

  // optional
  tooltip?: string,
  sortField?: string,
  hideLabel?: boolean,
  hideFilter?: boolean,
  filterAttributes?: string[],
  descDefault?: boolean,
  className?: string,
  onSelectAllChange?: Function,
  isSelected?: boolean,
  ellipsis?: boolean,

  // from mapStateToProps or imports
  changeSorting: Function,
  tableProps: Object,
};

class HeaderCell extends Component<Props> {
  static defaultProps = {
    descDefault: false,
    hideLabel: false,
  };

  shouldComponentUpdate(nextProps) {
    return (
      this.props.tableProps !== nextProps.tableProps ||
      this.props.scrollXContainer !== nextProps.scrollXContainer ||
      this.props.isSelected !== nextProps.isSelected
    );
  }

  handleClick = () => {
    const { sortField, descDefault, tableName } = this.props;
    if (!sortField) return;

    ReactGA.event({
      category: 'TableSorting',
      action: tableName,
      label: sortField,
      transport: 'beacon',
    });

    this.props.changeSorting(sortField, descDefault, tableName);
  };

  wrapEllipsis = value => {
    const { ellipsis } = this.props;
    return ellipsis ? <Ellipsis>{value}</Ellipsis> : value;
  };

  render() {
    const {
      scrollXContainer,
      className,
      tableProps,
      sortField,
      id,
      hideLabel,
      label,
      tooltip,
      filterAttributes,
      onSelectAllChange,
      isSelected,
      hideFilter,
      fixed,
      fixedOffset,
    } = this.props;

    // title & sorting
    const order = tableProps.sortField === sortField ? tableProps.sortOrder : null;
    const sortClass = order ? `sorted ${order}` : '';
    const labelClassName = sortField
      ? `header-title ${sortClass} sortable`
      : `header-title ${sortClass}`;
    const titleId = `table-title-${id}`;

    return (
      <div className={cn('header-cell', className)}>
        <div className={labelClassName} onClick={this.handleClick} id={titleId}>
          {hideLabel ? '' : this.wrapEllipsis(label)}
        </div>

        {tooltip && (
          <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={titleId}>
            {tooltip}
          </UncontrolledTooltip>
        )}

        {!hideFilter && (
          <div className="header-filter">
            {filterAttributes &&
              filterAttributes.map(filterAttribute => (
                <FilterCell
                  key={filterAttribute}
                  fixed={fixed}
                  fixedOffset={fixedOffset}
                  scrollXContainer={scrollXContainer}
                  filterAttribute={filterAttribute}
                />
              ))}

            {onSelectAllChange && (
              <div className="header-checkbox">
                <Checkbox checked={isSelected} onChange={onSelectAllChange} />
              </div>
            )}
          </div>
        )}
      </div>
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
)(HeaderCell);
