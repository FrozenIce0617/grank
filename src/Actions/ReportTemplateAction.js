// @flow
import type { ReportElement } from 'Types/ReportElement';

export const ADD_ELEMENT = 'add_element';
export const REMOVE_ELEMENT = 'remove_element';
export const MOVE_ELEMENT = 'move_element';
export const REPLACE_ELEMENT = 'replace_element';
export const RESET_TEMPLATE = 'reset_template';
export const RENAME_TEMPLATE = 'rename_template';
export const CHANGE_BRAND_COLOR = 'change_brand_color';
export const LOAD_TEMPLATE = 'load_template';

type AddElement = {
  type: typeof ADD_ELEMENT,
  element: ReportElement,
};

type RemoveElement = {
  type: typeof REMOVE_ELEMENT,
  index: number,
};

type MoveElement = {
  type: typeof MOVE_ELEMENT,
  from: number,
  to: number,
};

type ReplaceElement = {
  type: typeof REPLACE_ELEMENT,
  index: number,
  element: ReportElement,
};

type ResetTemplate = {
  type: typeof RESET_TEMPLATE,
};

type RenameTemplate = {
  type: typeof RENAME_TEMPLATE,
  name: string,
};

type ChangeBrandColor = {
  type: typeof CHANGE_BRAND_COLOR,
  color: string,
};

type LoadTemplate = {
  type: typeof LOAD_TEMPLATE,
  name: string,
  brandColor: string,
  elements: Array<Object>,
};

export type Action =
  | AddElement
  | MoveElement
  | RemoveElement
  | ReplaceElement
  | ResetTemplate
  | RenameTemplate
  | ChangeBrandColor;

export function addElement(element: ReportElement): AddElement {
  return {
    type: ADD_ELEMENT,
    element,
  };
}

export function removeElement(index: number): RemoveElement {
  return {
    type: REMOVE_ELEMENT,
    index,
  };
}

export function moveElement(from: number, to: number): MoveElement {
  return {
    type: MOVE_ELEMENT,
    from,
    to,
  };
}

export function replaceElement(element: ReportElement, index: number): ReplaceElement {
  return {
    type: REPLACE_ELEMENT,
    element,
    index,
  };
}

export function resetTemplate(): ResetTemplate {
  return {
    type: RESET_TEMPLATE,
  };
}

export function renameTemplate(name: string): RenameTemplate {
  return {
    type: RENAME_TEMPLATE,
    name,
  };
}

export function changeBrandColor(color: string): ChangeBrandColor {
  return {
    type: CHANGE_BRAND_COLOR,
    color,
  };
}

export function loadTemplate(
  name: string,
  brandColor: string,
  elements: Array<Object>,
): LoadTemplate {
  return {
    type: LOAD_TEMPLATE,
    name,
    brandColor,
    elements,
  };
}
