import React, { Component } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { debounce, uniqueId } from 'lodash';
import DropdownContent from './DropdownContent';
import underdash from 'Utilities/underdash';

import OptionsIcon from 'icons/more_vert.svg';
import './quick-search.scss';

class AccurankerDropdown extends Component {
  inputRef: HTMLDivElement;
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      inputFocussed: false,
      keyEvents: {
        13: 'enter',
        38: 'arrow_up',
        40: 'arrow_down',
      },
      selectedItem: 0,
    };
  }

  handleInputChange = event => {
    const value = event.target.value;
    this.setState({
      searchQuery: value,
      selectedItem: 0,
    });
    this.props.searchQueryChanged(value);
  };

  handleInputFocus = () => {
    this.setState({
      inputFocussed: true,
    });
  };

  handleDropdownDismissed = () => {
    this.setState({
      inputFocussed: false,
      selectedItem: 0,
    });
  };

  handleKeydown = event => {
    const { keyEvents, selectedItem } = this.state;
    const keyPressed = keyEvents[event.keyCode] || null;
    const { searchData } = this.props;

    switch (keyPressed) {
      case 'enter':
        underdash.redirectToExternalUrl(searchData[selectedItem].href);
        break;
      case 'arrow_up':
        this.setState({
          selectedItem: Math.max(0, selectedItem - 1),
        });
        break;
      case 'arrow_down':
        this.setState({
          selectedItem: Math.min(searchData.length - 1, selectedItem + 1),
        });
        break;
      default:
    }
  };

  renderOptionsButton() {
    const { optionDropdownConfig } = this.props;
    if (!optionDropdownConfig) return null;

    const items = [];

    optionDropdownConfig.forEach(optionCfg => {
      const _uniqueId = uniqueId('accuranker_dropdown_item');
      if (optionCfg.type === 'header') {
        items.push(
          <DropdownItem key={_uniqueId} header>
            {optionCfg.text}
          </DropdownItem>,
        );
      } else {
        items.push(
          <DropdownItem key={_uniqueId} tag={optionCfg.tag} href={optionCfg.href}>
            {optionCfg.text}
          </DropdownItem>,
        );
      }
    });

    return (
      <UncontrolledDropdown className="quick-search-button options">
        <DropdownToggle className="quick-search-button options">
          <img src={OptionsIcon} />
        </DropdownToggle>
        <DropdownMenu right>{items}</DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    const { searchQuery, inputFocussed, selectedItem } = this.state;
    const handleInputChange = debounce(event => {
      this.handleInputChange(event);
    }, 300);
    return (
      <div className="quick-search-wrapper">
        <button className="quick-search-button search">
          <img src={this.props.icon} />
        </button>
        <input
          className="search-input"
          onChange={event => {
            event.persist();
            handleInputChange(event);
          }}
          ref={ref => {
            this.inputRef = ref;
          }}
          onFocus={this.handleInputFocus}
          onKeyDown={this.handleKeydown}
          placeholder={this.props.placeholder}
        />
        <DropdownContent
          searchData={this.props.searchData}
          searchQuery={searchQuery}
          shown={inputFocussed}
          handleDropdownDismissed={this.handleDropdownDismissed}
          inputRef={this.inputRef}
          selectedItem={selectedItem}
        />
        {this.renderOptionsButton()}
      </div>
    );
  }
}

export default AccurankerDropdown;
