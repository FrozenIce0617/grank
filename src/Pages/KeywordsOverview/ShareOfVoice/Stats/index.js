// @flow
import React, { Component } from 'react';
import DesktopIcon from 'icons/monitor-2.svg?inline';
import MobileIcon from 'icons/mobile-2.svg?inline';
import ArrowUp from 'icons/arrow-up.svg?inline';
import ArrowDown from 'icons/arrow-down.svg?inline';
import FormatNumber from 'Components/FormatNumber';
import { t } from 'Utilities/i18n';
import { isEmpty, reduce } from 'lodash';
import './stats.scss';
import cn from 'classnames';

const positions = {
  desktop: 0,
  mobile: 1,
};

const icons = {
  desktop: DesktopIcon,
  mobile: MobileIcon,
};

type Data = {
  desktop?: Object,
  mobile?: Object,
};

type Props = {
  data?: Data | null,
  showMobile: boolean,
  showDesktop: boolean,
  showPercentage: boolean,
};

class Stats extends Component<Props> {
  static defaultProps = {
    data: null,
    showPercentage: false,
  };

  formatData() {
    const { data, showPercentage } = this.props;
    if (!data) return [];

    return reduce(
      data,
      (acc, dataItem) => {
        acc[positions[dataItem.searchType]] = {
          id: dataItem.searchType,
          icon: icons[dataItem.searchType],
          value: !isEmpty(dataItem.shareOfVoice)
            ? dataItem.shareOfVoice[dataItem.shareOfVoice.length - 1]
            : 0,
          show: !(
            (dataItem.searchType === 'mobile' && !this.props.showMobile) ||
            (dataItem.searchType === 'desktop' && !this.props.showDesktop)
          ),
          delta: dataItem.shareOfVoiceChange,
          percent: showPercentage
            ? dataItem.shareOfVoicePercentageChange
            : dataItem.shareOfVoiceChangePercentage,
        };
        return acc;
      },
      [],
    );
  }

  render() {
    const { showPercentage } = this.props;
    const formattedData = this.formatData();
    return (
      <div className="overview-share-of-voice-stats">
        {formattedData.map(statItem => {
          let icon = null;
          let text = t('not changed');
          if (statItem.delta < 0) {
            icon = <ArrowDown className="icon" />;
            text = t('decreased');
          } else if (statItem.delta > 0) {
            icon = <ArrowUp className="icon" />;
            text = t('increased');
          }

          return (
            <div key={statItem.id} className="stats-item">
              <statItem.icon className="device-icon" />
              <div className="values">
                <div className="main-value">
                  {!showPercentage ? (
                    <FormatNumber>{statItem.value.shareOfVoice}</FormatNumber>
                  ) : (
                    <FormatNumber percentage precision={2}>
                      {statItem.value.shareOfVoicePercentage}
                    </FormatNumber>
                  )}
                </div>
                <div className="label">
                  {showPercentage
                    ? t('Percentage of total %s share of voice', statItem.id)
                    : t('Total %s share of voice', statItem.id)}
                </div>

                <div className="dashboard-evolution">
                  <span
                    className={cn('delta-value', {
                      decrease: statItem.delta < 0,
                      increase: statItem.delta > 0,
                    })}
                  >
                    {icon}
                    {!showPercentage ? (
                      <FormatNumber className="delta">{Math.abs(statItem.delta)}</FormatNumber>
                    ) : (
                      <FormatNumber className="delta" percentage precision={2}>
                        {statItem.percent}
                      </FormatNumber>
                    )}
                  </span>

                  {!showPercentage && statItem.delta !== 0 ? (
                    <div
                      className={cn('Kpi-evolution small', {
                        red: statItem.delta < 0,
                        green: statItem.delta > 0,
                      })}
                      style={{ marginLeft: 10 }}
                    >
                      {`${statItem.percent < 0 ? '' : '+'}${(statItem.percent * 100).toFixed(0)}%`}
                    </div>
                  ) : (
                    <span style={{ marginLeft: 10 }} />
                  )}
                </div>

                <div className="label">{t('Share of Voice %s', text)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Stats;
