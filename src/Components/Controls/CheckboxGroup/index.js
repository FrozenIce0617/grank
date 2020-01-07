// @flow
import * as React from 'react';
import { uniqueId, chunk } from 'lodash';
import Checkbox from '../Checkbox';
import './checkbox-group.scss';

type ValueLabel = {
  value: any,
  label: string,
  Icon: any,
};

type Props = {
  name: string,
  onChange: Function,
  value: Array<string>,
  children: React.Node,
  disabled?: boolean,
  className?: string,
  items?: ValueLabel[],
  column: boolean,
  maxLength: number,
};

class CheckboxGroup extends React.Component<Props> {
  static defaultProps = {
    children: null,
    disabled: false,
    className: '',
  };

  getCheckboxProps(optionProps: any) {
    const { name, value, disabled } = this.props;
    return {
      checked: value.indexOf(optionProps.value) !== -1,
      disabled: optionProps.disabled || disabled,
      name: name == null ? this.defaultGroupName : name,
      onChange: this.handleOptionChange,
    };
  }

  handleOptionChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const optionValue = event.currentTarget.value;
    const value = this.props.value;
    let newValue = null;
    if (event.currentTarget.checked) {
      newValue = [...value, optionValue];
    } else {
      newValue = value.filter(currentOptionValue => currentOptionValue !== optionValue);
    }
    this.props.onChange(newValue);
  };

  isCheckbox(child: any): boolean {
    return child != null && child.type.displayName === 'Checkbox';
  }

  defaultGroupName = uniqueId('checkboxgroup');

  renderChildren() {
    return React.Children.map(this.props.children, child => {
      if (this.isCheckbox(child)) {
        return React.cloneElement(child, this.getCheckboxProps(child.props));
      }
      return child;
    });
  }

  renderIcon(option: ValueLabel) {
    if (!option.Icon) return null;
    return (
      <option.Icon
        style={{
          width: '10px',
          height: '10px',
          position: 'absolute',
          right: 0,
          top: '7px',
          fill: '#A4A6B3',
        }}
      />
    );
  }

  renderOptions(customItems?: ValueLabel[]) {
    const { items, value, disabled } = this.props;
    const itemsToIterate = customItems || items;
    return itemsToIterate
      ? itemsToIterate.map(option => (
          <Checkbox
            key={option.value}
            value={option.value}
            name={this.defaultGroupName}
            checked={value.indexOf(option.value) !== -1}
            disabled={disabled}
            onChange={this.handleOptionChange}
          >
            {option.label} {this.renderIcon(option)}
          </Checkbox>
        ))
      : null;
  }

  renderColumnedCheckboxGroup() {
    const { items, maxLength } = this.props;
    if (!items) return null;
    const columnedItems = chunk(items, maxLength || 5);
    const columns = columnedItems.map(columnItems => (
      <div key={uniqueId('filter-column')} className="filter-column">
        {this.renderOptions(columnItems)}
      </div>
    ));
    return <div className="filter-column-container">{columns}</div>;
  }

  render() {
    if (this.props.column) {
      return this.renderColumnedCheckboxGroup();
    }
    return (
      <div className={`checkbox-group ${this.props.className || ''}`}>
        {this.props.items ? this.renderOptions() : this.renderChildren()}
      </div>
    );
  }
}

export default CheckboxGroup;
