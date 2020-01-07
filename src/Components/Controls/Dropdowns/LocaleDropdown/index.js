// @flow
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SearchItemsList from 'Components/Controls/Dropdowns/SearchItemsList';
import { t } from 'Utilities/i18n/index';

type Locale = {
  countryCode: string,
  locale: string,
  localeShort: string,
};

type Props = {
  locales: Locale[],
  value: Locale,
  onChange: Function,
  showError?: boolean,
};

type State = {
  isOpen: boolean,
};

class LocaleDropdown extends Component<Props, State> {
  state = {
    isOpen: false,
    filterAttribute: null,
  };

  toggleDropdown = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  handleSelect = (localeObj: Locale) => {
    this.props.onChange(localeObj);
  };

  labelFunc = (locale: Locale) => `${locale.locale}`;
  iconFunc = (locale: Locale) => (
    <span className={`flag-icon flag-icon-${locale.countryCode.toLowerCase()}`} />
  );
  valueFunc = (locale: Locale) => `${locale.countryCode}-${locale.localeShort}`;

  render() {
    const { isOpen } = this.state;
    const { locales, value } = this.props;
    const selectedLocale = value;
    return (
      <Dropdown
        isOpen={isOpen}
        toggle={this.toggleDropdown}
        className="form-dropdown-list simple-dropdown"
      >
        <DropdownToggle tag="div" className="menu-toggle">
          {selectedLocale ? (
            <span>
              {this.iconFunc(selectedLocale)} {this.labelFunc(selectedLocale)}
            </span>
          ) : null}
        </DropdownToggle>
        <DropdownMenu>
          {isOpen && (
            <SearchItemsList
              items={locales}
              valueFunc={this.valueFunc}
              labelFunc={this.labelFunc}
              iconFunc={this.iconFunc}
              onSelect={this.handleSelect}
              title={t('Select locale')}
            />
          )}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default LocaleDropdown;
