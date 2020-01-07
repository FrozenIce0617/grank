// @flow
import React, { Component } from 'react';
import PieChart from 'Components/PieChart';
import './google-analytics.scss';
import { t } from 'Utilities/i18n/index';
import { map } from 'lodash';
import { startCase, toLower, toUpper } from 'lodash';
import colorScheme from 'Utilities/colors';

type Props = {
  data: Object,
  isLoading: boolean,
  period: number,
};

const colors = colorScheme.googleAnalytics;

type State = {
  useSmallLegend: boolean,
};

class GoogleAnalytics extends Component<Props, State> {
  media: Object;

  state = {
    useSmallLegend: false,
  };

  UNSAFE_componentWillMount() {
    this.media = matchMedia(`screen
                                and (min-width: 1300px)
                                and (max-width: 1600px`);

    if (this.media.matches) {
      this.handleChange({ matches: true });
    }

    this.media.addListener(this.handleChange);
  }
  componentWillUnmount() {
    this.media.removeListener(this.handleChange);
  }

  handleChange = ({ matches }: Object) => {
    this.setState({ useSmallLegend: matches });
  };

  generateData(data: Object) {
    if (!data) {
      return [];
    }

    const objData = { ...data };
    delete objData.__typename;

    return map(objData, (value, key) => ({
      name: key !== 'cpc' ? t(startCase(toLower(key))) : t(toUpper(key)),
      y: value,
      color: colors[key],
    }));
  }

  render() {
    const { data, isLoading, period } = this.props;

    const { useSmallLegend } = this.state;
    const legendWidth = useSmallLegend ? 140 : 0;

    const { traffic, goals, revenue } = data || {};

    const visitorsData = this.generateData(traffic);
    const goalsData = this.generateData(goals);
    const revenueData = this.generateData(revenue);
    return (
      <div className="google-analytics-chart">
        <div className="flex-row">
          <div className="flex-cell">
            <PieChart
              totalLabel={t('Visitors')}
              linkTo={'/keywords/list'}
              seriesLabel={t('Visitors')}
              data={visitorsData}
              isLoading={isLoading}
              period={period}
              noDataMessage={t('No visitor data for the selected period')}
              legendWidth={legendWidth}
              watermark
              watermarkBig
            />
          </div>
          <div className="flex-cell">
            <PieChart
              totalLabel={t('Goals')}
              linkTo={'/keywords/list'}
              seriesLabel={t('Goals')}
              data={goalsData}
              isLoading={isLoading}
              period={period}
              noDataMessage={t('No goal data for the selected period')}
              legendWidth={legendWidth}
              watermark
              watermarkBig
            />
          </div>
          <div className="flex-cell">
            <PieChart
              totalLabel={t('Revenue')}
              linkTo={'/keywords/list'}
              seriesLabel={t('Revenue')}
              currency={true}
              data={revenueData}
              isLoading={isLoading}
              period={period}
              noDataMessage={t('No revenue data for the selected period')}
              legendWidth={legendWidth}
              watermark
              watermarkBig
            />
          </div>
        </div>
      </div>
    );
  }
}

export default GoogleAnalytics;
