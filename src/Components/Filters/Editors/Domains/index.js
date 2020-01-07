// @flow
import React, { Component } from 'react';
import DomainsInput from './DomainsInput';
import { Field } from 'redux-form';
import Validator from 'Utilities/validation';
import toFormField from 'Components/Forms/toFormField';

const DomainsField = toFormField(DomainsInput);

export default class DomainsEditor extends Component<{}> {
  render() {
    return (
      <div>
        <Field name="value" component={DomainsField} validate={Validator.array} />
      </div>
    );
  }
}
