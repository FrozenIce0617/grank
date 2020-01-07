//@flow
import React, { Component } from 'react';
import ReactHighcharts from 'react-highcharts';
import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';
import { evolution, roundNumber } from 'Utilities/format';
import { ArrowUp, ArrowDown } from 'Pages/Keywords/Table/Icon/Icons';
import { injectIntl, intlShape } from 'react-intl';
import LabelWithHelp from 'Components/LabelWithHelp';
import colorScheme from 'Utilities/colors';

import { renamePropKey } from 'Utilities/format';
import { t } from 'Utilities/i18n/index';

import './line-chart.scss';

type Props = {
  series: Array<{
    type?: string,
    name?: string,
    data: Array<string | number>,
  }>,
  categories?: Array<string | number>,
  extendConfig: Object,
  label?: {
    text: string,
    helpTitle?: string,
    helpText?: string,
  },
  valueIsCurrency?: boolean,
  colors: Array<string>,
  intl: intlShape,
};

// prettier-ignore
const renderValAsCurrency = val => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

class LineChart extends Component<Props> {
  static defaultProps = {
    config: {},
    colors: colorScheme.defaultLines,
  };

  componentDidMount() {
    // Highlight lines on legend hover
    const Rh = ReactHighcharts.Highcharts;
    let each = Rh.each;

    if (Rh && each) {
      Rh.wrap(Rh.Legend.prototype, 'renderItem', function(proceed, item) {
        proceed.call(this, item);

        const isPoint = !!item.series;
        const collection = isPoint ? item.series.points : this.chart.series;
        const groups = isPoint ? ['graphic'] : ['group', 'markerGroup'];
        const element = item.legendGroup.element;

        element.onmouseover = function() {
          each(collection, seriesItem => {
            if (seriesItem !== item) {
              each(groups, group => {
                seriesItem[group].animate({ opacity: 0.2 }, { duration: 150 });
              });
            }
          });
        };
        element.onmouseout = function() {
          each(collection, seriesItem => {
            if (seriesItem !== item) {
              each(groups, group => {
                seriesItem[group].animate({ opacity: 1 }, { duration: 150 });
              });
            }
          });
        };
      });
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    let { series, ...props1 } = this.props;
    let { series2, ...props2 } = renamePropKey('series', 'series2', nextProps);
    if (!isEqual(props1, props2)) return true;
    if (series.length !== series2.length) return true;

    for (let i = 0; i < this.props.series.length; i++) {
      if (!nextProps.series[i] || !isEqual(this.props.series[i].data, nextProps.series[i].data))
        return true;
    }
    return false;
  }

  render() {
    const { series, categories, extendConfig, label, valueIsCurrency, colors, intl } = this.props;

    const baseConfig = {
      title: false,
      chart: {
        type: 'spline',
        height: 300,
        marginTop: 20,
        style: {
          fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
      },
      colors,
      series,
      xAxis: {
        title: false,
        categories,
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e %b',
          week: '%e %b',
          month: "%b '%y",
          year: '%Y',
        },
        lineColor: null,
        tickWidth: 0,
      },
      yAxis: {
        title: false,
      },
      tooltip: {
        shared: true,
        shadow: false,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E7',
        borderRadius: 0,
        borderWidth: 1,
        padding: 0,
        useHTML: true,
        headerFormat:
          '<div class="chart-tooltip-table"><div class="chart-tooltip-table-tr"><div class="chart-tooltip-table-th">{point.key}</div></div>',
        pointFormatter() {
          const prevValue = this.index > 0 ? this.series.data[this.index - 1].y || 0 : this.y;
          const evo = evolution(prevValue, this.y);
          return `<div class="chart-tooltip-table-tr">
            <div class="chart-tooltip-table-td">
                <span class="chart-tooltip-bullet" style="color: ${this.color};">●</span> ${
            this.series.name
          }
            </div>
            <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
              ${this.series.tooltipOptions.valuePrefix || ''}
              ${valueIsCurrency ? renderValAsCurrency(this.y) : intl.formatNumber(this.y)}
              ${this.series.tooltipOptions.valueSuffix || ''}
              ${
                !isNaN(evo)
                  ? `<span class="chart-tooltip-evolution ${
                      evo === 0 ? '' : evo > 0 ? 'green' : 'red'
                    }">${intl.formatNumber(roundNumber(evo, 2))}%</span>`
                  : ''
              }
            </div>
          </div>`;
        },
        footerFormat: '</div>',
        valueDecimals: 0,
        xDateFormat: '%b %e, %Y',
        hideDelay: 5,
      },
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
    };

    return (
      <div className="line-chart">
        {label && label.text ? (
          <LabelWithHelp
            helpTitle={label.helpTitle || label.text}
            help={label.helpText || t('No description.')}
          >
            {label.text}
          </LabelWithHelp>
        ) : null}
        <ReactHighcharts config={merge(baseConfig, extendConfig)} />
      </div>
    );
  }
}

export default injectIntl(LineChart);
