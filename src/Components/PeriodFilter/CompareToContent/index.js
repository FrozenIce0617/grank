// @flow
import React, { Component } from 'react';
import Button from 'Components/Forms/Button';
import type { PeriodFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n';
import type { FromDate, ToDate, ButtonConfig, DateFilters } from '../model';
import {
  parsePeriodFilterValue,
  findButtonConfig,
  EARLIEST,
  LATEST,
  getDateRange,
  rangeToFilters,
  clampRange,
} from '../model';
import DatesPicker from './DatesPicker';
import { getButtonsConfigs } from '../buttons';
import cn from 'classnames';

type State = {
  from: FromDate,
  to: ToDate,
  selectedButton: ?string,
};

type Props = {
  onSubmit: (filters: DateFilters) => void,
  onCancel: () => void,
  periodFilter: PeriodFilter,
  min: Date,
  max: Date,
  message?: string,
  onlyPeriodFilter: boolean,
};

class CompareToContent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const range = parsePeriodFilterValue(this.props.periodFilter);
    const buttonConfig = findButtonConfig(this.buttonsConfigs, range, props.min, props.max);
    this.state = {
      ...range,
      selectedButton:
        range.from !== EARLIEST && range.to !== LATEST ? null : buttonConfig && buttonConfig.id,
    };
  }

  handleSubmit = () => {
    const filters = rangeToFilters(this.state);
    this.props.onSubmit(filters);
  };

  buttonsConfigs = getButtonsConfigs();

  handleChangeRange = (range: { from: Date, to: Date }) => {
    const { min, max } = this.props;
    const buttonConfig = findButtonConfig(this.buttonsConfigs, range, min, max);

    this.setState({
      ...range,
      selectedButton: buttonConfig ? buttonConfig.id : null,
    });
  };

  handleButtonClick = (buttonConfig: ButtonConfig) => {
    const { min, max } = this.props;
    let range = buttonConfig.getRange();
    if (!range) {
      return;
    }
    range = clampRange(range, min, max);
    this.setState({
      ...range,
      selectedButton: buttonConfig.id,
    });
  };

  renderButtons = () => {
    const { min, max } = this.props;
    return this.buttonsConfigs.map(buttonConfig => {
      const isSelected = this.state.selectedButton === buttonConfig.id;
      const buttonRange = buttonConfig.getRange();
      const range = clampRange(buttonConfig.getRange(), min, max);
      const disabled = max === range.from && max !== buttonRange.from;
      return (
        <Button
          key={buttonConfig.label}
          smallBlock
          theme="orange"
          disabled={disabled}
          additionalClassName={cn({ selected: isSelected })}
          onClick={() => this.handleButtonClick(buttonConfig)}
        >
          {buttonConfig.label}
        </Button>
      );
    });
  };

  render() {
    const { min, max, message, onlyPeriodFilter } = this.props;
    return (
      <div className="period-filter-editor">
        <div className="period-filter-content">
          <div className={cn({ 'period-filter-range-select': !!message })}>
            {!onlyPeriodFilter && <div className="dropdown-title">{t('Date')}</div>}
            <DatesPicker
              value={getDateRange(this.state, min, max)}
              min={min}
              max={max}
              onChange={this.handleChangeRange}
            />
            {message && <div className="alert alert-warning period-filter-message">{message}</div>}
          </div>
          {!onlyPeriodFilter && (
            <div className="range-preset">
              <div className="dropdown-title">{t('Compare to')}</div>
              {this.renderButtons()}
            </div>
          )}
        </div>
        <div className="action-buttons">
          <Button onClick={this.props.onCancel} theme="grey">
            {t('Cancel')}
          </Button>
          <Button onClick={this.handleSubmit} theme="orange">
            {t('Update')}
          </Button>
        </div>
      </div>
    );
  }
}

export default CompareToContent;
