// @flow
import uniqueId from 'lodash/uniqueId';

import {
  SET_STORED_SECTIONS,
  OVERVIEW_COMPONENT_LOADED,
  REGISTER_OVERVIEW_COMPONENT,
  HANDLE_SECTION_KPI_CLICK,
  ADD_SECTION_KPI,
  REMOVE_SECTION_KPI,
  TOGGLE_SECTION_KPI_ACTION,
  TOGGLE_SECTION_KPI_COMPETITOR,
  SET_SECTION_TITLE,
  ADD_EMPTY_SECTION,
  START_REMOVE_SECTION_ANIMATION,
  REMOVE_SECTION,
} from '../Actions/OverviewPageActions';
import type { Action } from 'Actions/OverviewPageActions';

import { toggleElInArr } from 'Utilities/format';

export type KpiSectionKpiType = {
  +id: string,
  +active: boolean,
};

export type KpiSectionType = {
  +type: string,
  +id: string,
  +title?: string | false,
  +competitors: boolean,
  +activeCompetitors: Array<string>,
  +shareYAxis: boolean,
  +device: string,
  +kpis: Array<KpiSectionKpiType>,
  +isRemoving?: boolean,
};

export type State = {
  +sections: Array<KpiSectionType>,
  +fetchedCompetitors: Array<string>,
};

const initialState: State = {
  fetchedCompetitors: [],
  sections: [
    {
      type: 'kpis',
      id: uniqueId('section-'),
      title: 'AccuRanker default template',
      competitors: true,
      activeCompetitors: [],
      shareYAxis: false,
      device: 'desktop',
      kpis: [
        {
          id: 'averageRank',
          active: false,
        },
        {
          id: 'shareOfVoice',
          active: true,
        },
      ],
    },
  ],
};

export default function(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SET_STORED_SECTIONS:
      return {
        ...state,
        sections: action.sections
          .filter(el => el.kpis.length)
          .map(el => ({ ...el, activeCompetitors: [] })),
      };

    case HANDLE_SECTION_KPI_CLICK:
      return {
        ...state,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          return {
            ...section,
            kpis: section.kpis.map(kpi => {
              if (kpi.id !== action.kpi.id) return kpi;
              return {
                ...kpi,
                active: !kpi.active,
              };
            }),
          };
        }),
      };

    case ADD_SECTION_KPI:
      return {
        ...state,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          return {
            ...section,
            kpis: [...section.kpis, { id: action.kpi.id, active: false }],
          };
        }),
      };

    case REMOVE_SECTION_KPI:
      return {
        ...state,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          const newKpis = section.kpis.filter(el => el.id !== action.kpi.id);
          return {
            ...section,
            kpis: newKpis,
            activeCompetitors: newKpis.length ? section.activeCompetitors : [],
          };
        }),
      };

    case TOGGLE_SECTION_KPI_ACTION:
      return {
        ...state,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          return {
            ...section,
            [action.el.prop]: action.el.id,
          };
        }),
      };

    case TOGGLE_SECTION_KPI_COMPETITOR:
      return {
        ...state,
        fetchedCompetitors: toggleElInArr(state.fetchedCompetitors, action.id, true).sort(),
        newCompetitor: action.id,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          return {
            ...section,
            activeCompetitors: toggleElInArr(section.activeCompetitors, action.id).sort(),
          };
        }),
      };

    case SET_SECTION_TITLE:
      return {
        ...state,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          return {
            ...section,
            title: action.value,
          };
        }),
      };

    case ADD_EMPTY_SECTION:
      const first = state.sections.slice(0, action.sectionIndex + 1);
      const last = state.sections.slice(action.sectionIndex + 1);

      return {
        ...state,
        sections: [
          ...first,
          {
            type: 'kpis',
            id: uniqueId('section-'),
            title: false,
            competitors: false,
            activeCompetitors: [],
            shareYAxis: false,
            device: 'desktop',
            kpis: [],
          },
          ...last,
        ],
      };

    case START_REMOVE_SECTION_ANIMATION:
      return {
        ...state,
        sections: state.sections.map((section, i) => {
          if (i !== action.sectionIndex) return section;
          return {
            ...section,
            isRemoving: true,
          };
        }),
      };

    case REMOVE_SECTION:
      return {
        ...state,
        sections: state.sections.filter((el, i) => i !== action.sectionIndex),
      };

    case REGISTER_OVERVIEW_COMPONENT:
      return {
        ...state,
        [action.payload.name]: {
          loaded: false,
        },
      };
    case OVERVIEW_COMPONENT_LOADED:
      return {
        ...state,
        [action.payload.name]: {
          loaded: true,
        },
      };
    default:
      return state;
  }
}
