// @flow
import * as React from 'react';

// components
import LineChart from 'Components/LineChart';
import Watermark from 'Components/Watermark';
import ExportButton from 'Components/ExportButton';

// utils
import { populateDataWithZeros } from '../utils';

type KpiItemValue = {
  date: string,
  placement: string,
  campaign: string,
  amount: number,
};

type KpiItem = {
  title: string,
  data: [KpiItemValue],
  groupedData: [KpiItem],
};

type Props = {
  kpis: KpiItem[],
  startDate: string,
  endDate: string,
};

export default class AffiliateKpiGraph extends React.Component<Props> {
  exportContainer: ?React.ElementRef<any> = React.createRef();

  render() {
    const { kpis, startDate, endDate } = this.props;
    let series = [];

    if (kpis && kpis.length) {
      kpis.forEach(kpi => {
        kpi.groupedData.forEach(groupedData => {
          const item = {
            name: `${kpi.title} ${groupedData.title}`,
            data: populateDataWithZeros(groupedData.data, startDate, endDate).map(
              ({ date, amount }) => ({ x: date, y: amount }),
            ),
          };

          series.push(item);
        });
      });
    }

    series = series.sort((a, b) => a.title > b.title);

    // const series =
    //   kpis && kpis.length
    //     ? [
    //         ...kpis.map(item => {
    //           return {
    //             name: item.title,
    //             data: populateDataWithZeros(item.data, startDate, endDate).map(
    //               ({ date, amount }) => ({ x: date, y: amount }),
    //             ),
    //           };
    //         }),
    //       ].sort((a, b) => a.title > b.title)
    //     : [];

    console.log('series', series);
    return (
      <div className="chart-content" ref={this.exportContainer}>
        <Watermark big offset />
        <ExportButton small content={() => this.exportContainer.current} />
        <LineChart
          series={series}
          extendConfig={{
            chart: {
              backgroundColor: null,
              height: 400,
            },
            legend: {
              enabled: true,
            },
            yAxis:
              kpis && kpis.length
                ? kpis.map((item, idx) => ({
                    title: { text: item.title },
                    opposite: idx % 2,
                  }))
                : {
                    visible: true,
                  },
            plotOptions: {
              spline: {
                animation: false,
                lineWidth: 3,
              },
              series: {
                marker: {
                  symbol: 'circle',
                  enabled: false,
                  states: {
                    hover: {
                      radiusPlus: 3,
                      lineWidth: 3,
                    },
                  },
                },
                states: {
                  hover: {
                    animation: {
                      duration: 500,
                    },
                    enabled: true,
                    halo: {
                      size: 0,
                    },
                  },
                },
              },
            },
          }}
        />
      </div>
    );
  }
}
