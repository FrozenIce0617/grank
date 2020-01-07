// @flow
import React, { Component } from 'react';
import { tct } from 'Utilities/i18n';
import { Link } from 'react-router-dom';
import './upsell-row.scss';

type Props = {
  isTrial: boolean,
  hasAdvancedMetricsFeature: boolean,
  columns: string[],
  style?: Object,
};

class UpsellRow extends Component<Props> {
  render() {
    const { style, columns } = this.props;
    const columnNames = columns.join(', ');

    return (
      <div className="upsell-row" style={style}>
        {tct(
          'The metrics in [columns] is available in the [link1:Professional], [link2:Expert] and [link3:Enterprise] plans.',
          {
            columns: <span>{columnNames}</span>,
            link1: <Link to={'/billing/package/select'} />,
            link2: <Link to={'/billing/package/select'} />,
            link3: <Link to={'/billing/package/select'} />,
          },
        )}
      </div>
    );
  }
}

export default UpsellRow;
