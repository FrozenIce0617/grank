// @flow
import React, { PureComponent, type Element } from 'react';
import { withRouter } from 'react-router';

import NavTop from '../NavTop';
import FooterEmpty from '../FooterEmpty';

import './template-nav-top.scss';

type Props = {
  children: Element<*>,
};

class TemplateNavTop extends PureComponent<Props> {
  render() {
    return (
      <div className="checkout-page-wrapper">
        <NavTop />
        {this.props.children}
        <FooterEmpty />
      </div>
    );
  }
}

export default withRouter(TemplateNavTop);
