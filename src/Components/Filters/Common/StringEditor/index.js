// @flow
import React, { Component } from 'react';
import { DropdownField, TextField } from 'Components/Forms/Fields';
import { Field } from 'redux-form';
import Validation from 'Utilities/validation';
import { t } from 'Utilities/i18n';
import { getComparisonLabels } from '../labelFunc';

type Props = {
  placeholder: string,
  comparisonOptions?: string[],
  showComparisonOptions?: boolean,
  autoFocus: boolean,
  handleReset: Function,
  isEmpty: boolean,
};

class StringEditor extends Component<Props> {
  static defaultProps = {
    showComparisonOptions: true,
    autoFocus: true,
  };

  comparisonLabels = getComparisonLabels();

  render() {
    let comparisonOptions = null;
    const { showComparisonOptions, autoFocus, handleReset, isEmpty } = this.props;
    if (this.props.comparisonOptions && this.props.comparisonOptions.length > 1) {
      comparisonOptions = this.props.comparisonOptions.map(optionValue => ({
        label: this.comparisonLabels[optionValue],
        value: optionValue,
      }));
    }
    return (
      <div>
        <Field
          autoFocus={autoFocus}
          name="value"
          component={TextField}
          onReset={handleReset}
          showReset={!isEmpty && handleReset}
          resetTooltip={t('Reset filter')}
          placeholder={this.props.placeholder}
          validate={[Validation.required]}
        />
        {comparisonOptions &&
          showComparisonOptions && (
            <Field
              name="comparison"
              className="filter-button"
              component={DropdownField}
              items={comparisonOptions}
            />
          )}
      </div>
    );
  }
}

export default StringEditor;
