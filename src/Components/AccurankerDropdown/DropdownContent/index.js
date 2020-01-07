import React, { Component } from 'react';
import { uniqueId } from 'lodash';
import onClickOutside from 'react-onclickoutside';
import AtoDjango from 'Utilities/django';

import './quicksearch-dropdown.scss';

class DropdownContent extends Component {
  handleClickOutside(event) {
    const { inputRef } = this.props;
    if (inputRef === event.target) return;
    this.props.handleDropdownDismissed();
  }

  highlightMatchedSearchTerm(displayName) {
    const { searchQuery } = this.props;
    const parts = displayName.split(new RegExp(`(${searchQuery})`, 'gi'));
    for (let partsIndex = 1; partsIndex < parts.length; partsIndex += 2) {
      parts[partsIndex] = (
        <span className="matched" key={partsIndex}>
          {parts[partsIndex]}
        </span>
      );
    }
    return <div>{parts}</div>;
  }

  renderDropdown() {
    const { searchData, selectedItem } = this.props;

    const listItems = [];
    searchData.forEach((data, index) => {
      const selectedClassName = selectedItem === index ? 'selected' : '';
      listItems.push(
        <li key={uniqueId('domain')} className={selectedClassName}>
          <AtoDjango href={data.href}>
            <img src={data.icon} />
            {this.highlightMatchedSearchTerm(data.text)}
          </AtoDjango>
        </li>,
      );
    });
    return <ul>{listItems}</ul>;
  }

  render() {
    if (!this.props.shown || !this.props.searchData.length) return null;

    return <div className="quicksearch-dropdown">{this.renderDropdown()}</div>;
  }
}

export default onClickOutside(DropdownContent);
