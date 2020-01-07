// @flow
import React, { Component } from 'react';
import { DropdownField } from 'Components/Forms/Fields';
import { Field } from 'redux-form';
import { t } from 'Utilities/i18n/index';
import { NO_FILTER } from 'Types/Filter';
import cn from 'classnames';

import '../common.scss';

type Props = {
  items: any,
  name?: string,
  isEmpty?: boolean,
  iconDropdown?: boolean,
  noFilterIcon?: Element,
  handleSelect?: Function,
  scrollXContainer: Element | null,
  fixed: boolean,
  fixedOffset: number,
};

class OptionEditor extends Component<Props> {
  static defaultProps = {
    iconDropdown: false,
    handleSelect: () => {},
  };

  labelFunc = (item: Object | string) => {
    const { isEmpty, iconDropdown } = this.props;
    if (iconDropdown) {
      const Icon = !isEmpty ? item.icon : this.props.noFilterIcon;
      return <Icon className={cn('icon', item.iconClassName, { 'no-filter': isEmpty })} />;
    }
    return item.label || item;
  };

  handleSelect = (value: any) => {
    this.props.handleSelect && this.props.handleSelect({ value, reset: value === NO_FILTER });
  };

  comparisonOptions = () => {
    const items = [].concat(this.props.items);

    if (this.props.iconDropdown) {
      items.push({ value: NO_FILTER, label: t('No filter'), icon: this.props.noFilterIcon });
    }
    return items;
  };

  render() {
    const { scrollXContainer, isEmpty, fixed, fixedOffset } = this.props;
    const comparisonOptions = this.comparisonOptions();
    return (
      <div>
        <Field
          name={this.props.name || 'value'}
          component={DropdownField}
          className="filter-button"
          handleSelect={this.handleSelect}
          items={comparisonOptions}
          isEmpty={isEmpty} // using this property to force update
          dropDownLabelFunc={this.labelFunc}
          scrollXContainer={scrollXContainer}
          fixed={fixed}
          fixedOffset={fixedOffset}
        />
      </div>
    );
  }
}

export default OptionEditor;
