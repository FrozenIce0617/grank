// @flow
import * as React from 'react';
import FormField from './FormField';
import type { FieldProps } from 'redux-form';

export type FormFieldProps = {
  helpText: string,
} & FieldProps;

function handleSelectOnBlur(field) {
  const {
    input,
    input: { value },
  } = field;
  input.onBlur(value);
}

function toFormField<InputProps: {}>(
  Component: React.ComponentType<
    { value: any, onChange: Function, showError?: boolean, disabled?: boolean } & InputProps,
  >,
): React.ComponentType<InputProps & FormFieldProps> {
  return function FormFieldWrapper(props: InputProps & FormFieldProps) {
    const { input, meta, helpText, ...otherProps } = props;
    const error = meta && meta.touched && meta.error;
    return (
      <FormField helpText={helpText} {...props}>
        <Component
          {...input}
          onBlur={() => handleSelectOnBlur(props)}
          value={input.value}
          onChange={input.onChange}
          showError={!!error}
          disabled={meta.submitting}
          {...otherProps}
        />
      </FormField>
    );
  };
}

export default toFormField;
