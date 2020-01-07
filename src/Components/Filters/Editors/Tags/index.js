// @flow
import React, { Component } from 'react';
import { Field, formValues } from 'redux-form';
import { TagsField, DropdownField } from 'Components/Forms/Fields';
import { FilterComparison } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import Validation from 'Utilities/validation';

const comparisonOptions = [
  { id: FilterComparison.ANY, label: 'Any' },
  { id: FilterComparison.ALL, label: 'All' },
  { id: FilterComparison.NONE, label: 'None' },
  { id: FilterComparison.EMPTY, label: 'Empty' },
];

type Props = {
  comparison: String,
};

class TagsEditor extends Component<Props> {
  render() {
    const { comparison } = this.props;
    return (
      <div>
        {comparison !== FilterComparison.EMPTY && (
          <Field
            autoFocus
            name="value"
            component={TagsField}
            placeholder={t('Enter the tags')}
            validate={[Validation.array]}
          />
        )}
        <Field name="comparison" component={DropdownField} items={comparisonOptions} />
      </div>
    );
  }
}

export default formValues('comparison')(TagsEditor);
