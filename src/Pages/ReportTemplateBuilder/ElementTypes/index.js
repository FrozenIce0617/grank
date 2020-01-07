// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { sortBy } from 'lodash';

import { addElement } from 'Actions/ReportTemplateAction';
import { buildElement, type ElementData } from '../getElementData';
import ElementType from './ElementType';
import underdash from 'Utilities/underdash';
import './element-types.scss';

type Props = {
  addElement: Function,
  data: Object,
};

type ElementViewData = {
  type: string,
  label: string,
  description: string,
};

let elementsDataMap = {};
export function getElementData(type: string): ElementData {
  return elementsDataMap[type];
}

class ElementTypes extends Component<Props> {
  elementTypes: Array<ElementViewData>;

  onAddHandler = (type: string) => {
    const defaultElement = getElementData(type).defaultValue;
    this.props.addElement(defaultElement);
  };

  handleData = () => {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return [];
    }
    const {
      data: { reportWidgets },
    } = this.props;
    const widgets = JSON.parse(reportWidgets);
    const elementsData = sortBy(widgets, 'order').map(widget => buildElement(widget));
    elementsDataMap = elementsData.reduce((currentVal, elementData) => {
      currentVal[elementData.defaultValue.type] = elementData;
      return currentVal;
    }, {});
    return elementsData;
  };

  render() {
    const elementsData = this.handleData();
    return (
      <div className="element-types">
        <div className="element-type-list">
          {elementsData.map(elementData => (
            <ElementType
              key={elementData.defaultValue.type}
              type={elementData.defaultValue.type}
              title={elementData.getTitle()}
              description={elementData.getDescription()}
              onAdd={this.onAddHandler}
            />
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const reportWidgetsQuery = gql`
  query elementTypes_reportWidgets {
    reportWidgets
  }
`;

export default compose(
  graphql(reportWidgetsQuery),
  connect(
    mapStateToProps,
    { addElement },
  ),
)(ElementTypes);
