// @flow
import * as React from 'react';
import { uniqueId } from 'lodash';
import './radio-button.scss';

type Props = {
  value: string,
  checked: boolean,
  name: string,
  onChange: Function,
  children: React.Node,
  disabled?: boolean,
};

type State = {
  checked: boolean,
};

class RadioButton extends React.Component<Props, State> {
  static defaultProps = {
    onChange: () => {},
    checked: false,
    name: '',
    children: null,
    disabled: false,
  };

  static displayName = 'RadioButton';

  id: string = uniqueId('radiobutton');

  render() {
    const { checked, name, value, disabled } = this.props;
    const className = `radio-button ${checked ? 'selected' : ''} ${
      this.props.children ? 'has-label' : ''
    }`;
    return (
      <label htmlFor={this.id} className={className}>
        <input
          id={this.id}
          disabled={disabled}
          type="radio"
          name={name}
          value={value}
          onChange={this.props.onChange}
          checked={checked}
        />
        <div className="indicator">
          <div className="border" />
          <div className="check" />
        </div>
        {this.props.children}
      </label>
    );
  }
}

export default RadioButton;
