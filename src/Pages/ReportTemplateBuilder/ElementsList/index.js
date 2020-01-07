// @flow
import React, { Component } from 'react';
import ElementListItem from './ElementListItem';
import { getElementData } from '../ElementTypes';
import { SortableContainer } from 'react-sortable-hoc';
import type { ReportElement } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import './elements-list.scss';

type Props = {
  elements: Array<ReportElement>,
  onRemove: Function,
  onMove: Function,
  onReplace: Function,
};

const SortableList = SortableContainer(({ elements, onRemove, onReplace }) => (
  <div className="elements-list">
    {elements.length <= 0 && (
      <p className="alert alert-info">
        <strong>{t('You have not added any elements to this report template.')}</strong>
        <br />
        {t('Click the arrow to add an element to the template.')}
        <br />
        {t('Each element can be added several times with different settings.')}
      </p>
    )}
    {elements.map((element, index) => {
      const elementData = getElementData(element.type);
      return (
        <ElementListItem
          key={element.id}
          index={index}
          element={element}
          elementIndex={index}
          onRemove={onRemove}
          onReplace={onReplace}
          editor={elementData && elementData.editor}
          title={elementData && elementData.getTitle()}
        />
      );
    })}
  </div>
));

class ElementsList extends Component<Props> {
  handleSort = (args: { oldIndex: number, newIndex: number }) => {
    this.props.onMove(args.oldIndex, args.newIndex);
  };

  render() {
    const elements = this.props.elements;
    return (
      <SortableList
        helperClass="elements-sortable-helper"
        elements={elements}
        onRemove={this.props.onRemove}
        onReplace={this.props.onReplace}
        onSortEnd={this.handleSort}
        useDragHandle={true}
      />
    );
  }
}

export default ElementsList;
