import union from 'lodash/union';

import { evolution as evoFunc } from 'Utilities/format';

export const formatData = ({ ownProps, data, key, name }) => {
  const { loading, error, refetch, keywords } = data;

  const {
    overviewPage: { fetchedCompetitors },
  } = ownProps;

  const valuesData =
    keywords && keywords.overview && keywords.overview.graphs
      ? keywords.overview.graphs[key]
      : false;

  const compareValueDesktop = valuesData ? valuesData.values.desktop.compareValue : 0;
  const valueDesktop =
    valuesData && valuesData.values.desktop.values[valuesData.values.desktop.values.length - 1]
      ? valuesData.values.desktop.values[valuesData.values.desktop.values.length - 1].value
      : 0;

  const compareValueMobile = valuesData ? valuesData.values.mobile.compareValue : 0;
  const valueMobile =
    valuesData && valuesData.values.mobile.values[valuesData.values.mobile.values.length - 1]
      ? valuesData.values.mobile.values[valuesData.values.mobile.values.length - 1].value
      : 0;

  const compareValueBoth = valuesData
    ? Object.keys(valuesData.values).reduce((a, b) => a + valuesData.values[b].compareValue || 0, 0)
    : 0;
  const valueBoth = valuesData
    ? Object.keys(valuesData.values)
        .map(
          el =>
            valuesData.values[el].values &&
            valuesData.values[el].values[valuesData.values[el].values.length - 1]
              ? valuesData.values[el].values[valuesData.values[el].values.length - 1].value
              : 0,
        )
        .reduce((a, b) => a + b)
    : 0;

  const kpi = {
    desktop: {
      compareValue: compareValueDesktop,
      value: valueDesktop,
      evolution: evoFunc(compareValueDesktop, valueDesktop),
    },
    mobile: {
      compareValue: compareValueMobile,
      value: valueMobile,
      evolution: evoFunc(compareValueMobile, valueMobile),
    },
    both: {
      compareValue: compareValueBoth,
      value: valueBoth,
      evolution: evoFunc(compareValueBoth, valueBoth),
    },
  };

  const curCompetitorValues =
    ownProps.kpis && ownProps.kpis[key] ? ownProps.kpis[key].competitorValues : [];

  const competitorValues =
    !!valuesData && valuesData.competitorValues
      ? union(curCompetitorValues, valuesData.competitorValues)
      : curCompetitorValues;

  const returnProps = {
    ...ownProps,
    kpis: {
      ...ownProps.kpis,
      [key]: {
        ...(ownProps.kpis ? ownProps.kpis[key] : {}),
        name,
        competitorValues,
        values: valuesData && valuesData.values,
        kpi,

        loading,
        error,
        refetch,
      },
    },
  };

  return { kpi, competitorValues, returnProps };
};

export const defaultFetchParams = props => {
  const {
    filters,
    overviewPage: { fetchedCompetitors },
  } = props;

  return {
    fetchPolicy: 'network-only',
    variables: {
      filters,
      competitors: fetchedCompetitors,
      getCompetitors: !!fetchedCompetitors.length,
      fakePagination: {
        page: 1,
        results: 25,
      },
      fakeOrdering: {
        order: 'ASC',
        orderBy: 'keyword',
      },
    },
  };
};

export const propsWithNewKpi = ({ kpi, competitorValues, data }) => ({});

export default formatData;
