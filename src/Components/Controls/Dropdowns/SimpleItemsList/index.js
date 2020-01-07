// @flow
import React, { Component, DOMElement, SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { DropdownItem } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import { withRouter } from 'react-router-dom';

import IconButton from 'Components/IconButton';

import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';

export type Item = {
  disabled?: boolean,
  label?: any,
  link?: any,
  icon?: any,
  onSelect?: Function,
  header?: any,
  className?: string,
};

type DropdownItemProps = {
  ref?: Function,
  tag: any,
  to?: string,
  onClick: Function,
  onSelect?: Function,
  header?: any,
};

type Props = {
  items: Array<Item>,
  item?: ?any,
  valueFunc?: Function,
  labelFunc?: Function,
  iconFunc?: ?Function,
  onSelect?: Function,
  linkFunc?: ?Function,
  closeOnSelect?: boolean,
  onEdit?: Function,
  onDelete?: Function,

  selectedItem: number,
  onMouseOver: Function,
  onMouseOut?: Function,
  emptyText?: string,
  history: Object,
  match: Object,
};

class SimpleItemsList extends Component<Props> {
  static defaultProps = {
    labelFunc: (item: any) => item,
    iconFunc: null,
    item: null,
    linkFunc: null,
    closeOnSelect: true,
    onMouseOver: () => {},
    selectedItem: -1,
  };

  UNSAFE_componentWillMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate() {
    if (this.selectedItemRef) {
      // Instead of using findDOMNode, you should just be able to use
      // the ref instead, but that doesn't seem to work
      // eslint-disable-next-line
      const container: ?DOMElement = ReactDOM.findDOMNode(this);
      // eslint-disable-next-line
      const elem: ?DOMElement = ReactDOM.findDOMNode(this.selectedItemRef);
      if (!container || !elem) return;
      // elem.scrollIntoView is not used as you cannot specify where to scroll to
      const elemTop = elem.offsetTop;
      const elemBottom = elemTop + elem.scrollHeight;
      const containerTop = container.scrollTop + container.offsetTop;
      const containerBottom = containerTop + container.clientHeight;
      const isVisible = elemTop > containerTop && elemBottom < containerBottom;
      const scrollToTop = elemTop < containerTop;
      if (isVisible) {
        return;
      }
      if (typeof container.scroll === 'function') {
        if (scrollToTop) {
          container.scroll(0, elem.offsetTop - container.offsetTop);
        } else {
          container.scroll(
            0,
            elem.offsetTop - container.offsetTop - container.clientHeight + elem.scrollHeight,
          );
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  selectedItemRef = null;

  handleKeyDown = (event: SyntheticEvent<HTMLInputElement>) => {
    if (!this.selectedItemRef) {
      return;
    }

    const { history } = this.props;

    // Try to simulate link click behaviour without DOM access
    if (event.key === 'Enter') {
      if (this.selectedItemRef.props && this.selectedItemRef.props.tag === Link) {
        const link = this.selectedItemRef.props.to;
        this.selectedItemRef.onClick();
        if (link !== history.location.pathname) {
          history.push(link);
        }
      } else {
        this.selectedItemRef.onClick();
      }
    }
  };

  renderEditButton(obj: Object) {
    const { onEdit } = this.props;
    return (
      onEdit && (
        <IconButton
          onClick={(event: SyntheticEvent<*>) => onEdit(event, obj)}
          icon={<EditIcon />}
        />
      )
    );
  }

  renderDeleteButton(obj: Object) {
    const { onDelete } = this.props;
    return (
      onDelete && (
        <IconButton
          onClick={(event: SyntheticEvent<*>) => onDelete(event, obj)}
          icon={<DeleteIcon />}
        />
      )
    );
  }

  renderItems() {
    const {
      items,
      labelFunc,
      linkFunc,
      valueFunc,
      iconFunc,
      onSelect,
      closeOnSelect,
      selectedItem,
      onMouseOver,
      emptyText,
    } = this.props;
    if (!items.length)
      return <span className="empty">{emptyText || t('No items to display')}</span>;
    return items.map((item, index) => {
      const itemLabel = labelFunc ? labelFunc(item) : item.label;
      const link = linkFunc && linkFunc(item);
      const icon = iconFunc && iconFunc(item);
      const key = valueFunc ? valueFunc(item) : itemLabel;

      // Handle the case when item has it's own select handler
      // to avoid the situation when we need to identify
      // what item was passed to the common onSelect
      const handleItemSelect = () => {
        let result;
        if (item.onSelect) {
          result = item.onSelect();
        }

        if (result !== false) {
          onSelect && onSelect(item);
        }
      };

      let itemProps: DropdownItemProps;
      if (link) {
        itemProps = { tag: Link, to: link, onClick: handleItemSelect };
      } else {
        itemProps = { tag: 'div', onClick: handleItemSelect };
      }
      if (selectedItem === index) {
        itemProps.ref = self => (this.selectedItemRef = self);
      }
      return (
        <DropdownItem
          key={key}
          disabled={item.disabled}
          {...itemProps}
          className={classnames(item.className, {
            selected: selectedItem === index,
            header: item.header,
          })}
          toggle={closeOnSelect}
          onMouseOver={() => onMouseOver(index)}
        >
          {icon && <div className="icon-container">{icon}</div>}
          {itemLabel}
          <span className="action-icon-wrapper">
            {this.renderEditButton(item)}
            {this.renderDeleteButton(item)}
          </span>
        </DropdownItem>
      );
    });
  }

  render() {
    return <div className="items">{this.renderItems()}</div>;
  }
}

export default withRouter(SimpleItemsList);
