// @flow
import React, { Component } from 'react';
import DropdownList from 'Components/Controls/DropdownList';
import TextInput from 'Components/Controls/TextInput';
import FormField from 'Components/Forms/FormField';
import { FilterComparison, NO_FILTER } from 'Types/Filter';
import type { FieldProps } from 'redux-form';
import { t } from 'Utilities/i18n/index';
import { ArrowUp, ArrowDown } from 'Pages/Keywords/Table/Icon/Icons';
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
  isReversed?: boolean,
  fixed: boolean,
  fixedOffset: number,
};

class InputField extends Component<Props> {
  static defaultProps = {
    iconDropdown: false,
    isReversed: true,
    autoFocus: true,
    handleSelect: () => {},
  };

  comparisonOptions = () => {
    const { isReversed } = this.props;

    const items = [
      {
        id: isReversed ? FilterComparison.LT : FilterComparison.GT,
        label: t('Moved up'),
        icon: ArrowUp,
      },
      {
        id: isReversed ? FilterComparison.GT : FilterComparison.LT,
        label: t('Moved down'),
        icon: ArrowDown,
      },
      { id: FilterComparison.EQ, label: t('Did not change'), icon: BetweenIcon },
    ];

    if (this.props.iconDropdown) {
      items.push({ id: NO_FILTER, label: t('No filter'), icon: this.props.noFilterIcon });
    }

    return items;
  };

  handleComparisonChange = (newComparison: string) => {
    const { value, comparison } = this.props;
    let actualValue = value.input.value;

    if (newComparison === comparison.input.value && !this.props.iconDropdown) {
      return;
    }
    comparison.input.onChange(newComparison);

    if (newComparison === FilterComparison.EQ) {
      actualValue = 0;
      value.input.onChange(actualValue);
    } else if (!isNaN(value)) {
      value.input.onChange(actualValue);
    }

    if (this.props.iconDropdown && newComparison !== FilterComparison.EQ) {
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
    const newValue = event.currentTarget.value;
    if (newValue === '') {
      this.props.value.input.onChange('');
      return;
    }
    const numberValue = parseInt(newValue, 10);
    this.props.value.input.onChange(isNaN(numberValue) ? '' : numberValue);
  };

  render() {
    const { value, comparison, autoFocus, scrollXContainer, fixed, fixedOffset } = this.props;
    const hasError = value.meta.error;
    const operator = comparison.input.value;
    const rankChange = value.input.value;
    const comparisonOptions = this.comparisonOptions();

    if (comparisonOptions.filter(e => e.id === comparison.input.value).length <= 0) {
      // eslint-disable-next-line
      console.error(
        '[NumberChangeEditor/InputField.js] Using a not allowed comparison',
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
          {!this.props.iconDropdown && (
            <TextInput
              autoFocus={autoFocus}
              disabled={operator === FilterComparison.EQ}
              value={isNaN(rankChange) ? '' : rankChange}
              onChange={this.handleValueChange}
              type="number"
              showError={hasError}
              isPositive
            />
          )}
        </div>
      </FormField>
    );
  }
}

export default InputField;
