// @flow
import React, { Component } from 'react';
import Select from 'Components/Controls/Select/index';
import CustomValueRenderer from 'Components/Controls/TagsInput/CustomValueRenderer/index';
import CustomClearRenderer from 'Components/Controls/TagsInput/CustomClearRenderer/index';
import Skeleton from 'Components/Skeleton';

type Item = {
  label: string,
  value: string,
};

type Props = {
  placeholder: string,
  noValueItem: string,
  items: Object[],
  loading: false,
  error: '',
  value: string[],
  onChange: (value: string[]) => void,
  showError?: boolean,
  disabled?: boolean,
};

class MultiOptionsInput extends Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleChange = (newValue: Item[]) => {
    this.props.onChange(newValue.map(item => item.value));
  };

  renderSkeleton() {
    return (
      <Skeleton
        linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
      />
    );
  }

  createOptionItem = item => {
    const { noValueItem } = this.props;
    return { label: item ? item : noValueItem, value: item };
  };

  render() {
    const { value, items, placeholder, showError, disabled } = this.props;
    if (this.props.loading || this.props.error) {
      return this.renderSkeleton();
    }

    const itemsOptions = items.reduce((acc, item) => {
      acc.push(this.createOptionItem(item));
      return acc;
    }, []);
    return (
      <Select
        autoFocus
        value={value.map(this.createOptionItem)}
        options={itemsOptions}
        onChange={this.handleChange}
        className={`form-tags-input ${showError ? 'error' : ''}`}
        searchable
        multi
        disabled={disabled}
        valueComponent={CustomValueRenderer}
        clearRenderer={CustomClearRenderer}
        placeholder={placeholder}
      />
    );
  }
}

export default query => query(MultiOptionsInput);
