// @flow
import * as React from 'react';
import cn from 'classnames';
import './form-field.scss';

export type FormFieldProps = {
  helpText?: string,
  children: React.Node,
  meta: {
    touched: boolean,
    error?: any,
  },
};

class FormField extends React.Component<FormFieldProps> {
  render() {
    const { meta, helpText, children } = this.props;
    const error = meta && meta.touched && meta.error;
    return (
      <div className={cn('form-field', { error })}>
        <div className="form-field-error-details">
          {error && <div className="error-message">{error}</div>}
        </div>
        {children}
        <div className="form-field-help-text">{helpText}</div>
      </div>
    );
  }
}

export default FormField;
