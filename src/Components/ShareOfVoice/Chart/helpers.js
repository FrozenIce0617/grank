// @flow
import { isEmpty, isEqual, sortBy, uniqBy } from 'lodash';
import { t } from 'Utilities/i18n';
import { intlShape } from 'react-intl';
import NotesIcon from 'icons/content-note.svg';
import colorScheme from 'Utilities/colors';

const notesColor = colorScheme.notes;
const NOTES_SERIES_NAME = 'notes';

const seriesCategories = ['desktop', 'mobile'];

const DESKTOP = 'Desktop';
const MOBILE = 'Mobile';

const mainColors = [
  colorScheme.deviceType.desktop,
  colorScheme.deviceType.mobile,
  colorScheme.deviceType.all,
];

type SeriesVisibilityType = {
  desktop: boolean,
  mobile: boolean,
};

type CompetitorsVisibilityType = { [id: string]: boolean };
type CompetitorColorsType = { [id: string]: string };

type SeriesDataItemType = {
  date: any,
  keywords: number,
  shareOfVoice: number,
  shareOfVoicePercentage: number,
};

type SeriesDataType = {
  mobile: SeriesDataItemType[],
  desktop: SeriesDataItemType[],
};

type CompetitorType = {
  data: SeriesDataType,
  domain: string,
};

type CompetitorsDataType = { [id: string]: CompetitorType };

export type PropsType = {
  domainId?: number,
  currentDomain?: string,
  competitorsData?: CompetitorsDataType,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
  data: SeriesDataType,
  height: any,
  customWrapper: boolean,
  competitorsVisibility?: CompetitorsVisibilityType,
  competitorColors?: CompetitorColorsType,
  history: Object,
  intl: intlShape,
  period: number,
  watermark: boolean,
  watermarkBig: boolean,
  isLoading: boolean,
  exportContainer: any,
  showPercentage: boolean,
  isOwnDomainDesktopVisible: boolean,
  isOwnDomainMobileVisible: boolean,
};

const getCompetitorSeriesConfig = (competitorId, idx, competitorData, competitorsVisibility) => {
  const { domain, data } = competitorData;
  const isVisible = !!competitorsVisibility[competitorId];

  return [
    {
      id: competitorId,
      name: `${domain} (${t('Desktop')})`,
      seriesItemData: data.desktop,
      index: idx,
      visibility: isVisible,
      isCompetitor: true,
    },
    {
      id: competitorId,
      name: `${domain} (${t('Mobile')})`,
      seriesItemData: data.mobile,
      index: idx,
      visibility: isVisible,
      isCompetitor: true,
    },
  ];
};

const generateSeriesItemConfig = (
  { id, name, symbol, seriesItemData, index, visibility: visible, isCompetitor = false },
  props,
) => {
  const { competitorColors, showPercentage } = props;
  const color =
    isCompetitor && competitorColors ? competitorColors[id] : mainColors[index % mainColors.length];

  const sovData = seriesItemData.map(({ date, shareOfVoice, keywords, shareOfVoicePercentage }) => {
    return [
      new Date(date).getTime(),
      showPercentage ? shareOfVoicePercentage : shareOfVoice,
      keywords,
    ];
  });
  return {
    id,
    name,
    color,
    className: isCompetitor ? 'competitor-seria' : 'current-seria',
    marker: {
      symbol,
      radius: 3,
    },
    data: sovData,
    visible,
  };
};

const toChartSeries = (seriesConfig: Array<any>, props: PropsType) =>
  seriesConfig.reduce(
    (
      acc,
      { id, name, symbol = 'circle', seriesItemData, index, visibility, isCompetitor },
      idx,
    ) => {
      if (seriesItemData) {
        acc.push(
          generateSeriesItemConfig(
            {
              id,
              name,
              symbol,
              seriesItemData,
              index: index !== null && index !== undefined ? index : idx,
              visibility,
              isCompetitor,
            },
            props,
          ),
        );
      }
      return acc;
    },
    [],
  );

const getCompetitorsSeriesConfig = props => {
  const { competitorsData, competitorsVisibility = {} } = props;
  return competitorsData
    ? Object.keys(competitorsData).reduce((acc, competitorId, idx) => {
        acc.push(
          ...getCompetitorSeriesConfig(
            competitorId,
            idx,
            competitorsData[competitorId],
            competitorsVisibility,
          ),
        );
        return acc;
      }, [])
    : [];
};

const getNotesSeriesData = notes =>
  sortBy(
    uniqBy(notes, 'createdAt').map(({ createdAt }) => [new Date(createdAt).getTime(), 0]),
    noteData => noteData[0],
  );

const getNotesSeries = props => {
  const { notes } = props;
  return notes
    ? [
        {
          id: NOTES_SERIES_NAME,
          name: NOTES_SERIES_NAME,
          yAxis: 1,
          data: getNotesSeriesData(notes),
          marker: {
            symbol: `url(${NotesIcon})`,
          },
          states: {
            hover: {
              lineWidthPlus: 0,
            },
          },
          color: notesColor,
          type: 'line',
          lineWidth: 0,
          tooltip: {
            headerFormat: '<div class="chart-tooltip-label">{point.key}</div>',
            pointFormatter: () => '<span />',
          },
        },
      ]
    : [];
};

