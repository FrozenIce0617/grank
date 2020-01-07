// @flow
import React, { Component } from 'react';
import cn from 'classnames';

import './formatted-domain-cell.scss';

type Props = {
  domain: string,
  displayName: string,
  faviconUrl: string,
};

class FormattedDomainCell extends Component<Props> {
  render() {
    const { domain, displayName, faviconUrl } = this.props;
    return (
      <div
        className={cn('formatted-domain-cell', {
          'with-display-name': displayName,
        })}
      >
        <img className="formatted-domain-cell-favicon" src={faviconUrl} />
        <span className="formatted-domain-cell-title">
          {displayName && [<strong key="name">{displayName}</strong>, <br key="br" />]}
          {domain}
        </span>
      </div>
    );
  }
}

export default FormattedDomainCell;
