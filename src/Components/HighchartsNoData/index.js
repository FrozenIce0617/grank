import './highcharts-no-data.scss';
import ReactHighcharts from 'react-highcharts';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

// Enable no-data module for Highcharts
NoDataToDisplay(ReactHighcharts.Highcharts);
