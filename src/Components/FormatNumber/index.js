// @flow
import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import { FormattedNumber, injectIntl, intlShape } from 'react-intl';
import formatNumberHelper from './formatNumberHelper';

const ONE_MILLION = 1000000;
const TEN_THOUSAND = 10000;

type Props = {
  className?: string,
  showTitle?: boolean,
  precision?: number,
  currency?: string,
  zeroAllowed?: boolean,
  percentage?: boolean,
  thousandsSettings?: {
    thousandsLabel: string,
    thousandsCutoff: number,
  },
  millionsSettings?: {
    millionsLabel: string,
    millionsCutoff: number,
  },
  trimZeroes?: boolean,
  hasSpaceBetweenNumberAndLabel?: boolean,
  children: any,
  intl: intlShape,
  isEmptyAllowed?: boolean,
};

class FormatNumber extends Component<Props> {
  static defaultProps = {
    showTitle: true,
    precision: 1,
    percentage: false,
    millionsSettings: {
      millionsCutoff: ONE_MILLION,
      millionsLabel: 'mln',
    },
    thousandsSettings: {
      thousandsCutoff: TEN_THOUSAND,
      thousandsLabel: 'k',
    },
    hasSpaceBetweenNumberAndLabel: false,
    zeroAllowed: true,
    isEmptyAllowed: false,
  };

  id = uniqueId('formatnumber');

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  hasEmptyChildren = () => this.props.isEmptyAllowed && this.props.children === '';
  hasNonValidChildren = () => typeof this.props.children !== 'number';
  isZeroNonValidChildren = () =>
    (!this.props.zeroAllowed && this.props.children === 0) || this.props.children === '0';
  isCurrency = () => this.props.currency;

  renderFormattedValue() {
    const {
      showTitle,
      className,
      precision,
      percentage,
      thousandsSettings,
      millionsSettings,
      hasSpaceBetweenNumberAndLabel,
      intl,
      isFinal,
    } = this.props;

    let cutoffValue = Number.MAX_VALUE;
    if (this.props.millionsSettings) {
      cutoffValue = this.props.millionsSettings.millionsCutoff;
    }
    if (this.props.thousandsSettings) {
      cutoffValue = this.props.thousandsSettings.thousandsCutoff;
    }
    const tooltip =
      showTitle && this.props.children >= cutoffValue ? (
        <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={this.id}>
          {this.props.children}
        </UncontrolledTooltip>
      ) : null;

    const val = formatNumberHelper({
      value: this.props.children,
      precision,
      percentage,
      thousandsSettings,
      millionsSettings,
      hasSpaceBetweenNumberAndLabel,
      intlFormatNumber: intl.formatNumber,
      isFinal,
    });

    return tooltip ? (
      <span className={className}>
        <span id={this.id}>{val}</span>
        {tooltip}
      </span>
    ) : (
      <span className={className}>{val}</span>
    );
  }

  render() {
    if (this.hasEmptyChildren()) {
      return <span />;
    }
    if (this.hasNonValidChildren()) {
      return <span>-</span>;
    }
    if (this.isZeroNonValidChildren()) {
      return <span>-</span>;
    }
    if (this.isCurrency()) {
      return (
        <FormattedNumber
          style="currency"
          value={this.props.children}
          currency={this.props.currency}
          currencyDisplay="symbol"
        />
      );
    }

    return this.renderFormattedValue();
  }
}

export default injectIntl(FormatNumber);
