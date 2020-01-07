// @flow
import type { SwitchEl } from 'Components/Switch/types';

export const SET_STORED_SECTIONS = 'SET_STORED_SECTIONS';
export const HANDLE_SECTION_KPI_CLICK = 'HANDLE_SECTION_KPI_CLICK';
export const ADD_SECTION_KPI = 'ADD_SECTION_KPI';
export const REMOVE_SECTION_KPI = 'REMOVE_SECTION_KPI';
export const TOGGLE_SECTION_KPI_ACTION = 'TOGGLE_SECTION_KPI_ACTION';
export const TOGGLE_SECTION_KPI_COMPETITOR = 'TOGGLE_SECTION_KPI_COMPETITOR';
export const SET_SECTION_TITLE = 'SET_SECTION_TITLE';
export const ADD_EMPTY_SECTION = 'ADD_EMPTY_SECTION';
export const START_REMOVE_SECTION_ANIMATION = 'START_REMOVE_SECTION_ANIMATION';
export const REMOVE_SECTION = 'REMOVE_SECTION';
export const REGISTER_OVERVIEW_COMPONENT = 'registerOverviewComponent';
export const OVERVIEW_COMPONENT_LOADED = 'overviewComponentLoaded';

import type { KpiSectionType } from 'Reducers/OverviewPageReducer';

type KpiType = { id: string | number };

type KpiHandler = {
  type: string,
  sectionIndex: number,
  kpi: KpiType,
};

type SectionsHandler = {
  type: string,
  sections: Array<KpiSectionType>,
};

type KpiActionHandler = {
  type: string,
  sectionIndex: number,
  el: SwitchEl,
};

type KpiCompetitorHandler = {
  type: string,
  sectionIndex: number,
  id: string,
};

type SectionHandler = { type: string, sectionIndex: number };

type SectionTitleHandler = { type: string, sectionIndex: number, value: string };

type OverviewRegistration = {
  type: string,
  payload: { name: string },
};

export type Action =
  | KpiHandler
  | KpiActionHandler
  | OverviewRegistration
  | KpiCompetitorHandler
  | SectionTitleHandler
  | SectionsHandler;

export const setStoredSections = (sections: Array<KpiSectionType>): SectionsHandler => ({
  type: SET_STORED_SECTIONS,
  sections,
});

export const handleSectionKpiClick = (sectionIndex: number, kpi: KpiType): KpiHandler => ({
  type: HANDLE_SECTION_KPI_CLICK,
  sectionIndex,
  kpi,
});

export const addSectionKpi = (sectionIndex: number, kpi: KpiType): KpiHandler => ({
  type: ADD_SECTION_KPI,
  sectionIndex,
  kpi,
});

export const removeSectionKpi = (sectionIndex: number, kpi: KpiType): KpiHandler => ({
  type: REMOVE_SECTION_KPI,
  sectionIndex,
  kpi,
});

export const toggleSectionKpiAction = (sectionIndex: number, el: SwitchEl): KpiActionHandler => ({
  type: TOGGLE_SECTION_KPI_ACTION,
  sectionIndex,
  el,
});

export const toggleSectionKpiCompetitor = (
  sectionIndex: number,
  id: string,
): KpiCompetitorHandler => ({
  type: TOGGLE_SECTION_KPI_COMPETITOR,
  sectionIndex,
  id,
});

export const setSectionTitle = (sectionIndex: number, value: string): SectionTitleHandler => ({
  type: SET_SECTION_TITLE,
  sectionIndex,
  value,
});

export const addEmptySection = (sectionIndex: number): SectionHandler => ({
  type: ADD_EMPTY_SECTION,
  sectionIndex,
});

export const startRemoveSectionAnimation = (sectionIndex: number): SectionHandler => ({
  type: START_REMOVE_SECTION_ANIMATION,
  sectionIndex,
});

export const removeSection = (sectionIndex: number): SectionHandler => ({
  type: REMOVE_SECTION,
  sectionIndex,
});

export function registerOverviewComponent(name: string): OverviewRegistration {
  return {
    type: REGISTER_OVERVIEW_COMPONENT,
    payload: { name },
  };
}

export function overviewComponentLoaded(name: string): OverviewRegistration {
  return {
    type: OVERVIEW_COMPONENT_LOADED,
    payload: { name },
  };
}
