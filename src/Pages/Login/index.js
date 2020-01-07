// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Container } from 'reactstrap';
import { withApollo, compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import TemplateNavTop from 'Pages/Layout/TemplateNavTop';
import Button from 'Components/Forms/Button';

import Validator from 'Utilities/validation';
import { t } from 'Utilities/i18n';
import Storage from 'Utilities/storage';

type Props = {
  performLogin: Function,
  client: any,
  handleSubmit: Function,
};

class Login extends Component<Props> {
  renderField: Function;
  handleLogin: Function;

  handleLogin = values => {
    return this.props
      .performLogin({
        variables: {
          input: values,
        },
      })
      .then(({ data }) => {
        if (data.userLogin.token) {
          Storage.save('authToken', data.userLogin.token);
          // window.location = '/';
          alert('you are now logged in, refresh..');
        } else {
          // eslint-disable-next-line no-alert
          alert('Invalid username or password');
        }
      })
      .then(() => {
        this.props.client.resetStore();
      })
      .catch(error => {
        // eslint-disable-next-line no-alert
        alert(`something went wrong ${error}`);
      });
  };

  renderField = field => {
    const {
      meta: { touched, error },
    } = field;
    const className = `${touched && error ? 'invalid' : ''}`;
    const element = (
      <field.elementType
        className="form-control custom-form-control"
        type={field.type}
        placeholder={field.placeholder}
        {...field.input}
      />
    );

    return (
      <div className={className}>
        <label htmlFor={field.input.id} className={field.labelClassname}>
          {field.label}
        </label>
        {element}
        <span className="error-message">{touched ? error : ''}</span>
      </div>
    );
  };

  render() {
    const { handleSubmit } = this.props;

    return (
      <TemplateNavTop>
        <Container>
          <h1>{t('Login')}</h1>
          <form onSubmit={handleSubmit(this.handleLogin)}>
            <Field
              label={t('Username')}
              labelClassname="required"
              name="username"
              id="username"
              elementType="input"
              type="email"
              placeholder={t('Enter your username')}
              component={this.renderField}
              validate={Validator.required}
            />
            <Field
              label={t('Password')}
              labelClassname="required"
              name="password"
              id="password"
              elementType="input"
              type="password"
              placeholder={t('Enter your password')}
              component={this.renderField}
              validate={Validator.required}
            />
            <Button submit theme="grey">
              {t('Login')}
            </Button>
          </form>
        </Container>
      </TemplateNavTop>
    );
  }
}

const loginMutation = gql`
  mutation login_userLogin($input: LoginInput!) {
    userLogin(input: $input) {
      token
      errors {
        messages
        field
      }
    }
  }
`;

export default withApollo(
  compose(
    graphql(loginMutation, { name: 'performLogin' }),
    connect(
      null,
      {},
    ),
  )(
    reduxForm({
      form: 'LoginForm',
    })(Login),
  ),
);
