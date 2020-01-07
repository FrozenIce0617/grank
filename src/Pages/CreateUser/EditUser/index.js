// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Toast from 'Components/Toast';
import UserForm from 'Pages/CreateUser';

import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';

type Props = {
  editUser: Function,
  match: Object,
  history: Object,
};

class EditUserForm extends Component<Props> {
  handleSubmit = ({ fullName, email, isOrgAdmin }) => {
    const id = this.props.id || this.props.match.params.id;
    const updateUserInput = {
      id,
      fullName,
      email,
      isOrgAdmin: !!isOrgAdmin,
    };

    return this.props
      .editUser({
        variables: {
          updateUserInput,
        },
      })
      .then(({ data: { updateUser: { user, errors } } }) => {
        if (!user) {
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('User updated'));
          this.props.history.push('/account/users');
        }
      });
  };

  render() {
    const id = this.props.id || this.props.match.params.id;
    return <UserForm id={id} onSubmit={this.handleSubmit} />;
  }
}

const performEditUserQuery = gql`
  mutation editUserForm_editUser($updateUserInput: UpdateUserInput!) {
    updateUser(input: $updateUserInput) {
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

export default compose(graphql(performEditUserQuery, { name: 'editUser' }))(EditUserForm);
