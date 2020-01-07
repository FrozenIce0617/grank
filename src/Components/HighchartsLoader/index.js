//@flow
import { loaderHTML } from 'Components/Loader';

import './highcharts-loader.scss';

export const updateLoader = (chart: Object, period?: number, isLoading?: boolean) =>
  isLoading
    ? chart.showLoading(
        loaderHTML({
          period,
          className: 'chart-loader-inner-container',
        }),
      )
    : chart.hideLoading();
