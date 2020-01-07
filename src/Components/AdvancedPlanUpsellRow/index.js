// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { t } from 'Utilities/i18n';
import './advanced-plan-upsell-row.scss';
import { range } from 'lodash';

type Props = {
  history: Object,
  startCell: number,
  cellsOffset?: number,
  height: number,
};

type State = {
  collapsed: boolean,
};

class AdvancedPlanUpsellRow extends Component<Props, State> {
  static defaultProps = {
    cellsOffset: Number.MAX_SAFE_INTEGER,
  };

  handleClick = () => {
    this.props.history.push('/billing/package/select');
  };

  renderUpsellCell() {
    const { cellsOffset, height } = this.props;
    return (
      <td
        className="advanced-plan-upsell-cell td-upsell-big"
        colSpan={cellsOffset}
        key="upsell-cell"
      >
        <div className="advanced-plan-upsell-label-container" style={{ height }}>
          <div className="advanced-plan-upsell-label">
            <h2>{t('Want More Metrics?')}</h2>
            <p>{t('Upgrade your plan to enable advanced metrics such as SoV Pro and more.')}</p>
            <Actions.UpgradeAction label={t('Upgrade plan')} />
          </div>
        </div>
      </td>
    );
  }

  render() {
    const { startCell } = this.props;
    return (
      <tr className="advanced-plan-upsell-row">
        {range(startCell).map(item => <td className="advanced-plan-upsell-cell" key={item} />)}
        {this.renderUpsellCell()}
      </tr>
    );
  }
}

export default withRouter(AdvancedPlanUpsellRow);
