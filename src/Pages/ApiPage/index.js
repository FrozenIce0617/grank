/* eslint-disable react/no-did-update-set-state */
// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RedocStandalone } from 'redoc';
import BasePublicPage from 'Pages/Layout/BasePublicPage';
import { startLoading, finishLoading } from 'Actions/LoadingAction';

import './api-page.scss';

type Props = {
  user: Object,

  startLoading: Function,
  finishLoading: Function,
};

type State = {
  spec?: Object,
  firstLoad: boolean,
};

class ApiPage extends Component<Props, State> {
  state = {
    spec: undefined,
    firstLoad: true,
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.firstLoad && !prevState.spec && this.state.spec) {
      this.props.finishLoading();

      this.setState({
        firstLoad: false,
      });
    }
  }

  componentDidMount() {
    this.props.startLoading({ loadingText: '', noBackdrop: true });

    this.loadSpec();
  }

  loadSpec() {
    fetch('/api/v4/docs/?format=openapi')
      .then(response => response.json())
      .then(spec => {
        this.setState({
          spec,
        });
      });
  }

  render() {
    return (
      <BasePublicPage className="api-page" showSideNavbar={false} showFooter={false}>
        {this.state.spec && (
          <RedocStandalone
            spec={this.state.spec}
            options={{
              hideLoading: true,
              noAutoAuth: true,
              nativeScrollbars: true,
              hideDownloadButton: true,
              scrollYOffset: 68,
              theme: {
                colors: {
                  main: '#f89537',
                },
                baseFont: {
                  family: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                },
                headingsFont: {
                  family: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                },
                rightPanel: {
                  backgroundColor: '#263238',
                },
              },
            }}
          />
        )}
      </BasePublicPage>
    );
  }
}

export default connect(
  null,
  { startLoading, finishLoading },
)(ApiPage);
