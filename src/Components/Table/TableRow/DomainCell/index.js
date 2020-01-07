// @flow
import React, { Component } from 'react';

type Props = {
  keywordData: Object,
};

class DomainCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.keywordData !== this.props.keywordData;
  }

  render() {
    const {
      keywordData: {
        domain: { domain, displayName },
      },
    } = this.props;
    return <a>{displayName || domain}</a>;
  }
}

export default DomainCell;
