// @flow
import React, { Component } from 'react';
import { Creatable } from 'react-select';
import { t } from 'Utilities/i18n/index';
import CustomValueRenderer from 'Components/Controls/TagsInput/CustomValueRenderer';
import CustomClearRenderer from 'Components/Controls/TagsInput/CustomClearRenderer';

type Props = {
  value: Array<string>,
  onChange: Function,
  placeholder: string,
  showError?: boolean,
  options: Array<Object>,
  disabled?: boolean,
};

class EmailsInput extends Component<Props> {
  static defaultProps = {
    value: [],
    onChange: () => {},
    showError: false,
    options: [],
    disabled: false,
  };

  handleChange = (selectVal: Array<*>) => {
    const newValue = selectVal.map(item => item.value);
    this.props.onChange(newValue);
  };

  render() {
    const { value, placeholder, showError, disabled } = this.props;
    const selectVal = value
      ? value.map(optionValue => ({ value: optionValue, label: optionValue }))
      : [];
    return (
      <Creatable
        className={`form-tags-input ${showError ? 'error' : ''}`}
        placeholder={placeholder}
        multi={true}
        value={selectVal}
        options={[]}
        disabled={disabled}
        onChange={this.handleChange}
        valueComponent={CustomValueRenderer}
        promptTextCreator={label => `${t('Add email')} "${label}"`}
        clearRenderer={CustomClearRenderer}
      />
    );
  }
}

export default EmailsInput;
