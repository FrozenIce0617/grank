/* eslint-disable react/no-did-update-set-state */
// @flow
import React, { Component, Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import { Container, Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { startLoading, finishLoading } from 'Actions/LoadingAction';
import BasePublicPage from 'Pages/Layout/BasePublicPage';
import { graphqlOK } from 'Utilities/underdash';
import moment from 'moment';
import cn from 'classnames';

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';

import './releases-page.scss';

type Props = {
  releasesData: Object,

  startLoading: Function,
  finishLoading: Function,
};

type State = {
  firstLoad: boolean,
};

class ReleasesPage extends Component<Props, State> {
  state = {
    firstLoad: true,
  };

  componentDidMount() {
    this.props.startLoading({ loadingText: '', noBackdrop: true });
  }

  componentDidUpdate(prevProps) {
    if (this.state.firstLoad && !graphqlOK(prevProps) && graphqlOK(this.props)) {
      this.props.finishLoading();

      this.setState({
        firstLoad: false,
      });
    }
  }

  renderItems() {
    const { releasesData } = this.props;

    const items = releasesData.releaseLogs;

    return (
      <Fragment>
        {items.map(({ id, changes, version, createdAt }, idx) => (
          <div key={id} className="item-changes">
            <p className="font-weight-bold">
              v{version} <small className="text-muted">{moment(createdAt).format('L')}</small>
            </p>

            <FacebookShareButton url={`https://app.accuranker.com/app/releases?v=${version}`}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            <LinkedinShareButton url={`https://app.accuranker.com/app/releases?v=${version}`}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>

            <TwitterShareButton url={`https://app.accuranker.com/app/releases?v=${version}`}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <hr />

            <ReactMarkdown source={changes} className="markdown" />
          </div>
        ))}
      </Fragment>
    );
  }

  render() {
    return (
      <BasePublicPage showSideNavbar showFooter className="releases-page">
        <div className="releases-page-content">
          <Container>
            <h1>AccuRanker releases</h1>
            {graphqlOK(this.props) && this.renderItems()}
          </Container>
        </div>
      </BasePublicPage>
    );
  }
}

const releasesQuery = gql`
  query releasesPage_releaseLogs {
    releaseLogs {
      id
      createdAt
      version
      changes
    }
  }
`;

export default compose(
  connect(
    null,
    { startLoading, finishLoading },
  ),
  graphql(releasesQuery, {
    options: () => ({ fetchPolicy: 'network-only' }),
    props: ({ data, data: { releaseLogs } }) => {
      return {
        releasesData: {
          ...data,
          releaseLogs: releaseLogs
            ? releaseLogs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [],
        },
      };
    },
  }),
)(ReleasesPage);
