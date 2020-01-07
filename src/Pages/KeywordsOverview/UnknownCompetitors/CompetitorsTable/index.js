// @flow
import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import FormatNumber from 'Components/FormatNumber';
import Loader from 'Components/Loader';
import Checkbox from 'Components/Controls/Checkbox'; // fixed
import AddInlineButton from 'Components/AddInlineButton';

type Props = {
  data: any[],
  isLoading: boolean,
  period: number,
  selection: Set<number>,
  onChange: (selection: Set<number>) => void,
  onAddCompetitor: (domain: string) => void,
};

class CompetitorsTable extends Component<Props> {
  toggleSelection = (id: number) => {
    const newSelection = new Set(this.props.selection);
    if (this.props.selection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    this.props.onChange(newSelection);
  };

  renderResults = () => {
    const { data, selection } = this.props;
    return (
      <tbody>
        {data.sort((a, b) => b.y - a.y).map(competitor => {
          const isSelected = selection.has(competitor.id);
          const canBeAdded =
            !competitor.isKnownCompetitor && competitor.isValidDomainName && !competitor.ownDomain;
          return (
            <tr key={`unknown-comp-tab-id-${competitor.id}`}>
              <td>
                <Checkbox
                  checked={isSelected}
                  onChange={() => this.toggleSelection(competitor.id)}
                />
              </td>
              <td>
                <span className="competitor-color" style={{ background: competitor.color }} />
                <a
                  className={`competitor-name ${isSelected ? 'selected' : ''}`}
                  onClick={() => this.toggleSelection(competitor.id)}
                >
                  {competitor.name}
                </a>
                {canBeAdded && (
                  <div className="add-button-wrapper">
                    <AddInlineButton onClick={() => this.props.onAddCompetitor(competitor.name)} />
                  </div>
                )}
                {competitor.isKnownCompetitor && (
                  <span className="ml-2 badge badge-primary">{t('Competitor')}</span>
                )}
                {competitor.ownDomain && (
                  <span className="ml-2 badge badge-primary">{t('Your domain')}</span>
                )}
              </td>
              <td>
                <FormatNumber>{competitor.y}</FormatNumber>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  renderLoader = () => (
    <Loader
      className="loader-container"
      period={this.props.period}
      style={{ height: '244px', width: '400px' }}
    />
  );

  renderNoData = () => <div className="no-data-message">{t('No data for selected period')}</div>;

  render() {
    const { isLoading, data } = this.props;
    return (
      <div className="competitors-table">
        <Table className="data-table">
          <thead>
            <tr>
              <th className="selection" />
              <th>{t('Competitor Domain')}</th>
              <th className="weight">{t('Weight')}</th>
            </tr>
          </thead>
          {!isLoading && data.length > 0 && this.renderResults()}
        </Table>
        {isLoading && this.renderLoader()}
        {!isLoading && data.length === 0 && this.renderNoData()}
      </div>
    );
  }
}

export default CompetitorsTable;
