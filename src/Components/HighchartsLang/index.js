// @flow
import React from 'react';
import LocaleSelector from 'Selectors/LocaleSelector';
import { connect } from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import { t } from 'Utilities/i18n';

type Props = {
  fullLocale: string,
};

class HighchartsLang extends React.Component<Props> {
  UNSAFE_componentWillMount() {
    this.changeLang();
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (this.props.fullLocale !== props.fullLocale) {
      this.changeLang();
    }
  }

  changeLang = () => {
    ReactHighcharts.Highcharts.setOptions({
      lang: {
        downloadCSV: t('Download CSV'),
        downloadJPEG: t('Download JPEG'),
        downloadPDF: t('Download PDF document'),
        downloadPNG: t('Download PNG image'),
        downloadSVG: t('Download SVG vector image'),
        downloadXLS: t('Download XLS'),
        drillUpText: t('Back to {series.name}'),
        noData: t('No data to display'),
        printChart: t('Print chart'),
        resetZoom: t('Reset zoom'),
        resetZoomTitle: t('Reset zoom level 1:1'),
        loading: t('Loading...'),
      },
    });
  };

  render() {
    return null;
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
});

export default connect(mapStateToProps)(HighchartsLang);
