//@flow
import * as React from 'react';
import Raven from 'raven-js';
import { redirectToExternalUrl } from 'Utilities/underdash';
import cookies from 'react-cookies';

type Props = {
  isLast: boolean, // you shall not pass!
  children: any,
};

type State = {
  hasError: boolean,
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
  };

  componentDidCatch(error: Error, info: string) {
    this.setState({ hasError: true });
    Raven.captureException(error, { extra: info });

    if (this.props.isLast && !cookies.load('no-error')) {
      redirectToExternalUrl(`/app/error/500/${Raven.lastEventId()}`);
    }
  }

  render() {
    if (this.state.hasError && !this.props.isLast) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
