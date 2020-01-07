// @flow
import React, { Component } from 'react';
import cn from 'classnames';

import './upload-input.scss';

type Props = {
  autoFocus?: boolean,
  showError?: boolean,
  disabled?: boolean,
  onChange: Function,
};

class TextInput extends Component<Props> {
  _input: any;

  static defaultProps = {
    placeholder: '',
    onChange: () => {},
    showError: false,
    disabled: false,
  };

  setInputRef = (ref: any) => {
    this._input = ref;
  };

  render() {
    const { showError, autoFocus, disabled, onChange } = this.props;
    return (
      <input
        autoFocus={autoFocus}
        className={cn('upload-input-control', { error: showError })}
        value={null}
        disabled={disabled}
        onChange={onChange}
        type="file"
        ref={this.setInputRef}
      />
    );
  }
}

export default TextInput;
