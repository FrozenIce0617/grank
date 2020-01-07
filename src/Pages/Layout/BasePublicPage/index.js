// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { t } from 'Utilities/i18n';
import { redirectToExternalUrl } from 'Utilities/underdash';
import cn from 'classnames';
import TopNavbar from 'Pages/Layout/DashboardTemplate/TopNavbar';
import SideNavbar from 'Pages/Layout/SideNavbar';
import Footer from '../FooterEmpty';

import AccurankerIcon from 'icons/logo-brand.svg';

import './base-public-page.scss';

type Props = {
  user: {
    isAuthenticated: boolean,
  },
  className?: string,
  children: any,
  showSideNavbar: boolean,
  showFooter: boolean,
};

class BasePublicPage extends Component<Props> {
  renderHeader() {
    const {
      user: { isAuthenticated },
    } = this.props;
    return (
      <Fragment>
        <img className="logo" src={AccurankerIcon} alt={'Accuranker API'} />
        <div
          className={cn('navigation', {
            'not-auth': !isAuthenticated,
          })}
        >
          {isAuthenticated ? (
            <TopNavbar />
          ) : (
            <button
              className="btn btn-brand-orange sign-in"
              onClick={() => redirectToExternalUrl(`/user/login/?next=${window.location.pathname}`)}
            >
              {t('Sign In')}
            </button>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const {
      className,
      children,
      showFooter,
      showSideNavbar,
      user: { isAuthenticated },
    } = this.props;
    const showSidebar = isAuthenticated && showSideNavbar;
    return (
      <div
        className={cn('base-public-page', className, {
          'with-side-navbar': showSidebar,
        })}
      >
        {!showSidebar && <div className="header-placeholder" />}
        <div className="header">{this.renderHeader()}</div>
        {showSidebar && <SideNavbar />}
        <div className="content">
          <div className="main-content">{children}</div>
          {showFooter && <Footer isFullWidth={!showSidebar} />}
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(BasePublicPage);
