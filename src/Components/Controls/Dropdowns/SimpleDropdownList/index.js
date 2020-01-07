// @flow
import * as React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, Dropdown } from 'reactstrap';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList';
import SimpleDropdownButton from 'Components/Controls/Dropdowns/SimpleDropdownButton';
import cn from 'classnames';
import '../base-dropdown.scss';

type Props = {
  items: Array<any>,
  item?: ?any,
  placeholder?: string,
  labelFunc?: Function,
  onSelect: Function,
  linkFunc?: ?Function,
  iconFunc?: ?Function,
  right?: boolean,
  className?: string,
  disabled?: boolean,
  selectedItem: number,
  isOpen?: boolean,
  toggle: Function,
  toggleOnHover?: boolean,
  icon?: React.Node,
};

type State = {
  openedByHover: boolean,
  togglerFocussed: boolean,
  dropdownFocussed: boolean,
};

class SimpleDropdownList extends React.Component<Props, State> {
  _isMounted: boolean;

  static defaultProps = {
    labelFunc: (item: string) => item,
    linkFunc: null,
    iconFunc: null,
    right: false,
    item: null,
    placeholder: '',
    className: '',
    disabled: false,
    selectedItem: -1,
    toggle: () => {},
    toggleOnHover: false,
  };

  state = {
    openedByHover: false,
    togglerFocussed: false,
    dropdownFocussed: false,
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleToggle = () => {
    const { toggle } = this.props;
    const { openedByHover } = this.state;
    if (!openedByHover) toggle();
  };

  handleHover = () => {
    const { toggle, isOpen } = this.props;
    this.setState(() => ({ togglerFocussed: true }));
    if (isOpen) return;
    this.setState(() => ({ openedByHover: true }));
    setTimeout(() => {
      if (!this._isMounted) {
        return;
      }
      if (!this.state.togglerFocussed && !this.state.dropdownFocussed) toggle();
      this.setState(() => ({ openedByHover: false }));
    }, 1000);
    toggle();
  };

  render() {
    const {
      placeholder,
      item,
      items,
      labelFunc,
      linkFunc,
      iconFunc,
      onSelect,
      right,
      className,
      disabled,
      selectedItem,
      isOpen,
      toggleOnHover,
      icon,
    } = this.props;

    const isUncontrolled = isOpen === undefined;

    const DropdownComponent = isUncontrolled ? UncontrolledDropdown : Dropdown;
    const controlledProps = isUncontrolled ? {} : { toggle: this.handleToggle, isOpen };
    const extraEvents = toggleOnHover
      ? {
          onMouseEnter: this.handleHover,
          onMouseLeave: () => this.setState(() => ({ togglerFocussed: false })),
        }
      : {};
    const extraMenuEvents = toggleOnHover
      ? {
          onMouseEnter: () => this.setState(() => ({ dropdownFocussed: true })),
          onMouseLeave: () => this.setState(() => ({ dropdownFocussed: false })),
        }
      : {};
    return (
      <DropdownComponent className={cn('simple-dropdown', className)} {...controlledProps}>
        <DropdownToggle tag="div" className="menu-toggle" {...extraEvents}>
          <SimpleDropdownButton
            icon={icon}
            item={item}
            labelFunc={labelFunc}
            placeholder={placeholder}
          />
        </DropdownToggle>
        {!disabled &&
          ((!isUncontrolled && isOpen) || isUncontrolled) && (
            <DropdownMenu className="dropdown-menu-bubble" right={right} {...extraMenuEvents}>
              <SimpleItemsList
                items={items}
                item={item}
                labelFunc={labelFunc}
                linkFunc={linkFunc}
                iconFunc={iconFunc}
                onSelect={onSelect}
                selectedItem={selectedItem}
              />
            </DropdownMenu>
          )}
      </DropdownComponent>
    );
  }
}

export default SimpleDropdownList;
