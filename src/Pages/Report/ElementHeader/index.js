// @flow
import * as React from 'react';
import type { FilterBase } from 'Types/Filter';
import getFiltersPeriod from '../getFiltersPeriod';
import './report-element-header.scss';

type Props = {
  title: string,
  filters?: FilterBase[],
};

class ElementHeader extends React.Component<Props> {
  render() {
    const filterPeriod = this.props.filters ? getFiltersPeriod(this.props.filters) : '';
    return (
      <div className="report-element-header">
        <div className="title-row">
          <h5 className="title">{this.props.title}</h5>
          <div className="date-range">{filterPeriod}</div>
        </div>
        <hr />
      </div>
    );
  }
}

export default ElementHeader;
