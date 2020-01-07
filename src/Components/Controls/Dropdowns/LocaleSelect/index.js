// @flow
import React, { Component } from 'react';
import Select from 'react-select';
import './locale-select.scss';

type Locale = {
  id: string,
  countryCode: string,
  region: string,
  locale: string,
  localeShort: string,
};

type Props = {
  autoFocus?: boolean,
  locales: Locale[],
  value: string,
  onChange: Function,
  showError?: boolean,
  placeholder: string,
  disabled?: boolean,
};

class LocaleSelect extends Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleChange = (selectedItem: Locale) => {
    this.props.onChange(selectedItem ? selectedItem.id : '');
  };

  renderOption = (option: Locale) => {
    const contryCode = option.countryCode.toLowerCase();
    return (
      <div className="option">
        <span className={`flag-icon flag-icon-${contryCode}`} />
        {option.region} - {option.locale}
      </div>
    );
  };

  renderArrow = () => <div className="dropdown-arrow" />;

  render() {
    const { placeholder, locales, value, showError, autoFocus } = this.props;
    return (
      <Select
        autofocus={autoFocus}
        name="locale"
        disabled={this.props.disabled}
        className={`locale-select ${showError ? 'error' : ''}`}
        value={value}
        onChange={this.handleChange}
        clearable={false}
        searchable={true}
        valueKey="id"
        labelKey="locale"
        arrowRenderer={this.renderArrow}
        valueRenderer={this.renderOption}
        optionRenderer={this.renderOption}
        options={locales}
        placeholder={placeholder}
        filterOption={(option: Locale, filter: string) => {
          const localeLowercase = option.locale.toLowerCase();
          const regionLowercase = option.region.toLowerCase();
          filter = filter.toLowerCase();
          return localeLowercase.startsWith(filter) || regionLowercase.startsWith(filter);
        }}
      />
    );
  }
}

export default LocaleSelect;
