// @flow
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

import SearchItemsList from '../SearchItemsList';
import SimpleDropdownButton from '../SimpleDropdownButton';

import '../base-dropdown.scss';

type Props = {
  items: Array<any>,
  item?: ?any,
  placeholder?: string,
  labelFunc?: Function,
  onSelect: Function,
  linkFunc?: ?Function,
  right?: boolean,
  className?: string,
  title: string,
  addItemLabel?: string,
  onAdd: Function,
  onDelete?: ?Function,
  onEdit?: ?Function,
  valueFunc?: Function,
  buttonLabelFunc?: Function,
  searchPlaceholder?: string,
};

type State = {
  isOpen: boolean,
};

class SimpleDropdownList extends Component<Props, State> {
  static defaultProps = {
    labelFunc: (item: string) => item,
    linkFunc: null,
    right: false,
    item: null,
    placeholder: '',
    className: '',
    addItemLabel: '',
    onAdd: () => {},
    onDelete: null,
    onEdit: null,
  };

  state = {
    isOpen: false,
  };

  handleToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  handleAdd = () => {
    this.props.onAdd();
    this.handleToggle();
  };

  handleEdit = (event: SyntheticEvent<*>, obj: Object) => {
    if (this.props.onEdit) this.props.onEdit(event, obj);
    this.handleToggle();
  };

  handleDelete = (event: SyntheticEvent<*>, obj: Object) => {
    if (this.props.onDelete) this.props.onDelete(event, obj);
    this.handleToggle();
  };

  render() {
    const {
      placeholder,
      item,
      items,
      labelFunc,
      linkFunc,
      onSelect,
      right,
      className,
      title,
      onDelete,
      onEdit,
      valueFunc,
      addItemLabel,
      buttonLabelFunc,
      searchPlaceholder,
    } = this.props;
    const isOpen = this.state.isOpen;
    return (
      <Dropdown
        isOpen={isOpen}
        toggle={this.handleToggle}
        className={`simple-dropdown ${className || ''}`}
      >
        <DropdownToggle tag="div" className="menu-toggle">
          <SimpleDropdownButton
            item={item}
            labelFunc={buttonLabelFunc || labelFunc}
            placeholder={placeholder}
          />
        </DropdownToggle>
        <DropdownMenu flip={false} className="dropdown-menu-overlap" right={right}>
          {isOpen && (
            <SearchItemsList
              items={items}
              item={item}
              labelFunc={labelFunc}
              linkFunc={linkFunc}
              onSelect={onSelect}
              title={title}
              onAdd={this.handleAdd}
              onDelete={onDelete ? this.handleDelete : null}
              onEdit={onEdit ? this.handleEdit : null}
              addItemLabel={addItemLabel}
              valueFunc={valueFunc}
              placeholder={searchPlaceholder}
              onClose={this.handleToggle}
            />
          )}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default SimpleDropdownList;
