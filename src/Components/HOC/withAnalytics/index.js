// @flow
import * as React from 'react';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router';
import { Fragment } from 'react';
import { PageView } from 'react-tag-manager';
import { updateTitleTag } from 'Utilities/titleTag';

type Match = {
  path: string,
};

type Props = {
  match: Match,
};

export default (Component: React.ComponentType<*>, getTitle: () => string) =>
  withRouter(
    class WithAnalytics extends React.Component<Props> {
      componentDidMount() {
        const {
          match: { path },
        } = this.props;
        const fullPath = `/app${path}`;
        ReactGA.pageview(fullPath);

        const _hsq = (window._hsq = window._hsq || []);
        _hsq.push(['setPath', fullPath]);
        _hsq.push(['trackPageView']);

        updateTitleTag({ prefix: '', content: getTitle() || '' });
      }

      render() {
        return (
          <Fragment>
            <PageView />
            <Component {...this.props} />
          </Fragment>
        );
      }
    },
  );
