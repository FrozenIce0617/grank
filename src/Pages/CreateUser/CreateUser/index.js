// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Toast from 'Components/Toast';
import UserForm from 'Pages/CreateUser';

import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';

type Props = {
  createUser: Function,
  data: Object,
  history: Object,
};

class CreateUserForm extends Component<Props> {
  handleSubmit = ({ fullName, email, isOrgAdmin }) => {
    const {
      data: {
        user: {
          organization: { id: orgid },
        },
      },
    } = this.props;
    const inviteUserInput = {
      fullName,
      email,
      isOrgAdmin: !!isOrgAdmin,
      organization: orgid,
    };

    return this.props
      .createUser({
        variables: {
          inviteUserInput,
        },
      })
      .then(({ data: { inviteUser: { user, errors } } }) => {
        if (!user) {
          Toast.error('Something went wrong');
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('User invited'));
          this.props.history.push('/account/users');
        }
      });
  };

  render() {
    return <UserForm onSubmit={this.handleSubmit} />;
  }
}

const performCreateUserQuery = gql`
  mutation createUserForm_inviteUser($inviteUserInput: InviteUserInput!) {
    inviteUser(input: $inviteUserInput) {
      user {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

const organizationQuery = gql`
  query createUserForm_organizationId {
    user {
      organization {
        id
      }
    }
  }
`;

export default compose(
  graphql(performCreateUserQuery, { name: 'createUser' }),
  graphql(organizationQuery),
)(CreateUserForm);
