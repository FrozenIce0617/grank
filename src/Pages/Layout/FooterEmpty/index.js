//@flow
import React, { Component } from 'react';
import moment from 'moment';
import cn from 'classnames';

import Logo from 'icons/logo-brand.svg';

import './footer-empty.scss';

type Props = {
  isFullWidth: boolean,
};

class FooterEmpty extends Component<Props> {
  render() {
    return (
      <div className="footer-wrapper">
        <footer
          className={cn('empty', {
            'full-width': this.props.isFullWidth,
          })}
        >
          <div>
            <img className="logo" src={Logo} />
            <small>{`2013 - ${moment().year()} © AccuRanker. All Rights Reserved.`}</small>
          </div>
        </footer>
      </div>
    );
  }
}

export default FooterEmpty;