const isDataUpdated = (oldData: SeriesDataType, newData: SeriesDataType) =>
  !(
    oldData === newData ||
    seriesCategories.some(name => {
      const oldItem = oldData[name];
      const newItem = newData[name];
      if (!oldItem || !newItem) {
        return oldItem !== newItem;
      }

      return (
        oldItem.length === newItem.length &&
        oldItem.some((item, idx) => {
          const other = newItem[idx];
          return (
            item && other && item.date === other.date && item.shareOfVoice === other.shareOfVoice
          );
        })
      );
    })
  );

const getCategories = (data: SeriesDataType) =>
  data ? seriesCategories.filter(category => data[category]) : [];

const updateMainSeries = (
  chart: Object,
  data: SeriesDataType,
  oldSeries: SeriesVisibilityType,
  newSeries: SeriesVisibilityType,
  isLoadingOld: boolean,
  isLoading: boolean,
) => {
  let redraw = false;
  getCategories(data).forEach((key, idx) => {
    if (isLoadingOld !== isLoading) {
      if (chart.series && chart.series[idx]) {
        chart.series[idx].setVisible(!isLoading, false);
      }
      redraw = true;
    } else if (oldSeries[key] !== newSeries[key]) {
      chart.series[idx].setVisible(newSeries[key], false);
      redraw = true;
    }
  });

  return redraw;
};

const addCompetitorSeries = (
  chart: Object,
  competitorId: string,
  competitorIndex: number,
  competitorData?: CompetitorType,
  competitorsVisibility: CompetitorsVisibilityType,
  props: PropsType,
) => {
  competitorData &&
    toChartSeries(
      getCompetitorSeriesConfig(
        competitorId,
        competitorIndex,
        competitorData,
        competitorsVisibility,
      ),
      props,
    ).forEach(config => chart.addSeries(config));
};

const reAddCompetitorSeries = (
  chart: Object,
  competitorId: string,
  competitorIndex: number,
  competitorData?: CompetitorType,
  competitorsVisibility: CompetitorsVisibilityType,
  props,
) => {
  // Remove all competitor series
  while (chart.get(competitorId)) {
    chart.get(competitorId).remove();
  }

  // Add new competitor series
  addCompetitorSeries(
    chart,
    competitorId,
    competitorIndex,
    competitorData,
    competitorsVisibility,
    props,
  );
};

const updateCompetitorsSeries = (
  chart: Object,
  competitorsVisibility: CompetitorsVisibilityType = {},
  oldCompetitorsData?: CompetitorsDataType = {},
  newCompetitorsData?: CompetitorsDataType = {},
  props: PropsType,
) => {
  let redraw = false;
  if (isEmpty(newCompetitorsData)) {
    return redraw;
  }

  const competitors = Object.keys(newCompetitorsData);
  competitors.forEach((competitorId: string, competitorIndex) => {
    const chartItem = chart.get(competitorId);

    if (!chartItem) {
      // Add competitor series if no series with competitorId are presented
      addCompetitorSeries(
        chart,
        competitorId,
        competitorIndex,
        newCompetitorsData && newCompetitorsData[competitorId],
        competitorsVisibility,
        props,
      );
      redraw = true;
    } else {
      const oldSeriesData = oldCompetitorsData[competitorId].data;
      const newSeriesData = newCompetitorsData[competitorId].data;

      // Check if the data is updated for the series with given competitorId
      if (isDataUpdated(oldSeriesData, newSeriesData)) {
        reAddCompetitorSeries(
          chart,
          competitorId,
          competitorIndex,
          newCompetitorsData && newCompetitorsData[competitorId],
          competitorsVisibility,
          props,
        );
        redraw = true;
        return;
      }

      // Update visibility if visibility has changed
      getCategories(newSeriesData).forEach((key, idx) => {
        const isVisible = competitorsVisibility[competitorId];
        const seriesItem = chart.series[chartItem.index + idx];

        if (seriesItem.visible !== isVisible) {
          seriesItem.setVisible(isVisible, false);
          redraw = true;
        }
      });
    }
  });
  return redraw;
};

const withDomain = (category, currentDomain) => {
  return currentDomain ? `${currentDomain} (${category})` : category;
};

const getMainSeriesConfig = props => {
  const {
    data: { mobile, desktop } = {},
    isOwnDomainDesktopVisible,
    isOwnDomainMobileVisible,
    currentDomain,
  } = props;
  return [
    {
      id: DESKTOP,
      name: withDomain(t(DESKTOP), currentDomain),
      seriesItemData: desktop,
      visibility: isOwnDomainDesktopVisible,
    },
    {
      id: MOBILE,
      name: withDomain(t(MOBILE), currentDomain),
      seriesItemData: mobile,
      visibility: isOwnDomainMobileVisible,
    },
  ];
};

const getChartSeries = props =>
  toChartSeries(getMainSeriesConfig(props).concat(getCompetitorsSeriesConfig(props)), props).concat(
    getNotesSeries(props),
  );

const updateNotesSeries = (chart: Object, oldNotes: Object[], notes: Object[]) => {
  if (!isEqual(oldNotes, notes)) {
    const notesSeriesItem = chart.get(NOTES_SERIES_NAME);
    notesSeriesItem.setData(getNotesSeriesData(notes));
    return true;
  }
};

export default {
  getChartSeries,
  updateNotesSeries,
  updateCompetitorsSeries,
  updateMainSeries,
  // constants
  NOTES_SERIES_NAME,
  DESKTOP,
  MOBILE,
};
