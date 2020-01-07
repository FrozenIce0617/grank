// @flow
import React, { Component } from 'react';
import DropdownList from 'Components/Controls/DropdownList';
import TextInput from 'Components/Controls/TextInput';
import FormField from 'Components/Forms/FormField';
import { FilterComparison, NO_FILTER } from 'Types/Filter';
import type { FieldProps } from 'redux-form';
import { t } from 'Utilities/i18n/index';
import EqualIcon from 'icons/equal.svg?inline';
import LessThanIcon from 'icons/less-than.svg?inline';
import GreaterThanIcon from 'icons/greater-than.svg?inline';
import BetweenIcon from 'icons/arrow-both-sides.svg?inline';

import '../common.scss';
import FilterCell from '../../../InfiniteTable/Cells/FilterCell';

type Props = {
  value: FieldProps,
  comparison: FieldProps,
  iconDropdown?: boolean,
  noFilterIcon?: Element,
  handleSelect?: Function,
  autoFocus: boolean,
  scrollXContainer: Element | null,
  isEmpty?: boolean,
  fixed: boolean,
  fixedOffset: number,
};

class InputField extends Component<Props> {
  static defaultProps = {
    iconDropdown: false,
    autoFocus: true,
    handleSelect: () => {},
  };

  comparisonOptions = () => {
    const items = [
      { id: FilterComparison.EQ, label: t('Equal ='), icon: EqualIcon },
      { id: FilterComparison.LT, label: t('Less than <'), icon: LessThanIcon },
      { id: FilterComparison.GT, label: t('Greater than >'), icon: GreaterThanIcon },
      { id: FilterComparison.BETWEEN, label: t('Between'), icon: BetweenIcon },
    ];

    if (this.props.iconDropdown) {
      items.push({ id: NO_FILTER, label: t('No filter'), icon: this.props.noFilterIcon });
    }

    return items;
  };

  handleComparisonChange = (newComparison: string) => {
    const { value, comparison } = this.props;
    let actualValue = value.input.value;

    if (newComparison === comparison.input.value) {
      return;
    }

    comparison.input.onChange(newComparison);

    // if we change to BETWEEN set defaults, some with changing from it.
    if (newComparison === FilterComparison.BETWEEN) {
      actualValue = [0, 0];
      value.input.onChange(actualValue);
    } else if (comparison.input.value === FilterComparison.BETWEEN) {
      actualValue = 0;
      value.input.onChange(actualValue);
    }

    // to submit proper filter after redux form state updated
    setTimeout(() => {
      if (this.props.handleSelect) {
        this.props.handleSelect({ value: newComparison, reset: newComparison === NO_FILTER });
        if (newComparison !== NO_FILTER) {
          this.props.handleSelect({ value: actualValue });
        }
      }
    });
  };

  labelFunc = (item: Object | string) => {
    const { isEmpty, iconDropdown } = this.props;
    if (iconDropdown) {
      const Icon = !isEmpty ? item.icon : this.props.noFilterIcon;
      return <Icon className={`icon ${isEmpty ? 'no-filter' : ''}`} />;
    }
    return item.label || item;
  };

  handleValueChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const numberValue = parseInt(event.currentTarget.value, 10);
    this.props.value.input.onChange(isNaN(numberValue) ? '' : numberValue);
  };

  handleRangeChange = (index: number, event: SyntheticEvent<HTMLInputElement>) => {
    const numberValue = parseInt(event.currentTarget.value, 10);
    const newValue = [...this.props.value.input.value];
    newValue[index] = isNaN(numberValue) ? '' : numberValue;
    this.props.value.input.onChange(newValue);
  };

  handleFromChange = this.handleRangeChange.bind(this, 0);
  handleToChange = this.handleRangeChange.bind(this, 1);

  render() {
    const { value, comparison, autoFocus, scrollXContainer, fixed, fixedOffset } = this.props;
    let content = null;
    const hasError = value.meta.error;
    const comparisonOptions = this.comparisonOptions();
    if (comparison.input.value === FilterComparison.BETWEEN) {
      const tupleValue: [number, number] = value.input.value;
      content = [
        <TextInput
          key="from"
          showError={tupleValue[0] === '' || tupleValue[0] > tupleValue[1]}
          autoFocus={autoFocus}
          value={tupleValue[0]}
          onChange={this.handleFromChange}
          type="number"
          isPositive
        />,
        <TextInput
          key="to"
          value={tupleValue[1]}
          onChange={this.handleToChange}
          showError={tupleValue[1] === '' || tupleValue[0] > tupleValue[1]}
          type="number"
          isPositive
        />,
      ];
    } else {
      content = (
        <TextInput
          autoFocus={autoFocus}
          value={value.input.value || value.input.value === 0 ? value.input.value : ''}
          onChange={this.handleValueChange}
          type="number"
          showError={hasError}
          isPositive
        />
      );
    }

    if (comparisonOptions.filter(e => e.id === comparison.input.value).length <= 0) {
      // eslint-disable-next-line
      console.error(
        '[NumberEditor/InputField.js] Using a not allowed comparison',
        this.comparisonOptions,
        this.props,
      );
    }

    return (
      <FormField meta={value.meta}>
        <div className="number-filter-row">
          <DropdownList
            className="filter-button"
            items={comparisonOptions}
            value={comparison.input.value}
            onChange={this.handleComparisonChange}
            dropDownLabelFunc={this.labelFunc}
            scrollXContainer={scrollXContainer}
            fixed={fixed}
            fixedOffset={fixedOffset}
          />
          {content}
        </div>
      </FormField>
    );
  }
}

export default InputField;
