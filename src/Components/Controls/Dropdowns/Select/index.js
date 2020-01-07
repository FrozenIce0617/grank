// @flow
import React, { Component } from 'react';
import Select from 'react-select';
import './custom-select.scss';

type Option = {
  id: string,
  label: string,
};

type Props = {
  options: Option[],
  name: string,
  value: string,
  onChange: Function,
  showError?: boolean,
  useDefaultOnChange: boolean,
  disabled: boolean,
  valueKey: string,
  defaultBehaviour: boolean,
  useFirstOptionAsDefault: boolean,
  placeholder: string,
  optionRenderer: Function,
  valueRenderer: Function,
  valueComponent?: Function,
  clearRenderer?: Function,
  filterOption: Function,
  filterOptions: Function,
  searchable: boolean,
  multi?: boolean,
};

class SelectDropdown extends Component<Props> {
  static defaultProps = {
    useDefaultOnChange: false,
    disabled: false,
    valueKey: 'id',
    defaultBehaviour: false,
    useFirstOptionAsDefault: false,
    searchable: true,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const {
      options,
      value,
      useDefaultOnChange,
      defaultBehaviour,
      useFirstOptionAsDefault,
    } = nextProps;
    const changeHandler =
      useDefaultOnChange || defaultBehaviour ? this.props.onChange : this.handleChange;
    if (!value && options && options.length && (options.length === 1 || useFirstOptionAsDefault)) {
      changeHandler(options[0]);
    }
  }

  handleChange = (selectedItem: Option) => {
    this.props.onChange(selectedItem.id);
  };

  renderOption = (option: Option) => <div className="option">{option.label}</div>;

  renderArrow = () => <div className="dropdown-arrow" />;

  render() {
    const {
      placeholder,
      options,
      value,
      showError,
      name,
      useDefaultOnChange,
      disabled,
      valueKey,
      defaultBehaviour,
      optionRenderer,
      valueRenderer,
      filterOption,
      filterOptions,
      searchable,
      multi,
      valueComponent,
      clearRenderer,
    } = this.props;
    const changeHandler =
      useDefaultOnChange || defaultBehaviour ? this.props.onChange : this.handleChange;
    return (
      <Select
        name={name}
        multi={multi}
        className={`square-select ${showError ? 'error' : ''}`}
        value={value}
        onChange={changeHandler}
        clearable={false}
        searchable={searchable}
        valueKey={defaultBehaviour ? 'value' : valueKey}
        labelKey={defaultBehaviour ? 'label' : `square-select-${name}`}
        arrowRenderer={this.renderArrow}
        valueRenderer={valueRenderer || this.renderOption}
        optionRenderer={optionRenderer || this.renderOption}
        valueComponent={valueComponent}
        clearRenderer={clearRenderer}
        filterOption={filterOption}
        filterOptions={filterOptions}
        options={options}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }
}

export default SelectDropdown;
