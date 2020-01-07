// @flow
import {
  ADD_ELEMENT,
  REMOVE_ELEMENT,
  MOVE_ELEMENT,
  REPLACE_ELEMENT,
  RESET_TEMPLATE,
  RENAME_TEMPLATE,
  CHANGE_BRAND_COLOR,
  LOAD_TEMPLATE,
} from 'Actions/ReportTemplateAction';
import type { Action } from 'Actions/ReportTemplateAction';
import type { ReportElement } from 'Types/ReportElement';
import { uniqueId } from 'lodash';

type State = {
  +name: string,
  +color: string,
  +elements: Array<ReportElement>,
};

const initialState: State = {
  name: '',
  color: '#ff9e30',
  elements: [],
};

import { keys } from 'lodash';
export const getDefaultValue = (widget: Object) => ({
  id: '',
  type: widget.type,
  ...keys(widget.settings).reduce(
    (obj, key) => ({ ...obj, [key]: widget.settings[key].value }),
    {},
  ),
});

export default function(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ADD_ELEMENT: {
      const newElement = { ...action.element, id: uniqueId('report') };
      const newElements = [...state.elements, newElement];
      return { ...state, elements: newElements };
    }
    case REMOVE_ELEMENT: {
      const indexToRemove = action.index;
      const newElements = state.elements.filter((_, index) => index !== indexToRemove);
      return { ...state, elements: newElements };
    }
    case REPLACE_ELEMENT: {
      const indexToReplace = action.index;
      const newElement = action.element;
      const newElements = state.elements.map(
        (element, index) => (index === indexToReplace ? newElement : element),
      );
      return { ...state, elements: newElements };
    }
    case MOVE_ELEMENT: {
      const indexFrom = action.from;
      const indexTo = action.to;
      const elements = state.elements;
      const newElements = elements.filter((_, index) => index !== indexFrom);
      newElements.splice(indexTo, 0, elements[indexFrom]);
      return { ...state, elements: newElements };
    }
    case RENAME_TEMPLATE:
      return { ...state, name: action.name };
    case CHANGE_BRAND_COLOR:
      return { ...state, color: action.color };
    case RESET_TEMPLATE:
      return initialState;
    case LOAD_TEMPLATE:
      return {
        ...state,
        name: action.name,
        color: action.brandColor,
        elements: action.elements.map(element => ({
          ...getDefaultValue(element),
          id: uniqueId('report'),
        })),
      };

    default:
      return state;
  }
}
