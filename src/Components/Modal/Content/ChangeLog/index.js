// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { hideModal } from 'Actions/ModalAction';
import { Link } from 'react-router-dom';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';
import { compose, graphql } from 'react-apollo/index';
import User from 'Queries/user';
import { tct } from 'Utilities/i18n';
import { doAnyway } from 'Utilities/promise';
import moment from 'moment';

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';

import './change-log.scss';

type Props = {
  hideModal: Function,
  releases: Object,
  updateLastSeenReleaseId: Function,
  onConfirm: Function,
};

type State = {
  isLoading: boolean,
};

class ChangeLog extends Component<Props, State> {
  state = {
    isLoading: false,
  };

  getLastRelease = () => {
    const { releases } = this.props;
    return releases.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[
      releases.length - 1
    ];
  };

  handleConfirm = () => {
    const { onConfirm } = this.props;
    this.setState({ isLoading: true });
    this.props
      .updateLastSeenReleaseId({
        variables: { input: { lastSeenReleaseLogId: this.getLastRelease().id } },
      })
      .then(
        ...doAnyway(() => {
          this.setState({ isLoading: false });
        }),
      );
    onConfirm && onConfirm();
  };

  handleClose = () => {
    this.handleConfirm();
  };

  render() {
    const { releases } = this.props;
    const { isLoading } = this.state;

    const lastRelease = this.getLastRelease();

    return (
      <ModalBorder className="change-log" onClose={this.handleClose}>
        <p className="title">
          AccuRanker <span className="font-weight-bold">v{lastRelease.version}</span>
        </p>

        <FacebookShareButton
          url={`https://app.accuranker.com/app/releases?v=${lastRelease.version}`}
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <LinkedinShareButton
          url={`https://app.accuranker.com/app/releases?v=${lastRelease.version}`}
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>

        <TwitterShareButton
          url={`https://app.accuranker.com/app/releases?v=${lastRelease.version}`}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <hr />

        <p>
          {t(
            'We just released a new version of AccuRanker 🎉. You can read the release notes below and should you have any questions or comments, then feel free to message our support team.',
          )}
        </p>

        <ReactMarkdown source={lastRelease.changes} className="markdown" />

        <hr />

        {releases.length > 1 && (
          <div>
            <p className="alert alert-info">
              {tct(
                'Since your last visit we have released [releasesNumber] updates to AccuRanker! If you wish to read all the release notes click [link:here].',
                {
                  link: <Link onClick={this.handleConfirm} to={'/releases'} />,
                  releasesNumber: releases.length,
                },
              )}
            </p>
          </div>
        )}

        <div className="confirmation-button-wrapper text-right">
          <Button theme="orange" onClick={this.handleConfirm} disabled={isLoading}>
            {t('Continue to AccuRanker')}
          </Button>
        </div>
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(User.mutations.updateUserSettings, { name: 'updateLastSeenReleaseId' }),
)(ChangeLog);
