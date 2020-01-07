// @flow

import React, { Component } from 'react';
import ReactTelInput from 'react-telephone-input';
import phoneData from 'country-telephone-data';

import Flags from 'icons/flags.png';

type Props = {
  className?: string,
  inputClassName?: string,
  autoFocus?: boolean,
  value: any,
  onChange: Function,
  onBlur: Function,
  placeholder: string,
  disabled?: boolean,
  readOnly?: boolean,
  defaultCountry?: string,
};

class PhoneInput extends Component<Props> {
  static defaultProps = {
    value: '',
    onChange: () => {},
    placeholder: '',
    disabled: false,
    readOnly: false,
    autoFocus: false,
    defaultCountry: 'dk',
  };

  getCountryCode(country: string): ?number {
    const dataItem = phoneData.allCountries[phoneData.iso2Lookup[country]];
    return dataItem ? dataItem.dialCode : undefined;
  }

  handleChange = (telNumber: string) => {
    const { onChange } = this.props;
    onChange(telNumber);
  };

  render() {
    const {
      defaultCountry,
      value,
      placeholder,
      autoFocus,
      disabled,
      readOnly,
      className,
      inputClassName,
      onBlur,
    } = this.props;

    const inputProps = {
      readOnly,
      autoFocus,
      className: inputClassName,
    };
    return (
      <ReactTelInput
        className={className}
        defaultCountry={defaultCountry}
        value={value}
        initialValue={
          defaultCountry ? this.getCountryCode(defaultCountry.toLowerCase()) : undefined
        }
        flagsImagePath={Flags}
        onBlur={onBlur}
        onChange={this.handleChange}
        placeholder={placeholder}
        disabled={disabled}
        inputProps={inputProps}
      />
    );
  }
}

export default PhoneInput;
