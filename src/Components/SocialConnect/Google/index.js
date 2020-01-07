// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Toast from 'Components/Toast';
import GooglePlusIcon from 'icons/google-plus.svg?inline';

import underdash from 'Utilities/underdash';
import { t } from 'Utilities/i18n';

import '../social-connect.scss';

type Props = {
  socialGoogle: Object,
  disconnect: Function,
};

class GoogleButton extends Component<Props> {
  disconnect = () => {
    const input = {
      backend: 'google_oauth2',
    };
    this.props
      .disconnect({ variables: { input } })
      .then(({ data: { userSocialAuthDisconnect: { user } } }) => {
        if (!user) {
          // handle fail
          Toast.error(t('Unable to disconnect from Google'));
        } else {
          // handle success
          Toast.success(t('Disconnected from Google'));
          this.props.socialGoogle.refetch();
        }
      });
  };

  render() {
    if (
      underdash.graphqlLoading({ ...this.props }) ||
      underdash.graphqlError({ ...this.props }) ||
      (!this.props.socialGoogle ||
        !this.props.socialGoogle.user ||
        !this.props.socialGoogle.user.socialAuths)
    ) {
      // TODO render skeleton
      return null;
    }

    const {
      socialGoogle: {
        user: {
          socialAuths: { googleOauth2, googleOauth2Url },
        },
      },
    } = this.props;
    const text = googleOauth2 ? t('Disconnect from Google') : t('Connect with Google');
    const next = encodeURIComponent('/app/user/profile');
    const href = `${googleOauth2Url}?next=${next}`;

    const connectElement = (
      <a href={href} className="btn btn-block btn-google-plus">
        <GooglePlusIcon className="social-profile-icon" />
        {' | '}
        {text}
      </a>
    );

    const disconnectElement = (
      <a onClick={this.disconnect} className="btn btn-google-plus">
        <GooglePlusIcon className="social-profile-icon" />
        {' | '}
        {text}
      </a>
    );

    return googleOauth2 ? disconnectElement : connectElement;
  }
}

const socialGoogleQuery = gql`
  query googleButton_socialAuths {
    user {
      id
      socialAuths {
        googleOauth2
        googleOauth2Url
      }
    }
  }
`;

const disconnectQuery = gql`
  mutation googleButton_disconnectSocialAuth($input: UserSocialAuthDisconnectInput!) {
    userSocialAuthDisconnect(input: $input) {
      user {
        id
      }
    }
  }
`;

export default compose(
  graphql(socialGoogleQuery, { name: 'socialGoogle' }),
  graphql(disconnectQuery, { name: 'disconnect' }),
)(GoogleButton);
