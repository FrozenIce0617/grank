// @flow
import React, { Component } from 'react';
import './text-area-control.scss';
import cn from 'classnames';

type Props = {
  className?: string,
  value?: string,
  defaultValue?: string,
  onChange: Function,
  placeholder: string,
  type: string,
  showError?: boolean,
  disabled?: boolean,
  getRef: Function,
};

class TextArea extends Component<Props> {
  static defaultProps = {
    defaultValue: '',
    onChange: () => {},
    placeholder: '',
    type: 'text',
    showError: false,
    disabled: false,
    getRef: () => {},
  };

  render() {
    const {
      value,
      defaultValue,
      onChange,
      type,
      placeholder,
      showError,
      getRef,
      className,
      ...props
    } = this.props;
    const values = value !== undefined ? { value } : { defaultValue };
    return (
      <textarea
        {...props}
        ref={getRef}
        className={cn('text-area-control', className, {
          error: showError,
        })}
        {...values}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
      />
    );
  }
}

export default TextArea;
