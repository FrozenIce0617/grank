// @flow
import React, { Component } from 'react';
import ClientsInput from './ClientsInput';
import { Field } from 'redux-form';
import Validator from 'Utilities/validation';
import toFormField from 'Components/Forms/toFormField';

const ClientsField = toFormField(ClientsInput);

class ClientsEditor extends Component<{}> {
  render() {
    return (
      <div>
        <Field name="value" component={ClientsField} validate={Validator.array} />
      </div>
    );
  }
}
export default ClientsEditor;
