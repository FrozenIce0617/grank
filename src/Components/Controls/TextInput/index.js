// @flow
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import './text-input-control.scss';
import ResetIcon from 'icons/close-rounded.svg?inline';
import cn from 'classnames';
import { t } from 'Utilities/i18n';

type Props = {
  autoFocus?: boolean,
  value: any,
  onChange: Function,
  placeholder: string,
  type: string,
  showError?: boolean,
  disabled?: boolean,
  style?: any,
  isPositive?: boolean,
  onReset?: Function,
  showReset?: boolean,
  resetTooltip?: string,
  readOnly?: boolean,
};

class TextInput extends Component<Props> {
  static defaultProps = {
    value: null,
    onChange: () => {},
    placeholder: '',
    type: 'text',
    showError: false,
    disabled: false,
    readOnly: false,
  };

  toPositiveValue = (value: number) => {
    let newValue = Number(value);
    const absValue = Math.abs(newValue);
    if (absValue === 0) {
      newValue = newValue !== 0 ? '' : newValue;
    } else {
      newValue = absValue;
    }
    return newValue;
  };

  handleChange = (evt: SyntheticEvent<*>) => {
    const { onChange, type } = this.props;
    if (type === 'number') {
      evt.target.value = this.toPositiveValue(evt.target.value);
    }

    onChange(evt);
  };

  handleKeydown = (evt: SyntheticEvent<*>) => {
    const { onReset } = this.props;
    if (onReset && !evt.target.value && evt.key === 'Backspace') {
      evt.preventDefault();
      this.handleReset();
    }
  };

  handleReset = () => {
    const { onReset } = this.props;
    onReset && onReset();
  };

  render() {
    const {
      value,
      type,
      placeholder,
      showError,
      autoFocus,
      disabled,
      isPositive,
      showReset,
      readOnly,
      resetTooltip,
    } = this.props;
    return (
      <span className="text-input-container">
        <input
          style={this.props.style}
          autoFocus={autoFocus}
          min={type === 'number' && isPositive ? 0 : null}
          className={cn('text-input-control', { error: showError })}
          value={value}
          onChange={this.handleChange}
          onKeyDown={this.handleKeydown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          type={type}
        />
        {showReset && (
          <Icon
            className="text-input-reset"
            tooltip={resetTooltip || t('Reset')}
            onClick={this.handleReset}
            icon={ResetIcon}
          />
        )}
      </span>
    );
  }
}

export default TextInput;
