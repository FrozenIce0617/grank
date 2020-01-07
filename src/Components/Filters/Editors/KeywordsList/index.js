// @flow
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { DropdownField } from 'Components/Forms/Fields';
import KeywordsInput from './KeywordsInput';
import { FilterComparison } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import Validation from 'Utilities/validation';
import toFormField from 'Components/Forms/toFormField';

const comparisonOptions = [
  { id: FilterComparison.ANY, label: 'Any' },
  { id: FilterComparison.ALL, label: 'All' },
  { id: FilterComparison.NONE, label: 'None' },
];

const KeywordsInputField = toFormField(KeywordsInput);

class KeywordsEditor extends Component<{}> {
  render() {
    return (
      <div>
        <Field
          name="value"
          component={KeywordsInputField}
          placeholder={t('Enter keywords')}
          validate={[Validation.array]}
        />
        <Field name="comparison" component={DropdownField} items={comparisonOptions} />
      </div>
    );
  }
}

export default KeywordsEditor;
