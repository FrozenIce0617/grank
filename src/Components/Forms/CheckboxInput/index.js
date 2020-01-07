// @flow

import React, { Component } from 'react';
import Checkbox from 'Components/Controls/Checkbox';

type Props = {
  value: any,
  onChange: Function,
  label?: string,
  showError?: boolean,
  disabled?: boolean,
};

class CheckboxInput extends Component<Props> {
  render() {
    const { value, label, onChange, disabled } = this.props;
    return (
      <Checkbox checked={value === true} onChange={onChange} disabled={disabled}>
        {label}
      </Checkbox>
    );
  }
}

export default CheckboxInput;
