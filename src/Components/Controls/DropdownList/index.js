// @flow
import React, { Component, DOMElement } from 'react';
import { findDOMNode } from 'react-dom';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList';
import './form-dropdown-list.scss';

type Props = {
  items: Array<any>,
  value: any,
  onChange: Function,
  valueFunc: Function,
  placeholder?: string,
  labelFunc: Function,
  dropDownLabelFunc: Function,
  handleSelect?: Function,
  right?: boolean,
  className?: string,
  dropup?: boolean,
  disabled?: boolean,
  scrollXContainer?: any,
};

type State = {
  offset: number,
  toggleLeft: number,
  scrollLeft: number,
  isOpen: boolean,
};

const defaultValueFunc = (item: any) => {
  if (item.value !== undefined) {
    return item.value;
  }
  if (item.id !== undefined) {
    return item.id;
  }
  return item;
};

class FormDropdownList extends Component<Props, State> {
  toggle: any;

  static defaultProps = {
    labelFunc: (item: Object | string) => item.label || item,
    dropDownLabelFunc: (item: Object | string) => item.label || item,
    value: null,
    onChange: () => {},
    handleSelect: () => {},
    valueFunc: defaultValueFunc,
    right: false,
    item: null,
    placeholder: '',
    className: '',
    dropup: false,
    disabled: false,
  };

  state = {
    offset: 0,
    scrollLeft: 0,
    toggleLeft: 0,
    isOpen: false,
  };

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextProps.scrollXContainer && nextState.isOpen !== this.state.isOpen) {
      const container = nextProps.scrollXContainer;
      if (nextState.isOpen) {
        container.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
      } else {
        container.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
      }
    }
  }

  onSelect = (item: any) => {
    const { onChange, valueFunc, handleSelect } = this.props;
    const value = valueFunc(item);
    onChange(value);
    setTimeout(() => handleSelect && handleSelect(value));
  };

  getToggleRef = (ref: any) => {
    this.toggle = ref;
  };

  handleToggle = () => {
    const { isOpen } = this.state;
    const newIsOpen = !isOpen;

    const { scrollXContainer, fixed, fixedOffset } = this.props;
    if (!scrollXContainer) {
      this.setState({
        isOpen: newIsOpen,
      });
      return;
    }

    // eslint-disable-next-line
    const toggle: ?DOMElement = findDOMNode(this.toggle);

    const { scrollLeft } = scrollXContainer;
    const { left: containerLeft } = scrollXContainer
      ? scrollXContainer.getBoundingClientRect()
      : {};
    const { left: toggleLeft } = toggle.getBoundingClientRect();

    const fixedLeftOffset = fixed ? fixedOffset : 0;
    this.setState({
      isOpen: newIsOpen,
      toggleLeft: newIsOpen ? toggleLeft : 0,
      offset: newIsOpen ? toggleLeft - containerLeft - fixedLeftOffset : 0,
      scrollLeft: newIsOpen ? scrollLeft : 0,
    });
  };

  handleScroll = (evt: SyntheticEvent<*>) => {
    if (!this.state.isOpen) {
      return;
    }

    const { scrollLeft } = evt.target;
    const { left: containerLeft, right: containerRight } = evt.target.getBoundingClientRect();

    // eslint-disable-next-line
    const toggle: ?DOMElement = findDOMNode(this.toggle);
    const { left: toggleLeft, right: toggleRight } = toggle ? toggle.getBoundingClientRect() : {};

    if (toggleLeft <= containerLeft || toggleRight >= containerRight) {
      this.setState({
        isOpen: false,
        toggleLeft: 0,
        offset: 0,
      });
      return;
    }

    this.setState({
      offset: this.state.toggleLeft - containerLeft - scrollLeft + this.state.scrollLeft,
    });
  };

  handleResize = () => {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false,
      });
    }
  };

  render() {
    const {
      placeholder,
      value,
      valueFunc,
      dropup,
      items,
      labelFunc,
      dropDownLabelFunc,
      right,
      className,
      disabled,
    } = this.props;
    const { isOpen, offset } = this.state;
    const item = items.find(currentItem => valueFunc(currentItem) === value);

    // first try to use dropDownLabelFunc then labelFunc
    const label =
      item && dropDownLabelFunc
        ? dropDownLabelFunc(item)
        : item && labelFunc
          ? labelFunc(item)
          : placeholder;
    return (
      <Dropdown
        style={isOpen ? { left: offset } : {}}
        toggle={this.handleToggle}
        isOpen={isOpen}
        disabled={disabled}
        direction={dropup ? 'up' : 'down'}
        className={`form-dropdown-list simple-dropdown  ${className || ''}`}
      >
        <DropdownToggle
          ref={this.getToggleRef}
          disabled={disabled}
          tag="div"
          className="menu-toggle"
        >
          {label}
        </DropdownToggle>
        <DropdownMenu right={right}>
          <SimpleItemsList
            items={items}
            item={item}
            labelFunc={labelFunc}
            onSelect={this.onSelect}
          />
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default FormDropdownList;
