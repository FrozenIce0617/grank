// @flow
import React, { type Element, Component } from 'react';

import config from 'config';

type Props = {
  href: string,
  children: Element<*>,
};

export default class AtoDjango extends Component<Props> {
  render() {
    const href = `${config.baseUrl}${this.props.href}`;
    const newProps = { ...this.props, href };
    return <a {...newProps}>{this.props.children}</a>;
  }
}
