// @flow
import React, { Component } from 'react';
import './search-input.scss';
import SearchIcon from 'icons/search.svg?inline';
import { t } from 'Utilities/i18n/index';

type Props = {
  value: string,
  onChange: Function,
  autoFocus?: boolean,
  dark?: boolean,
  placeholder?: string,
  onKeyDown: Function,
};

class SearchInput extends Component<Props> {
  static defaultProps = {
    dark: false,
    autoFocus: false,
    onKeyDown: () => {},
  };

  render() {
    const { dark, autoFocus, value, onChange, onKeyDown, placeholder } = this.props;
    return (
      <div className={`search-input ${dark ? 'dark' : ''}`}>
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder || t('Search')}
          type="search"
        />
        <SearchIcon />
      </div>
    );
  }
}

export default SearchInput;
