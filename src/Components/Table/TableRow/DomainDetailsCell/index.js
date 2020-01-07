// @flow
import React, { Component } from 'react';
import DomainDetails from 'Components/DomainDetails';

type Props = {
  domainData: Object,
  small: boolean,
  reset: boolean,
};

class DomainDetailsCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.domainData !== this.props.domainData || nextProps.reset !== this.props.reset;
  }

  render() {
    const {
      domainData: { id, domain, displayName, faviconUrl, canUpdate },
      small,
    } = this.props;
    return (
      <DomainDetails
        domainId={id}
        canUpdate={canUpdate}
        title={displayName}
        domain={domain}
        logo={faviconUrl}
        reset={true}
        small={small}
      />
    );
  }
}

export default DomainDetailsCell;
