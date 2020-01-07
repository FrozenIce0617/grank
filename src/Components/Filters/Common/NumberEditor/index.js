// @flow
import React, { Component } from 'react';
import { Fields, Field } from 'redux-form';
import InputField from './InputField';
import { t } from 'Utilities/i18n/index';
import './number-filter-editor.scss';

const validate = (value: any) => {
  if (value === '') {
    return t('This field is required');
  }
  if (Array.isArray(value)) {
    const from = value[0];
    const to = value[1];
    if (from === '' || to === '') {
      return t('This field is required');
    }
    if (from > to) {
      return t('Right should be >= left');
    }
  }
};

type Props = {
  iconDropdown?: boolean,
  handleSelect?: Function,
  autoFocus: boolean,
  scrollXContainer: Element | null,
};

class NumberEditor extends Component<Props> {
  static defaultProps = {
    iconDropdown: false,
    handleSelect: () => {},
  };

  render() {
    return (
      <div className="number-filter-editor">
        <Fields names={['comparison', 'value']} component={InputField} {...this.props} />
        <Field name="value" component="div" validate={[validate]} />
      </div>
    );
  }
}

export default NumberEditor;
