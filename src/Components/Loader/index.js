/* eslint-disable react/no-danger */
// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n';

import Backdrop from 'Components/Backdrop';

import { resetLoading } from 'Actions/LoadingAction';

import './loader.scss';
import cn from 'classnames';

type Props = {
  className?: string,
  loaderStack: number,
  loaderActive: boolean,
  loadingText: string,
  resetLoading: Function,
  isGlobal: boolean,
  noBackdrop: boolean,
  style?: Object,
  period?: number,
};

type LoaderProps = {
  className?: string,
  loadingText?: string,
  period?: number,
  noBackdrop?: boolean,
};

export const loaderHTML = (props: LoaderProps) => {
  const { period, className, noBackdrop } = props;
  const loadingText =
    props.loadingText || props.loadingText === ''
      ? props.loadingText
      : !period || (period && period < 30)
        ? t('Loading data, please wait a moment')
        : t('Loading data, this might take a while');
  return `
    <div class="${cn('loader-inner-container', className)}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="loading-logo-container">
        <g fill="#f89734" fill-rule="evenodd">
          <rect ry="9.197" y="4.877" x="4.18" height="78.314" width="89.462" fill="#fff" />
          <path d="M6.95 94.04C5.23 92.46.98 83.096 6.19 78.846c15.996-13.047 15.68-27.683 28.533-27.683 11.883 0 17.603 20.015 26.38 20.015 6.1 0 9.05-3.2 11.44-8.124 7.832-16.126 7.675-50.736 24.3-51.966 2.725-.2-3.097 82.54-3.097 82.54l-46.683 4.597S8.667 95.62 6.95 94.04z" />
          <rect class="animation-exposer" />
          <path d="M0 80.004C0 91.047 8.962 100 19.996 100h60.008C91.047 100 100 91.038 100 80.004V19.996C100 8.953 91.038 0 80.004 0H19.996C8.953 0 0 8.962 0 19.996v60.008zM6 78c0 8.837 7.164 16 16 16h56c8.837 0 16-7.164 16-16V22c0-8.837-7.164-16-16-16H22C13.163 6 6 13.164 6 22v56z" />
        </g>
      </svg>
      <div class="loading-bar-outer">
        <span class="loading-bar-inner" />
      </div>
      <div class="${cn('loading-text', { 'has-backdrop': !noBackdrop })}">
        ${loadingText}
      </div>
    </div>
  `;
};

class Loader extends Component<Props> {
  componentDidUpdate(prevProps) {
    if (
      this.props.isGlobal &&
      this.props.loaderStack === 0 &&
      prevProps.loaderStack !== this.props.loaderStack
    ) {
      this.props.resetLoading();
    }
  }

  wrapWithBackdrop = content => {
    const { isGlobal, noBackdrop, loaderActive } = this.props;
    return isGlobal && !noBackdrop ? (
      <Backdrop shown={loaderActive} className="loader-container">
        {content}
      </Backdrop>
    ) : (
      content
    );
  };

  render() {
    const { loadingText, period, noBackdrop, className, style } = this.props;
    return this.wrapWithBackdrop(
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{
          __html: loaderHTML({
            loadingText,
            period,
            noBackdrop,
          }),
        }}
      />,
    );
  }
}

const mapStateToProps = (
  {
    loadingOverlay: {
      active,
      stack,
      loadingProps: { loadingText, noBackdrop },
    },
  },
  props,
) =>
  props.isGlobal
    ? {
        loaderActive: active,
        loaderStack: stack,
        loadingText,
        noBackdrop,
      }
    : {};

export default connect(
  mapStateToProps,
  { resetLoading },
)(Loader);
