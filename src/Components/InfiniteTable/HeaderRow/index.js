// @flow
import React, { Component } from 'react';

type Props = {
  className: string,
  width: number,
  children: any,
  onResize: (cellsWidths: { [id: string]: number }) => void,
};

class HeaderRow extends Component<Props> {
  row = React.createRef();

  componentDidUpdate(prevProps) {
    if (prevProps.width !== this.props.width && this.row.current) {
      const cellsWidths = {};
      Array.from(this.row.current.children).forEach(child => {
        const itemName = child.dataset.fixed;
        if (itemName) {
          const { width } = child.getBoundingClientRect();
          cellsWidths[itemName] = width;
        }
      });

      this.props.onResize(cellsWidths);
    }
  }

  render() {
    const { width, className } = this.props;

    return (
      <div className={className} style={{ width }} ref={this.row}>
        {this.props.children}
      </div>
    );
  }
}

export default HeaderRow;
