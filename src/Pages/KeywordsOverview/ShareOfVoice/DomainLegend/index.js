// @flow
import React, { Component, Fragment } from 'react';
import cn from 'classnames';
import { AutoSizer } from 'react-virtualized';
import { t } from 'Utilities/i18n';
import colorScheme from 'Utilities/colors';
import './domain-legend.scss';

import Ellipsis from 'Components/Ellipsis';

type Props = {
  isDesktopVisible: boolean,
  isMobileVisible: boolean,
  isKeywordModal: boolean,
  onToggle: Function,
  domain: string,
};

const DESKTOP = 'desktop';
const MOBILE = 'mobile';

class DomainLegend extends Component<Props> {
  legendItems = [
    {
      id: DESKTOP,
      label: t('Desktop'),
      color: colorScheme.deviceType.desktop,
    },
    {
      id: MOBILE,
      label: t('Mobile'),
      color: colorScheme.deviceType.mobile,
    },
  ];

  handleToggle = (id: string) => {
    const { onToggle } = this.props;
    onToggle(id);
  };

  renderLegendItem = ({ isVisible, color, label, onToggle, width, id }) => {
    if (this.props.isKeywordModal && id !== DESKTOP) return null;
    return (
      <div
        className={cn('legend-item ellipsis', { inactive: !isVisible })}
        style={{ width }}
        onClick={onToggle}
      >
        <div style={isVisible ? { background: color } : {}} className="point" />
        <Ellipsis forceShowTooltip tooltipDelay={{ show: 0, hide: 0 }}>
          {label}
        </Ellipsis>
      </div>
    );
  };

  getVisibility = id => {
    const { isDesktopVisible, isMobileVisible } = this.props;
    return {
      [DESKTOP]: isDesktopVisible,
      [MOBILE]: isMobileVisible,
    }[id];
  };

  render() {
    const { domain, isKeywordModal } = this.props;
    return (
      <AutoSizer
        className="domain-legend"
        style={{
          height: 'auto',
          width: '100%',
        }}
      >
        {({ width }) => (
          <Fragment>
            <div className="legend-title">{t('Domain')}</div>
            {this.legendItems.map(({ id, label, color }) =>
              this.renderLegendItem({
                isVisible: this.getVisibility(id),
                color,
                label: !isKeywordModal ? `${domain} (${label})` : `${domain}`,
                onToggle: () => this.handleToggle(id),
                width,
                id,
              }),
            )}
          </Fragment>
        )}
      </AutoSizer>
    );
  }
}

export default DomainLegend;
