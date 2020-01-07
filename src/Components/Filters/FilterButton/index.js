// @flow
import * as React from 'react';
import { DOMElement } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import FilterEditorForm from 'Components/Filters/FilterEditorForm';
import type { FilterBase } from 'Types/Filter';
import getFilterData from '../getFilterData';
import './filter-button.scss';
import { findDOMNode } from 'react-dom';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import cn from 'classnames';

type Props = {
  filterAttribute: string,
  scrollXContainer: any,
  fixed: boolean,
} & FiltersEditorProps;

type State = {
  isOpen: boolean,
  offset: number,
  toggleLeft: number,
  scrollLeft: number,
};

class FilterButton extends React.Component<Props, State> {
  dropdownMenuContent: Element | null;
  toggle: any;

  state = {
    isOpen: false,
    toggleLeft: 0,
    offset: 0,
    scrollLeft: 0,
  };

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    const dropdownMenu = this.dropdownMenuContent && this.dropdownMenuContent.parentElement;
    if (dropdownMenu) {
      dropdownMenu.classList.toggle('dropdown-menu-right', false);
    }
    if (nextProps.scrollXContainer && nextState.isOpen !== this.state.isOpen) {
      const container = nextProps.scrollXContainer;
      if (nextState.isOpen) {
        container.addEventListener('scroll', this.handlerScroll);
        window.addEventListener('resize', this.handleResize);
      } else {
        container.removeEventListener('scroll', this.handlerScroll);
        window.removeEventListener('resize', this.handleResize);
      }
    }
  }

  componentDidUpdate() {
    if (this.dropdownMenuContent && this.state.isOpen) {
      // Is there better way to adjust position?
      const clientRect = this.dropdownMenuContent.getBoundingClientRect();
      const viewportWidth = window.innerWidth || 0;
      const right = clientRect.right > viewportWidth;
      const dropdownMenu = this.dropdownMenuContent && this.dropdownMenuContent.parentElement;
      if (dropdownMenu) {
        dropdownMenu.classList.toggle('dropdown-menu-right', right);
      }
    }
  }

  onAdd = (filter: FilterBase) => {
    this.toggleDropdown();
    this.props.filtersEditor.addFilter(filter);
  };

  onUpdate = (filter: FilterBase) => {
    this.props.filtersEditor.updateFilters(filter);
    this.toggleDropdown();
  };

  onDelete = () => {
    this.props.filtersEditor.removeFilter(this.props.filterAttribute);
    this.toggleDropdown();
  };

  onCancel = () => {
    this.toggleDropdown();
  };

  getToggleRef = (ref: any) => {
    this.toggle = ref;
  };

  handlerScroll = (evt: SyntheticEvent<*>) => {
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

  toggleDropdown = () => {
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

  handleClick = (event: SyntheticEvent<*>) => {
    event.stopPropagation();
  };

  handleResize = () => {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false,
      });
    }
  };

  renderEditForm = (filter: FilterBase) => (
    <FilterEditorForm
      onSubmit={this.onUpdate}
      filter={filter}
      initialValues={filter}
      onDelete={this.onDelete}
    />
  );

  renderAddForm = () => {
    const filterAttribute = this.props.filterAttribute;
    const filter = getFilterData(filterAttribute).defaultValue;
    return (
      <FilterEditorForm
        isNew={true}
        onSubmit={this.onAdd}
        filter={filter}
        initialValues={filter}
        onCancel={this.onCancel}
      />
    );
  };

  renderIcon = filter => {
    const Icon = getFilterData(this.props.filterAttribute).icon;
    if (filter) {
      return <Icon className="icon selected" />;
    }
    return <Icon className="icon" />;
  };

  render() {
    const { filterAttribute, filterGroup } = this.props;
    const { isOpen, offset } = this.state;
    // const filterData = getFilterData(filterAttribute);
    const filter = filterGroup.filters.find(
      currentFilter => currentFilter.attribute === filterAttribute,
    );
    let content = '';
    if (isOpen) {
      content = filter ? this.renderEditForm(filter) : this.renderAddForm();
    }
    const className = cn('simple-dropdown', 'filter-button', filter && 'selected');
    return (
      <Dropdown
        style={isOpen ? { left: offset } : {}}
        isOpen={isOpen}
        toggle={this.toggleDropdown}
        onClick={this.handleClick}
        className={className}
      >
        <DropdownToggle ref={this.getToggleRef} tag="div" className="menu-toggle">
          {this.renderIcon(filter)}
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-overlap">
          <div
            ref={dropdownMenuContent => {
              this.dropdownMenuContent = dropdownMenuContent;
            }}
          >
            {content}
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default withFiltersEditor(FilterButton);
