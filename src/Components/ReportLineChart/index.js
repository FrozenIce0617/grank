// @flow
import * as React from 'react';

import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';
import colorScheme from 'Utilities/colors';

export const colors = colorScheme.defaultLines;

type DataPoint = {
  x: number,
  y: number,
};

type Seria = {
  name: string,
  points: DataPoint[],
};

type Props = {
  series: Seria[],
  reverseY?: boolean,
  animation?: boolean,
  noDataMessage: string,
};

const chartBaseConfig = {
  chart: {
    height: 350,
    marginTop: 10,
    marginRight: 20,
    marginBottom: 80,
    marginLeft: 50,
    colorCount: 13,
    zoomType: 'xy',
  },
  title: {
    text: '',
    style: {
      display: 'none',
    },
  },
  xAxis: {
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
    title: null,
  },
  legend: {
    enabled: true,
  },
  credits: {
    enabled: false,
  },
  tooltip: {
    shared: true,
    shadow: false,
  },
};

class ReportLineChart extends React.Component<Props> {
  exportContainer: ?HTMLDivElement;
  static defaultProps = {
    reverseY: false,
    animation: true,
  };

  renderSeries = () => {
    const { series } = this.props;
    return series.map((seriaData, index) => {
      const data = seriaData.points.map(point => [point.x, point.y]);
      return {
        name: seriaData.name,
        color: colors[index % colors.length],
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 1,
        },
        data,
      };
    });
  };

  renderChart() {
    const series = this.renderSeries();
    const chartConfig = {
      ...chartBaseConfig,
      yAxis: {
        reverse: this.props.reverseY,
        title: null,
      },
      plotOptions: {
        line: {
          marker: {
            enabled: true,
          },
        },
        series: {
          animation: this.props.animation,
        },
      },
      series,
      lang: {
        noData: this.props.noDataMessage,
      },
    };
    return <ReactHighcharts config={chartConfig} />;
  }

  render() {
    return (
      <div
        ref={container => (this.exportContainer = container)}
        className="line-chart chart-content"
      >
        <ExportButton content={() => this.exportContainer} />
        {this.renderChart()}
      </div>
    );
  }
}

export default ReportLineChart;
