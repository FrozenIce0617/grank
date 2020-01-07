// @flow
import * as React from 'react';
import cn from 'classnames';
import { Col, DropdownToggle, DropdownMenu, DropdownItem, Dropdown } from 'reactstrap';

// Components
import EyeIcon from 'icons/eye.svg?inline';
import EvolutionLabel from 'Components/EvolutionLabel';
import FormatNumber from 'Components/FormatNumber';
import { ConnectToAnalyticsAction } from 'Pages/Layout/ActionsMenu/Actions';

import './kpi-add.scss';

type Props = {
  className?: string,
  style?: Object,
  onClick: Function,
  device: string,
  els: {},
  fullWidth: boolean,
  activeEls: Array<{
    +id: string,
    +active: boolean,
  }>,
  analyticsConnected: boolean,
  connectToAnalytics: Function,
};

type State = {
  isOpen: boolean,
};

export default class KpiAdd extends React.Component<Props, State> {
  state = {
    isOpen: false,
  };

  render() {
    const {
      className,
      style,
      onClick,
      els,
      activeEls,
      device,
      fullWidth,
      analyticsConnected,
      connectToAnalytics,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <Dropdown
        isOpen={isOpen}
        toggle={() => this.setState({ isOpen: !isOpen })}
        className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3"
        style={{ display: 'flex', ...style }}
      >
        <DropdownToggle tag="div" className={cn('kpi-add', { full: fullWidth })}>
          <div className="kpi-add-inner">+</div>
        </DropdownToggle>
        <DropdownMenu className="kpi-add-ul-container">
          <ul className="kpi-add-ul">
            {Object.keys(els)
              .sort((a, b) => {
                const bActive = !!activeEls.filter(activeEl => activeEl.id === b).length;
                const aActive = !!activeEls.filter(activeEl => activeEl.id === a).length;
                return bActive ? -1 : aActive ? 1 : 0;
              })
              .map((el, i) => {
                const isActive = !!activeEls.filter(activeEl => activeEl.id === el).length;
                const isAnalyticsEl = el === 'analyticsVisitors' && !analyticsConnected;

                return (
                  <DropdownItem
                    tag="li"
                    key={i}
                    disabled={isActive || isAnalyticsEl}
                    className={cn('kpi-add-li', {
                      inactive: isActive || isAnalyticsEl,
                      analytics: isAnalyticsEl,
                    })}
                    onClick={() => !isActive && onClick({ ...els[el], id: el })}
                  >
                    <div className="kpi-add-li-inner">
                      <div className="kpi-add-name">{els[el].name}</div>

                      {connectToAnalytics && isAnalyticsEl ? (
                        <div
                          className="btn btn-brand-orange-gradient"
                          style={{ zIndex: 1, marginLeft: 15 }}
                          onClick={() => {
                            this.setState({ isOpen: false });
                            connectToAnalytics();
                          }}
                        >
                          Connect to analytics
                        </div>
                      ) : (
                        <div className="kpi-add-figures">
                          <div className="kpi-add-value">
                            <FormatNumber>{els[el].kpi[device].value}</FormatNumber>
                          </div>
                          <div className="kpi-add-evolution">
                            <EvolutionLabel
                              evolution={els[el].kpi[device].evolution}
                              inactive={isActive}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </DropdownItem>
                );
              })}
          </ul>
        </DropdownMenu>
      </Dropdown>
    );
  }
}
