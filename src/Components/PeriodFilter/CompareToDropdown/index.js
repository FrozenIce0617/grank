// @flow
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import CompareToContent from '../CompareToContent';
import type { DateFilters, DateRange } from '../model';
import type { PeriodFilter } from 'Types/Filter';
import { parsePeriodFilterValue, findButtonConfig, LATEST } from 'Components/PeriodFilter/model';
import { formatDate } from 'Utilities/format';
import { getButtonsConfigs } from '../buttons';
import { t } from 'Utilities/i18n';
import SimpleDropdownButton from 'Components/Controls/Dropdowns/SimpleDropdownButton';
import moment from 'moment/moment';
import { getDateRange } from '../model';

type Props = {
  periodFilter: PeriodFilter,
  max: Date,
  min: Date,
  onSubmit: (filters: DateFilters) => void,
  message?: string,
  onlyPeriodFilter: boolean,
};

type State = {
  isOpen: boolean,
};

class CompareToDropdown extends Component<Props, State> {
  state = {
    isOpen: false,
  };

  handleSubmit = (filters: any) => {
    this.props.onSubmit(filters);
    this.toggle();
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  buttonsConfigs = getButtonsConfigs();

  getRangeToShow = (dateRange: DateRange, min: Date, max: Date): DateRange => {
    let { from, to } = dateRange;

    // TODO: check if getDateRange is enough and following logic is redundant
    from = moment(from).isBefore(min) ? min : moment(from);
    from = moment(from).isAfter(max) ? max : moment(from);
    if (to !== LATEST) {
      to = moment(to).isAfter(max) ? max : moment(to);
      to = moment(to).isBefore(min) ? min : moment(to);
    }

    return getDateRange(
      {
        from,
        to,
      },
      min,
      max,
    );
  };

  labelFunc = (periodFilter: PeriodFilter, min: Date, max: Date) => {
    const { onlyPeriodFilter } = this.props;
    const dateRange = parsePeriodFilterValue(periodFilter);
    const buttonConfig = findButtonConfig(this.buttonsConfigs, dateRange, min, max);

    if (onlyPeriodFilter) {
      const { from, to } = this.getRangeToShow(dateRange, min, max);
      return {
        value: `${formatDate(from)} - ${formatDate(to)}`,
        label: t('Period'),
      };
    }

    if (buttonConfig) {
      return {
        value: buttonConfig.label,
        label: t('Compared to'),
      };
    }

    const { from, to } = this.getRangeToShow(dateRange, min, max);
    return {
      value: `${formatDate(from)} - ${formatDate(to)}`,
      label: t('Comparing'),
    };
  };

  render() {
    const { min, max, periodFilter, message, onlyPeriodFilter } = this.props;
    const isOpen = this.state.isOpen;
    const labelValue = this.labelFunc(periodFilter, min, max);
    return (
      <Dropdown
        className="simple-dropdown period-filter-dropdown"
        isOpen={this.state.isOpen}
        toggle={this.toggle}
      >
        <DropdownToggle tag="div" className="menu-toggle">
          <SimpleDropdownButton
            item={labelValue}
            labelFunc={item => item.value}
            placeholder={labelValue.label}
          />
        </DropdownToggle>
        <DropdownMenu flip={false} className="dropdown-menu-overlap" right={true}>
          {isOpen && (
            <CompareToContent
              buttonsConfigs={this.buttonsConfigs}
              min={min}
              max={max}
              onCancel={this.toggle}
              onSubmit={this.handleSubmit}
              periodFilter={periodFilter}
              onlyPeriodFilter={onlyPeriodFilter}
              message={message}
            />
          )}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default CompareToDropdown;
