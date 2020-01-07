// @flow
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { FilterComparison } from 'Types/Filter';
import { CheckBoxGroup, DropdownField } from 'Components/Forms/Fields';
import { getComparisonLabels } from '../labelFunc';

type ValueLabel = {
  value: any,
  label: string,
};

type Props = {
  items: ValueLabel[],
};

class ColumnChecklistEditor extends Component<Props> {
  comparisonItems: ValueLabel[];

  constructor(props: Props) {
    super(props);
    const comparisons = [FilterComparison.ALL, FilterComparison.ANY, FilterComparison.NONE];
    const comparisonLabels = getComparisonLabels();
    this.comparisonItems = comparisons.map(comparison => ({
      label: comparisonLabels[comparison],
      value: comparison,
    }));
  }

  render() {
    return (
      <div>
        <Field
          name="value"
          component={CheckBoxGroup}
          items={this.props.items}
          column
          maxLength={8}
        />
        <Field name="comparison" component={DropdownField} items={this.comparisonItems} />
      </div>
    );
  }
}

export default ColumnChecklistEditor;
