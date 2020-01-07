// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { t } from 'Utilities/i18n';
import { changeLanguage, setLocaleDebug } from 'Actions/UserAction';

import { startLoading, finishLoading } from 'Actions/LoadingAction';
import { showModal, hideModal } from 'Actions/ModalAction';
import { startSlimLoading, finishSlimLoading } from 'Actions/SlimLoadingAction';

import './nav-top.scss';

import Logo from 'icons/logo.svg';

type Props = {
  changeLanguage: Function,
  setLocaleDebug: Function,
  startLoading: Function,
  finishLoading: Function,
  showModal: Function,
  hideModal: Function,
  startSlimLoading: Function,
  finishSlimLoading: Function,
  user: Object,
};

class NavTop extends Component<Props> {
  static defaultProps = {
    user: {
      debug: false,
    },
  };

  renderLanguageButtons() {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="development-button-wrapper">
          <button onClick={() => this.props.changeLanguage('da')}>{t('Danish')}</button>
          <button onClick={() => this.props.changeLanguage('en')}>{t('English')}</button>
          {this.props.user.debug ? (
            <button onClick={() => this.props.setLocaleDebug(false)}>
              {t('Disable locale debug')}
            </button>
          ) : (
            <button onClick={() => this.props.setLocaleDebug(true)}>
              {t('Enable locale debug')}
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  renderTestButtons() {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div>
          <button
            style={{ right: '0px', position: 'absolute', top: '200px', zIndex: '9999' }}
            onClick={() => this.props.startLoading({ loadingText: t('Processing payment') })}
          >
            {'start loading'}
          </button>
          <button
            style={{ right: '0px', position: 'absolute', top: '250px', zIndex: '9999' }}
            onClick={() => this.props.finishLoading()}
          >
            {'hide loading'}
          </button>
          <button
            style={{ right: '0px', position: 'absolute', top: '300px', zIndex: '9999' }}
            onClick={() => {
              this.props.finishLoading();
              this.props.showModal({ modalType: 'SelectPlan' });
            }}
          >
            {'show modal'}
          </button>
          <button
            style={{ right: '0px', position: 'absolute', top: '350px', zIndex: '9999' }}
            onClick={() => this.props.hideModal()}
          >
            {'hide modal'}
          </button>
          <button
            style={{ right: '0px', position: 'absolute', top: '400px', zIndex: '9999' }}
            onClick={() => this.props.startSlimLoading()}
          >
            {'show slim'}
          </button>
          <button
            style={{ right: '0px', position: 'absolute', top: '450px', zIndex: '9999' }}
            onClick={() => this.props.finishSlimLoading()}
          >
            {'hide slim'}
          </button>
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <header className="nav-bar-top">
        <div className="logo">
          <a href="https://app.accuranker.com/">
            <img src={Logo} alt={'AccuRanker'} />
          </a>
          {this.renderLanguageButtons()}
        </div>
        {this.renderTestButtons()}
      </header>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default connect(
  mapStateToProps,
  {
    changeLanguage,
    setLocaleDebug,
    startLoading,
    finishLoading,
    showModal,
    hideModal,
    startSlimLoading,
    finishSlimLoading,
  },
)(NavTop);
