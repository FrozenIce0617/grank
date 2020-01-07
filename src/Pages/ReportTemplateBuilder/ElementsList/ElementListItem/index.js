// @flow
import * as React from 'react';
import BurgerIcon from 'icons/burger.svg?inline';
import RemoveIcon from 'icons/close-2.svg?inline';
import './element-list-item.scss';
import IconButton from 'Components/IconButton';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';

type Props = {
  title: string,
  elementIndex: number,
  element: any,
  onRemove: Function,
  onReplace: Function,
  editor: React.ComponentType<{ value: any, onChange: Function }>,
};

const DragHandle = SortableHandle(() => (
  <div className="drag-handle">
    <BurgerIcon />
  </div>
));

class ElementListItem extends React.PureComponent<Props> {
  handleRemove = () => {
    this.props.onRemove(this.props.elementIndex);
  };

  handleChange = element => {
    this.props.onReplace(element, this.props.elementIndex);
  };

  render() {
    const { editor, title, element } = this.props;
    const Editor = editor;
    return (
      <div className="element-list-item">
        <IconButton icon={<RemoveIcon />} className="remove-button" onClick={this.handleRemove} />
        <div className="header">
          <DragHandle />
          <div className="title">{title}</div>
        </div>
        <div className="element-container">
          <Editor value={element} onChange={this.handleChange} />
        </div>
      </div>
    );
  }
}

export default SortableElement(ElementListItem);
