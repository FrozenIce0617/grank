// @flow
import React, { Component } from 'react';

import './domain-item.scss';

type Props = {
  domain: string,
  displayName: string,
  faviconUrl: string,
  header?: boolean,
  headerText?: string,
};

class DomainItem extends Component<Props> {
  renderAsHeader = () => {
    const { headerText } = this.props;
    return (
      <div className="domain-item" style={{ marginTop: '5px' }}>
        <strong style={{ color: 'gray' }}>{headerText}</strong>
      </div>
    );
  };
  render() {
    const { domain, displayName, faviconUrl, header } = this.props;
    if (header) {
      return this.renderAsHeader();
    }
    return (
      <div className="domain-item">
        <div className="favicon-wrapper">
          <img className="favicon" src={faviconUrl} />
        </div>
        <div>
          <p className="Select-option-quickEl" style={{ color: '#313445' }}>
            {displayName || ''}{' '}
            <span style={{ marginLeft: '15px', fontWeight: '200', color: 'gray' }}>{domain}</span>
          </p>
        </div>
      </div>
    );
  }
}

export default DomainItem;
