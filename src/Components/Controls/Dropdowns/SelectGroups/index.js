// @flow
import React, { Component } from 'react';
import Select from 'react-select';
import { flatMap } from 'lodash';

import './custom-select.scss';

type Option = {
  id: string,
  label: string,
};

type Group = {
  label: string,
  options: Option[],
};

type Props = {
  groups: Group[],
  name: string,
  value: string,
  onChange: Function,
  showError?: boolean,
  useDefaultOnChange: Boolean,
  disabled: boolean,
  valueKey: string,
  defaultBehaviour: boolean,
  placeholder: string,
};

class SelectDropdown extends Component<Props> {
  static defaultProps = {
    useDefaultOnChange: false,
    disabled: false,
    valueKey: 'id',
    defaultBehaviour: false,
  };

  handleChange = (selectedItem: Option) => {
    this.props.onChange(selectedItem.id);
  };

  filterOptions = (options, filterString) => {
    const pattern = filterString.toLowerCase();
    return options.filter(
      option =>
        option.label.toLowerCase().includes(pattern) ||
        (option.options &&
          option.options.filter(domainOption => domainOption.label.includes(pattern))),
    );
  };

  renderOption = (option: Option) => <div className="option">{option.label}</div>;

  renderArrow = () => <div className="dropdown-arrow" />;

  render() {
    const {
      placeholder,
      groups,
      value,
      showError,
      name,
      useDefaultOnChange,
      disabled,
      valueKey,
      defaultBehaviour,
    } = this.props;
    const options = flatMap(groups, group => [
      { label: group.label, value: group.label, disabled: true },
      ...group.options,
    ]);
    return (
      <Select
        name={name}
        className={`select-group ${showError ? 'error' : ''}`}
        value={value}
        onChange={useDefaultOnChange || defaultBehaviour ? this.props.onChange : this.handleChange}
        clearable={false}
        searchable={true}
        valueKey={defaultBehaviour ? 'value' : valueKey}
        labelKey={`square-select-${name}`}
        arrowRenderer={this.renderArrow}
        valueRenderer={this.renderOption}
        optionRenderer={this.renderOption}
        filterOptions={this.filterOptions}
        options={options}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }
}

export default SelectDropdown;
