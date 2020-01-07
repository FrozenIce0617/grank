// @flow
import React, { Component, SyntheticEvent } from 'react';
import IconButton from 'Components/IconButton';
import SearchInput from 'Components/SearchInput';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList';
import { t } from 'Utilities/i18n/index';
import AddIcon from 'icons/plus-rounded.svg';

import './search-items-list.scss';

type Props = {
  items: Array<any>,
  item?: ?any,
  labelFunc: Function,
  valueFunc?: Function,
  iconFunc?: ?Function,
  onSelect: Function,
  linkFunc?: ?Function,
  title: string,
  addItemLabel: ?string,
  onAdd: ?Function,
  closeOnSelect?: boolean,
  onDelete?: ?Function,
  onEdit?: ?Function,
  placeholder?: string,
  onClose?: Function,
};

type State = {
  searchTerm: string,
  selectedItem: number,
  selectWithMouse: boolean,
};

class SearchItemsList extends Component<Props, State> {
  _isMounted: boolean;

  static defaultProps = {
    labelFunc: (item: any) => item,
    iconFunc: null,
    linkFunc: null,
    item: null,
    addItemLabel: null,
    onAdd: null,
    closeOnSelect: true,
    onDelete: null,
    onEdit: null,
  };

  state = {
    searchTerm: '',
    selectedItem: -1,
    selectWithMouse: true,
  };

  UNSAFE_componentWillMount() {
    this.setState({
      selectedItem: this.lowestItemNotHeader(this.state.searchTerm),
    });

    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  onMouseOver = (index: number) => {
    if (this.state.selectWithMouse) {
      if (index !== -1) {
        !this.props.items[index].header && this.setState({ selectedItem: index });
      } else {
        this.setState({ selectedItem: index });
      }
    }
  };

  onMouseMove = () => this.state.selectWithMouse || this.setState({ selectWithMouse: true });

  getFilteredItems = (searchTerm: string) => {
    const { labelFunc } = this.props;
    let { items } = this.props;
    const valueFunc = this.props.valueFunc || labelFunc;
    let newItems = [];
    if (searchTerm) {
      //Filter empty headers out, currently no other way because tobias magic logic.
      items = items.filter(item => {
        const label = valueFunc(item);
        return item.header || ~label.toLowerCase().indexOf(searchTerm.toLowerCase());
      });

      let currentGroup = '';
      for (let row: number = items.length - 1; row >= 0; row--) {
        const currentItem = items[row];
        currentItem.belongsTo && (currentGroup = currentItem.belongsTo);
        if (!currentItem.header || (currentItem.header && currentItem.headerText === currentGroup))
          newItems.push(currentItem);
      }

      newItems = newItems.reverse();
    }
    return searchTerm ? newItems : items;
  };

  lowestItemNotHeader = (searchTerm: string) => {
    const items = this.getFilteredItems(searchTerm);

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item && !item.header) {
        return index;
      }
    }
    return -1;
  };

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const newSearchTerm = event.currentTarget.value;
    this.setState({
      searchTerm: newSearchTerm,
      selectedItem: this.lowestItemNotHeader(newSearchTerm),
    });
  };

  handleKeyDown = (event: SyntheticEvent<HTMLInputElement>) => {
    const { onClose } = this.props;
    const items = this.getFilteredItems(this.state.searchTerm);
    let nextItem = this.state.selectedItem;
    let selectWithMouse = true;
    switch (event.key) {
      case 'Escape':
        if (onClose) {
          onClose();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (nextItem === -1) {
          this.props.onAdd && this.props.onAdd();
          return;
        }
        const item = items[nextItem];
        if (item && !item.header) {
          this.props.onSelect(item);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectWithMouse = false;
        if (nextItem === -1) {
          nextItem = items.length;
        }
        while (nextItem > 0 && items[--nextItem].header) {
          //empty
        }
        if (nextItem === 0 && items[nextItem].header) {
          nextItem = this.state.selectedItem;
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        selectWithMouse = false;
        if ((nextItem === items.length - 1 && !this.state.searchTerm) || nextItem === -1) {
          nextItem = -1;
        } else {
          while (nextItem < items.length - 1 && items[++nextItem].header) {
            //empty
          }
          if (nextItem === items.length || items[nextItem].header) {
            nextItem = this.state.selectedItem;
          }
        }
        break;
      default:
        break;
    }

    if (this._isMounted) {
      if (nextItem === -1) {
        this.setState({ selectedItem: nextItem, selectWithMouse });
        return;
      }
      if (items[nextItem] && !items[nextItem].header) {
        this.setState({
          selectedItem: Math.max(Math.min(nextItem, items.length - 1), 0),
          selectWithMouse,
        });
      }
    }
  };

  render() {
    const { title, addItemLabel, onAdd, placeholder } = this.props;
    const searchTerm = this.state.searchTerm;
    const selectedItem = this.state.selectedItem;
    const items = this.getFilteredItems(searchTerm);
    let addItemContent = null;
    if (addItemLabel && onAdd && !searchTerm) {
      const isSelected = selectedItem === -1;
      addItemContent = (
        <div
          className={`footer ${isSelected ? 'selected' : ''}`}
          onMouseOver={() => this.onMouseOver(-1)}
        >
          <IconButton icon={AddIcon} onClick={onAdd}>
            {addItemLabel}
          </IconButton>
        </div>
      );
    }
    return (
      <div className="search-items-list" onMouseMove={this.onMouseMove}>
        <div className="header">
          <div className="title">{title}</div>
          <SearchInput
            placeholder={placeholder}
            autoFocus
            value={searchTerm}
            onChange={this.handleChange}
          />
        </div>
        <SimpleItemsList
          onMouseOver={this.onMouseOver}
          selectedItem={this.state.selectedItem}
          {...this.props}
          items={items}
          emptyText={t('No domain matches your search')}
        />
        {addItemContent}
      </div>
    );
  }
}

export default SearchItemsList;
