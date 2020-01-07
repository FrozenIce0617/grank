/* eslint-disable react/no-did-update-set-state */
// @flow
import React, { Component } from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import { AutoSizer } from 'react-virtualized';
import { Table } from 'reactstrap';

// components
import Ellipsis from 'Components/Ellipsis';

// selectors
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';

// types
import type { CompetitorsVisibility } from 'Components/ShareOfVoice/Chart';

// utils
import { t } from 'Utilities/i18n';

import './competitors-legend.scss';

const competitorTooltipDelay = {
  show: 0,
  hide: 0,
};

type Props = {
  competitors: Object,
  competitorColors: Object,
  competitorsVisibility: CompetitorsVisibility,
  onChange: Function,
  isLoading: boolean,
};

class CompetitorsLegend extends Component<Props> {
  handleToggle = (itemId: string, domain: string) => {
    const { competitorsVisibility, onChange } = this.props;
    onChange(itemId, domain, !competitorsVisibility[itemId]);
  };

  renderTableBody(width) {
    const { competitorsVisibility, competitorColors } = this.props;
    const legendItems = this.props.competitors.map(competitor => ({
      label: competitor.domain,
      id: competitor.id,
      color: competitorColors[competitor.id],
    }));

    return (
      <div className="legend-items-list">
        <tbody>
          {legendItems.map(legendItem => {
            const inactive = !competitorsVisibility[legendItem.id];
            const pointStyle = !inactive ? { background: legendItem.color } : null;
            return (
              <tr
                key={legendItem.label}
                className="legend-item"
                onClick={() => this.handleToggle(legendItem.id, legendItem.label)}
              >
                <td className={cn('legend-item-cell ellipsis', { inactive })} style={{ width }}>
                  <div style={pointStyle} className="point" />
                  <Ellipsis forceShowTooltip tooltipDelay={competitorTooltipDelay}>
                    {legendItem.label}
                  </Ellipsis>
                </td>
              </tr>
            );
          })}
        </tbody>
      </div>
    );
  }

  renderLegendTable(width) {
    return (
      <Table key="table" className="data-table">
        <thead>
          <tr className="legend-item-header-row">
            <th className="legend-item-title">{t('Competitors')}</th>
          </tr>
        </thead>
        {this.renderTableBody(width)}
      </Table>
    );
  }

  renderNoData = () =>
    !this.props.isLoading &&
    !this.props.competitors.length && (
      <div key="no-data" className="no-data">
        {t('No competitors')}
      </div>
    );

  render() {
    return (
      <AutoSizer
        className="competitors-legend"
        style={{
          width: '100%',
          flex: 1,
        }}
      >
        {({ width }) => [this.renderLegendTable(width), this.renderNoData()]}
      </AutoSizer>
    );
  }
}

const mapStateToProps = state => {
  return {
    filters: RequiredFiltersSelector(state),
  };
};

export default connect(mapStateToProps)(CompetitorsLegend);
