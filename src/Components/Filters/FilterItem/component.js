// @flow
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import FilterEditorForm from 'Components/Filters/FilterEditorForm';
import type { FilterBase } from 'Types/Filter';
import SimpleDropdownButton from 'Components/Controls/Dropdowns/SimpleDropdownButton';
import getFilterData from '../getFilterData';
import { t } from 'Utilities/i18n';
import cn from 'classnames';

import BinIcon from 'icons/remove.svg?inline';
import Icon from 'Components/Icon';

type Props = {
  filter: FilterBase,
  onDelete: (filter: FilterBase) => void,
  onUpdate: (filter: FilterBase) => void,
};

type State = {
  isOpen: boolean,
  filterHovered: boolean,
};

class FilterItem extends Component<Props, State> {
  state = {
    isOpen: false,
    filterHovered: false,
  };

  handleMouseOver = () => {
    this.setState({ filterHovered: true });
  };

  handleMouseLeave = () => {
    this.setState({ filterHovered: false });
  };

  handleUpdate = (filter: FilterBase) => {
    this.toggleDropdown();
    this.props.onUpdate(filter);
  };

  handleDelete = () => {
    this.props.onDelete(this.props.filter);
  };

  toggleDropdown = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  renderDeleteIcon() {
    const { filterHovered } = this.state;
    return (
      filterHovered && (
        <Icon
          className="delete-filter-icon"
          icon={BinIcon}
          onClick={this.handleDelete}
          tooltip={t('Remove the filter')}
        />
      )
    );
  }

  render() {
    const { filter } = this.props;
    const { filterHovered } = this.state;
    const isOpen = this.state.isOpen;
    const filterData = getFilterData(filter.attribute);
    const label = filterData.labelFunc(filter);
    const placeholder = filterData.title;
    return (
      <Dropdown
        isOpen={isOpen}
        toggle={this.toggleDropdown}
        className={cn('simple-dropdown filter-item', {
          'no-dropdown-arrow': filterHovered,
        })}
        onMouseEnter={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
      >
        <DropdownToggle tag="div" className="menu-toggle">
          <SimpleDropdownButton item={label} placeholder={placeholder} />
        </DropdownToggle>
        <DropdownMenu flip={false} className="dropdown-menu-overlap">
          {isOpen ? (
            <FilterEditorForm
              onSubmit={this.handleUpdate}
              filter={filter}
              initialValues={filter}
              onDelete={this.handleDelete}
            />
          ) : (
            ''
          )}
        </DropdownMenu>
        {this.renderDeleteIcon()}
      </Dropdown>
    );
  }
}

export default FilterItem;
