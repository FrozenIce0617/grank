// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import { withRouter } from 'react-router-dom';
import Button from 'Components/Forms/Button';
import './advanced-plan-upsell-chart.scss';

type Props = {
  history: Object,
  title?: string,
  subTitle?: string,
  subSubTitle?: string,
  onCollapse: Function,
  collapsed: boolean,
};

class AdvancedPlanUpsellChart extends Component<Props> {
  handleUpgrade = () => {
    this.props.history.push('/billing/package/select');
  };

  handleToggleDetails = evt => {
    evt.preventDefault();
    const { onCollapse } = this.props;
    onCollapse();
  };

  render() {
    const { collapsed, title, subTitle, subSubTitle } = this.props;
    return (
      <div className="advanced-plan-upsell-chart">
        <h2>{title || t('Want More Metrics?')}</h2>
        {!collapsed ? (
          [
            <p key="title">
              {subTitle ||
                t('Upgrade your plan to enable advanced metrics such as SoV Pro and more.')}
              <br />
              <i>{subSubTitle}</i>
            </p>,
            <Button key="upgrade" onClick={this.handleUpgrade} theme="orange">
              {t('Upgrade plan')}
            </Button>,
            <p key="link" className="mt-2">
              <a
                className="advanced-plan-upsell-show-link"
                tabIndex={0}
                onClick={this.handleToggleDetails}
              >
                {t('Close')}
              </a>
            </p>,
          ]
        ) : (
          <a
            className="advanced-plan-upsell-show-link"
            tabIndex={0}
            onClick={this.handleToggleDetails}
          >
            {t('Click to read more')}
          </a>
        )}
      </div>
    );
  }
}

export default withRouter(AdvancedPlanUpsellChart);
