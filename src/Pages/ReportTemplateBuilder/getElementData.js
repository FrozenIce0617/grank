// @flow
import * as React from 'react';
import { sortBy, keys } from 'lodash';

import TextInput from 'Components/Controls/TextInput';
import TextArea from 'Components/Controls/TextArea';
import Checkbox from 'Components/Controls/Checkbox';
import Select from 'Components/Controls/Select';

export type ElementData = {
  defaultValue: any,
  editor: React.ComponentType<{ value: any, onChange: Function }>,
  getTitle: Function,
  getDescription: Function,
};

type Props = {
  onChange: Function,
  value: any,
};

type ServerWidget = {
  type: string,
  order: number,
  label: string,
  description: string,
  settings: ?Object,
};

type Setting = {
  key: string,
  type: string,
  label: string,
  value: any,
  order: ?number,
  values: Array<{ label: string, value: ?any }>,
};

export const elementsData = [];
const elementsDataMap = {};

const getElement = (key, type, description, value, changeHandler, values) => {
  switch (type) {
    case 'text':
      return (
        <TextInput
          key={key}
          placeholder={description}
          value={value || ''}
          onChange={changeHandler}
        />
      );
    case 'textarea':
      return (
        <TextArea
          key={key}
          placeholder={description}
          value={value || ''}
          onChange={changeHandler}
        />
      );
    case 'boolean':
      return (
        <Checkbox key={key} kind="toggle" name={key} checked={value} onChange={changeHandler}>
          {description}
        </Checkbox>
      );
    case 'select':
      return (
        <Select key={key} options={values} value={value} onChange={changeHandler}>
          {description}
        </Select>
      );

    default:
      // eslint-disable-next-line
      console.error('Type not handled:', type);
      break;
  }
};

type BooleanEvent = {
  type: 'boolean',
  event: SyntheticEvent<HTMLInputElement>,
};

type SelectEvent = {
  type: 'select',
  event: { label: string, value: string },
};

type TextEvent = {
  type: 'text' | 'textinput' | 'textarea',
  event: SyntheticEvent<HTMLInputElement>,
};

type EventType = TextEvent | SelectEvent | BooleanEvent;
// type EventType = SyntheticEvent<HTMLInputElement> | { label: string, value: string };

const getEventValue = (e: EventType) => {
  switch (e.type) {
    case 'boolean':
      return e.event.currentTarget.checked;
    case 'text':
    //fallthrough
    case 'textinput':
    //fallthrough
    case 'textarea':
      return e.event.currentTarget.value;
    case 'select':
      return e.event.value;
    default:
      return null;
  }
};

const buildReactComponent = (widget: ServerWidget) => (props: Props) => {
  const getChangeHandler = (type, key) => event => {
    const eventType: EventType = { type, event };
    props.onChange({
      ...props.value,
      [key]: getEventValue(eventType),
    });
  };

  const rows = [];
  const { value } = props;
  if (widget.settings) {
    const settings = widget.settings;
    sortBy(
      keys(settings).map(key => ({
        ...settings[key],
        key,
      })),
      'order',
    ).forEach((setting: Setting) => {
      const changeHandler = getChangeHandler(setting.type, setting.key);
      rows.push(
        getElement(
          setting.key,
          setting.type,
          setting.label,
          value[setting.key],
          changeHandler,
          setting.values,
        ),
      );
    });
  }
  return <div>{rows}</div>;
};

export const getDefaultValue = (widget: ServerWidget) => ({
  id: '',
  type: widget.type,
  // $FlowFixMe: widget.settings[key] is never null or undefined
  ...keys(widget.settings).reduce(
    (obj, key) => ({ ...obj, [key]: widget.settings[key].value }),
    {},
  ),
});

export const buildElement = (widget: ServerWidget) => {
  const defaultValue = getDefaultValue(widget);
  return {
    defaultValue,
    editor: buildReactComponent(widget),
    getTitle: () => widget.label,
    getDescription: () => widget.description,
  };
};

export default function getElementData(type: string): ElementData {
  return elementsDataMap[type];
}
