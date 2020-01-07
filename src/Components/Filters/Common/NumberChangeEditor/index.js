// @flow
import React, { Component } from 'react';
import { Fields, Field } from 'redux-form';
import InputField from './InputField';
import Validator from 'Utilities/validation';

type Props = {
  iconDropdown?: boolean,
  handleSelect?: Function,
  autoFocus: boolean,
  scrollXContainer: Element | null,
};

class NumberChangeEditor extends Component<Props> {
  static defaultProps = {
    iconDropdown: false,
    handleSelect: () => {},
  };

  render() {
    return (
      <div className="number-filter-editor">
        <Fields names={['comparison', 'value']} component={InputField} {...this.props} />
        <Field name="value" component="div" validate={Validator.numeric} />
      </div>
    );
  }
}

export default NumberChangeEditor;
