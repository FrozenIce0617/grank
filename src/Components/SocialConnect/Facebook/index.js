// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Toast from 'Components/Toast';
import FacebookIcon from 'icons/facebook.svg?inline';

import underdash from 'Utilities/underdash';
import { t } from 'Utilities/i18n';

import '../social-connect.scss';

type Props = {
  socialFacebook: Object,
  disconnect: Function,
};

class FacebookButton extends Component<Props> {
  disconnect = () => {
    const input = {
      backend: 'facebook',
    };
    this.props
      .disconnect({ variables: { input } })
      .then(({ data: { userSocialAuthDisconnect: { user } } }) => {
        if (!user) {
          // handle fail
          Toast.error(t('Unable to disconnect from Facebook'));
        } else {
          // handle success
          Toast.success(t('Disconnected from Facebook'));
          this.props.socialFacebook.refetch();
        }
      });
  };

  render() {
    if (
      underdash.graphqlLoading({ ...this.props }) ||
      underdash.graphqlError({ ...this.props }) ||
      (!this.props.socialFacebook ||
        !this.props.socialFacebook.user ||
        !this.props.socialFacebook.user.socialAuths)
    ) {
      // TODO render skeleton
      return null;
    }
    const {
      socialFacebook: {
        user: {
          socialAuths: { facebook, facebookUrl },
        },
      },
    } = this.props;
    const text = facebook ? t('Disconnect from Facebook') : t('Connect with Facebook');
    const next = encodeURIComponent('/app/user/profile');
    const href = `${facebookUrl}?next=${next}`;

    const connectElement = (
      <a href={href} className="btn btn-block btn-facebook">
        <FacebookIcon className="social-profile-icon" />
        {' | '}
        {text}
      </a>
    );

    const disconnectElement = (
      <a onClick={this.disconnect} className="btn btn-facebook">
        <FacebookIcon className="social-profile-icon" />
        {' | '}
        {text}
      </a>
    );

    return facebook ? disconnectElement : connectElement;
  }
}

const socialFacebookQuery = gql`
  query facebookButton_socialAuths {
    user {
      id
      socialAuths {
        facebook
        facebookUrl
      }
    }
  }
`;

const disconnectQuery = gql`
  mutation facebookButton_disconnectSocialAuth($input: UserSocialAuthDisconnectInput!) {
    userSocialAuthDisconnect(input: $input) {
      user {
        id
      }
    }
  }
`;

export default compose(
  graphql(socialFacebookQuery, { name: 'socialFacebook' }),
  graphql(disconnectQuery, { name: 'disconnect' }),
)(FacebookButton);
